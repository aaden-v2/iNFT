const express = require("express");
const bodyParser = require("body-parser");
const tokenRoutes = require("./src/routes/token");
const confManager = require("./src/confManager.js");
const cookieParser = require("cookie-parser");
const validateLogin = require("./src/interceptors/loginState");
const loginRoutes = require("./src/routes/login");
const { cookieKey } = require("./src/utils/constant");
const corsOptions = require("./src/utils/corsOpt");

const app = express();
app.use(bodyParser.json({ limit: "1mb" }));
app.use(cookieParser(cookieKey));
app.use(express.json());
// ADD THIS
var cors = require("cors");
app.use(cors(corsOptions));
app.use("*", validateLogin);

const baseConf = confManager.getBaseConf();
const Port = baseConf.Port;
const Address = baseConf.Address;

app.use("/api", tokenRoutes);
app.use("/login", loginRoutes);

app.get("/", (_req, res) => {
  res.send("ok");
});

app.listen(Port, Address, () => {
  console.log(`inft-backend app listening at http://localhost:${Port}`);
});
