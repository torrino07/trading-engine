const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");

if (process.argv.length < 4) {
  console.error("Usage: node archiveS3.js <region> <bucketName>");
  process.exit(1);
}

const region = process.argv[2];
const bucketName = process.argv[3];

AWS.config.update({ region });
const s3 = new AWS.S3();

const logsBaseDir = path.join(__dirname, "../marketdata");

function isOlderThanOneHour(filePath) {
  const stats = fs.statSync(filePath);
  const lastModifiedTime = stats.mtimeMs;
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  return lastModifiedTime < oneHourAgo;
}

function buildS3Key(localFilePath) {
  const relativePath = path.relative(logsBaseDir, localFilePath);
  return relativePath.replace(/\\/g, "/");
}

async function uploadAndRemoveFile(localFilePath, s3Key) {
  const fileContent = fs.readFileSync(localFilePath);

  await s3
    .putObject({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileContent,
    })
    .promise();

  fs.unlinkSync(localFilePath);
  console.log(`Uploaded and removed: ${localFilePath} => s3://${bucketName}/${s3Key}`);
}

function archiveOldBinlogs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      archiveOldBinlogs(fullPath);
    } 
    else if (entry.isFile() && entry.name.endsWith(".binlog")) {
      if (isOlderThanOneHour(fullPath)) {
        const s3Key = buildS3Key(fullPath);
        uploadAndRemoveFile(fullPath, s3Key).catch((err) => {
          console.error(`Failed to upload file ${fullPath}:`, err);
        });
      }
    }
  }
}

(async function main() {
  try {
    archiveOldBinlogs(logsBaseDir);
  } catch (error) {
    console.error("Error archiving logs:", error);
    process.exit(1);
  }
})();