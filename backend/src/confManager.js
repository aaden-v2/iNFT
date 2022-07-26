const fs = require('fs')
const path = require('path')
const YAML = require('yaml');

class ConfigurationManager {
    constructor(configFileName = 'config.yml') {
        this.configFileName = configFileName;
        this.globalConfFile = fs.readFileSync(configFileName, 'utf8');
        this.configs = YAML.parse(this.globalConfFile);
    }

    getConfig() {
        return this.configs;
    }

    getBaseConf() {
        return this.configs["BASE"]
    }

    getDBConf() {
        return this.configs["MYSQL"]
    }
}


const confManager = new ConfigurationManager("./config.yml")

module.exports = confManager
