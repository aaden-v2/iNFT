const mysqlConn = require("../src/services/mysql");

async function queryTokenByID(tokenID) {
  return new Promise((resolve, reject) => {
    mysqlConn.queryTokenByID(tokenID, (content, image_url) => {
      resolve({
        content,
        image_url,
      });
    });
  });
}

(async () => {
  const dbRes = await queryTokenByID(3);
  console.log(dbRes);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
