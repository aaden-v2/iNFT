const Debug = require("debug");
const express = require("express");
const mysqlConn = require("../services/mysql");
const ethUtil = require("ethereumjs-util");

const debug = Debug("login");
const router = express.Router();

const A_WEEK = 7 * 24 * 60 * 60 * 1000;
const TWO_MINUTE = 2 * 60 * 1000;
const genNounce = () => Math.random().toString(36).slice(2);
// nounceMap: Map<address, { nounce: String; date: Date_Number}>;
const nounceMap = new Map();
const isValidNounce = (nounce, address) => {
  if (!nounceMap.has(address)) {
    debug("not have");
    return false;
  }
  if (nounceMap.get(address).nounce !== nounce) {
    debug("nounce not exist");
    return false;
  }
  const { date } = nounceMap.get(address);
  if (TWO_MINUTE + date < new Date().getTime()) {
    debug("nounce expired");
    nounceMap.delete(address);
    return false;
  }
  return true;
};
const clearNounceCache = () => {
  if (nounceMap.size > 1000) {
    const l = nounceMap.keys();
    let cur = leterator.next();
    while (!cur.done) {
      isValidNounce(cur.value);
      cur = l.next();
    }
  }
};
router.post("/nounce", async (req, res) => {
  const address = req.body.address;
  const nounce = genNounce();
  nounceMap.set(address, { nounce, date: new Date().getTime() });
  res.status(200).json({
    errorCode: 0,
    errorMsg: "success",
    data: { nounce },
  });
  clearNounceCache();
});

router.get("/isLogin", async (req, res) => {
  res.status(200).json({
    errorCode: 0,
    errorMsg: "",
    data: {
      isLogin: true,
    },
  });
  return;
});

router.post("/token", async (req, res) => {
  const { address, nounce, signedNounce, user_data } = req.body;
  if (!address || !nounce || !signedNounce) {
    res.status(502).json({
      errorCode: 1,
      errorMsg: "invalid params",
      data: {},
    });
    return;
  }
  // 过滤无效的nounce
  if (!isValidNounce(nounce, address)) {
    debug("address:", address);
    debug("nounce:", nounce);
    res.status(502).json({
      errorCode: 1,
      errorMsg: "invalid nounce",
      data: {},
    });
    return;
  }
  // 验证公钥是否为地址所属
  const nounceBuffer = ethUtil.toBuffer(Buffer.from(nounce));
  debug("nounceBuffer:", nounceBuffer);
  const nounceHash = ethUtil.hashPersonalMessage(nounceBuffer);
  // const signatureBuffer = ethUtil.toBuffer(Buffer.from(signedNounce));
  // debug('signatureBuffer-->', signatureBuffer);
  const signatureParams = ethUtil.fromRpcSig(signedNounce);
  const publicKey = ethUtil.ecrecover(
    nounceHash,
    signatureParams.v,
    signatureParams.r,
    signatureParams.s
  );
  const addressBuffer = ethUtil.publicToAddress(publicKey);
  const publicAddress = ethUtil.bufferToHex(addressBuffer);
  const ok = address.toLowerCase() === publicAddress.toLowerCase();
  if (!ok) {
    res.status(502).json({
      errorCode: 1,
      errorMsg: "verify sign failed",
      data: {},
    });
    return;
  }

  nounceMap.delete(address);

  const exist = await new Promise((resolve) =>
    mysqlConn.existUserByAddress(address, resolve)
  );
  if (!exist) {
    mysqlConn.insertOneUser(address, JSON.stringify(user_data));
  }

  // 分发jwt

  const tokenJson = {
    address,
    expires: new Date().getTime() + A_WEEK,
  };
  // const token = cryptor.encrypt(JSON.stringify(tokenJson));
  const token = JSON.stringify(tokenJson);
  res.cookie("token", token, {
    path: "/",
    expires: new Date(tokenJson.expires),
    maxAge: A_WEEK,
  });
  // res.cookies['token'] = token;

  res.status(200).json({
    errorCode: 0,
    errorMsg: "",
    data: {
      address,
      loginSuccess: true,
    },
  });
});

module.exports = router;
