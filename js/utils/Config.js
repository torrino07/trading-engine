const fs = require("fs");
const yaml = require("yaml");
class Config {
  constructor() {
    this.filePath = "../config.yaml";
    this.config = this.load();
  }

  load() {
    try {
      const configFile = fs.readFileSync(this.filePath, "utf8");
      const data = yaml.parse(configFile);
      return data;
    } catch (e) {
      console.error(`Error parsing YAML file: ${e}`);
    }
  }

  get(key) {
    return this.config[key];
  }
}

module.exports = Config;
