function createLogStream() {
  const fileName = `marketdata-${new Date().toISOString().replace(/[:.]/g, '-')}.binlog`;
  const logDir = path.join(__dirname, "logs");
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
  const filePath = path.join(logDir, fileName);
  return fs.createWriteStream(filePath, { flags: 'a' });
}

module.exports = {createLogStream };