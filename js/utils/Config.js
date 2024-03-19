class Config {
  constructor() {
    this.config = this.load();
  }

  load() {
    const argv = process.argv.slice(2);
    const config = argv.reduce((acc, current) => {
      const [key, value] = current.split("=");
      acc[key] = value;
      return acc;
    }, {});
    return config;
  }

  get(key) {
    return this.config[key].split(";");;
  }

  has(key) {
    return Object.hasOwnProperty.call(this.config, key);
  }

  getAll() {
    return this.config;
  }
}

module.exports = Config;
