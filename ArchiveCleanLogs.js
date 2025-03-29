const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");

if (process.argv.length < 4) {
  console.error("Please provide region, bucket name as arguments.");
  process.exit(1);
}

let region = process.argv[2];
let bucketName = process.argv[3];

AWS.config.update({ region: region });
const s3 = new AWS.S3();
const logsDir = "./logs";

async function archiveAndCleanLogs() {
  const files = fs
    .readdirSync(logsDir)
    .filter(
      (file) => file.startsWith("marketdata-") && file.endsWith(".binlog")
    );

  for (const file of files) {
    const filePath = path.join(logsDir, file);
    const fileContent = fs.readFileSync(filePath);

    try {
      await s3
        .putObject({
          Bucket: bucketName,
          Key: `${file}`,
          Body: fileContent,
        })
        .promise();

      fs.unlinkSync(filePath);
      console.log(`Archived and removed ${file}`);
    } catch (error) {
      console.error(`Failed to archive ${file}:`, error);
    }
  }
}

archiveAndCleanLogs();
