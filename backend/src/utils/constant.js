const fs = require("fs");
const path = require("path");
const confManager = require("../confManager");

const baseConf = confManager.getBaseConf();
const NODE_ENV = baseConf["NODE_ENV"];

const projectName = "iNFT";
const cookieKey = Buffer.from(projectName).toString("base64");

const uploadDir = path.join(
  __dirname,
  NODE_ENV === "production" ? "../../../../uploadFile" : "../../uploadFile"
);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

module.exports = { cookieKey, uploadDir };
