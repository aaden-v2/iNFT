const express = require("express");
const mysqlConn = require("../services/mysql");
const router = express.Router();
const multiparty = require("multiparty");
const { uploadDir } = require("../utils/constant");
const crypto = require("crypto");
const fs = require("fs-extra");
const path = require("path");
const https = require("https");

router.post("/signup/:address/", async (req, res) => {
  const address = req.params.address;
  const user_data = req.body.userdata;
  console.log("signup for address : " + address + ", userdata: ", user_data);
  let resp = {};
  try {
    mysqlConn.insertOneUser(address, user_data);
  } catch (e) {
    console.log(e.message);
    res.status(502).json({
      errorCode: 1,
      errorMsg: e.message,
      data: resp,
    });
    return;
  }
  res.status(200).json({
    errorCode: 0,
    errorMsg: "success",
    data: resp,
  });
});

router.get("/tokens/", async (req, res) => {
  var response = {};
  try {
    const id = await mysqlConn.queryLastTokenIDAsync();
    console.log(id);
    res.status(200).json({
      maxID: id,
    });
    return;
  } catch (e) {
    console.log(e.message);
    res.status(502).json({
      errorCode: 1,
      errorMsg: e.message,
      data: [],
    });
    return;
  }
});

router.get("/tokens/all/page/:page/pageSize/:pageSize/", async (req, res) => {
  const page = Number(req.params.page) || 1;
  const pageSize = Number(req.params.pageSize) || 10;
  if (!Boolean(page) || !Boolean(pageSize)) {
    res.status(400).json({
      errorMsg: "invalid params",
    });
    return;
  }
  try {
    const tokens = await mysqlConn.queryAllTokens(
      pageSize,
      (page - 1) * pageSize
    );
    const total = await mysqlConn.queryAllTokensCount();
    res.status(200).json({
      total,
      tokens: tokens.map((item) => ({
        imgUrl: item.img_ipfs_url,
        tokenId: item.id,
        createAt: item.created_at,
        description: item.description,
        address: item.creator_address,
      })),
    });
    return;
  } catch (e) {
    console.log(e.message);
    res.status(502).json({
      errorCode: 1,
      errorMsg: e.message,
      data: [],
    });
    return;
  }
});

router.get("/tokens/all", async (req, res) => {
  try {
    const tokens = await mysqlConn.queryAllTokens(1000, 0);
    res.status(200).json({
      tokenIds: tokens.map((item) => item.id),
    });
    return;
  } catch (e) {
    console.log(e.message);
    res.status(502).json({
      errorCode: 1,
      errorMsg: e.message,
      data: [],
    });
    return;
  }
});

router.post("/tokens/batch", async (req, res) => {
  const { tokenIds } = req.body;
  try {
    const tokens = await mysqlConn.queryBatchTokensById(tokenIds);
    res.status(200).json({
      tokens: tokens.map((item) => ({
        imgUrl: item.img_ipfs_url,
        tokenId: item.id,
        createAt: item.created_at,
        description: item.description,
        address: item.creator_address,
      })),
    });
    return;
  } catch (e) {
    console.log(e.message);
    res.status(502).json({
      errorCode: 1,
      errorMsg: e.message,
      data: [],
    });
    return;
  }
});

router.get("/tokens/page/:page/pageSize/:pageSize/", async (req, res) => {
  const address = req.header("Address");
  if (!address) {
    res.status(401).json({
      errorMsg: "need login",
    });
    return;
  }
  const page = Number(req.params.page) || 1;
  const pageSize = Number(req.params.pageSize) || 10;
  if (!Boolean(page) || !Boolean(pageSize)) {
    res.status(400).json({
      errorMsg: "invalid params",
    });
    return;
  }
  try {
    const tokens = await mysqlConn.queryTokensByAddress(
      address,
      pageSize,
      (page - 1) * pageSize
    );
    const total = await mysqlConn.queryTokensCountByAddress(address);
    res.status(200).json({
      total,
      tokens: tokens.map((item) => ({
        imgUrl: item.img_ipfs_url,
        tokenId: item.id,
        createAt: item.created_at,
        description: item.description,
        address,
      })),
    });
    return;
  } catch (e) {
    console.log(e.message);
    res.status(502).json({
      errorCode: 1,
      errorMsg: e.message,
      data: [],
    });
    return;
  }
});

async function queryTokenByID(tokenID) {
  return new Promise((resolve, reject) => {
    mysqlConn.queryTokenByID(tokenID, (content, image_url) => {
      // 代表正确拿到了这个db查询结果并通过resolve返回
      resolve({
        content,
        image_url,
      });
      // 如果出错了你需要把error用reject返回，像 reject(error)
    });
  });
}

router.post("/tokens/delete", async (req, res) => {
  const { tokenId } = req.body;
  try {
    if (!tokenId) {
      throw new Error("invalid tokenId");
    }
    await mysqlConn.deleteTokenById(tokenId);
    res.status(200).json({
      errorCode: 0,
      errorMsg: "success",
      data: { tokenId },
    });
    return;
  } catch (e) {
    console.log(e.message, e);
    res.status(502).json({
      errorCode: 1,
      errorMsg: e.message,
    });
    return;
  }
});

