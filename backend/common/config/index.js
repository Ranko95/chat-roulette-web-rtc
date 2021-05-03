const fsp = require("fs").promises;
const path = require("path");

async function readConfig() {
  try {
    const files = await fsp.readdir(__dirname);
    const configurations = files.filter(file => !file.includes("index"));

    return configurations.reduce((acc, val) => {
      const configName = val.split(".")[0];
      return {
        ...acc,
        [configName]: require(path.join(__dirname, val))
      }
    }, {});
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

module.exports = {
  readConfig,
};