router.post("/tokens/confirm", async (req, res) => {
  const { tokenId } = req.body;
  try {
    if (!tokenId) {
      throw new Error("invalid tokenId");
    }
    await mysqlConn.confirmTokenById(tokenId);
    res.status(200).json({
      errorCode: 0,
      errorMsg: "success",
      data: { tokenId },
    });
    return;
  } catch (e) {
    console.log(e.message, e);
    res.status(502).json({
      errorCode: 1,
      errorMsg: e.message,
    });
    return;
  }
});

router.get("/tokens/:id/", async (req, res) => {
  const tokenID = req.params.id;
  console.log("query for token id : " + tokenID);
  if (tokenID == undefined) {
    res.status(502).json({
      errorCode: 1,
      errorMsg: "token id undefined",
      data: [],
    });
  }
  var response = {};
  try {
    const dbRes = await mysqlConn.queryTokenByIDAsync(tokenID);
    console.log("dbRes: ", dbRes);
    res.status(200).json({
      description: dbRes.description,
      image: dbRes.img_ipfs_url,
      name: "iNFT",
    });
    return;
  } catch (e) {
    console.log(e.message);
    res.status(502).json({
      errorCode: 1,
      errorMsg: e.message,
      data: [],
    });
    return;
  }
});

const default_description =
  "Ready to explore the wide world of Web3?\nJoin us to devote to NFTs, Gaming, Audio/Video, and all things Web3";
// side : "buy" | "sell"
router.post("/tokens/", async (req, res) => {
  const { image_url, description = default_description } = req.body;
  let address = req.header("Address");
  console.log(
    "submit token for image_url : " + image_url + " FROM Adress: ",
    address
  );
  if (image_url == undefined) {
    res.status(502).json({
      errorCode: 1,
      errorMsg: "image_url undefined",
      data: {},
    });
    return;
  }
  if (address == undefined) {
    address = "";
  }
  try {
    mysqlConn.insertOneToken(image_url, address, description);
    let id = await mysqlConn.queryTokenByIMGURLAsync(image_url);
    await mysqlConn.deleteTokenById(id);
    res.status(200).json({
      errorCode: 0,
      errorMsg: "success",
      data: { id },
    });
  } catch (e) {
    console.log(e.message);
    res.status(502).json({
      errorCode: 1,
      errorMsg: e.message,
      data: {},
    });
    return;
  }
});

router.post("/upload", async (req, res) => {
  const form = new multiparty.Form();
  form.on("part", async function(part) {
    if (part.filename) {
      const suffix =
        part.filename.split(".").length >= 2
          ? part.filename.split(".").pop()
          : "";
      const fileName = `${crypto.randomBytes(8).toString("hex")}${suffix && "." + suffix
        }`;
      const writeStrem = fs.createWriteStream(path.join(uploadDir, fileName));
      part.pipe(writeStrem);
      part.on("error", (err) => {
        console.log("part error", err);
        writeStrem.destroy();
        res.status(500).json({
          errorCode: 1,
          errorMsg: err.message,
          data: {},
        });
      });
      part.on("end", () => {
        res.status(200).json({ fileName });
      });
    }
  });
  form.parse(req);
});

router.get("/file/:fileName", async (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(uploadDir, fileName);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({
      errorCode: 1,
      errorMsg: "file not found",
      data: {},
    });
    return;
  }
  res.download(filePath);
});

router.get("/ipfs/:fileName", async (req, res) => {
  res.setHeader("Content-Type", "image/png");
  const fileName = req.params.fileName;
  const filePath = path.join(uploadDir, fileName);
  if (!fs.existsSync(filePath)) {
    await fs.createFile(filePath);
    const file = fs.createWriteStream(filePath);
    await new Promise((resolve, reject) => {
      https.get(
        {
          path: `/api/v0/cat?arg=${fileName}`,
          protocol: "https:",
          host: "ipfs.infura.io",
          port: "5001",
          method: "POST",
        },
        (res) => {
          if (res.statusCode !== 200) {
            reject(res.statusCode);
            return;
          }
          res.on("end", () => {
            setTimeout(() => resolve(), 1000);
          });
          res
            .on("finish", () => {
              file.close();
            })
            .on("error", (error) => {
              console.log("error:", error);
              reject(error);
              fs.unlink(filePath);
            });
          res.pipe(file);
        }
      );
    });
    const originData = fs.readFileSync(filePath, "utf8");
    const dataBuffer = new Buffer(
      originData.replace(/^data:\w+\/\w+;base64,/, ""),
      "base64"
    );
    fs.writeFileSync(filePath, dataBuffer);
    res.sendFile(filePath);
    return;
  }
  res.sendFile(filePath);
});

module.exports = router;
