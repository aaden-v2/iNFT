const mongodb = require("../src/services/mongo");

(async () => {
  await mongodb.queryToken(2, (res) => {
    console.log(res);
  });

  await mongodb.getLastedTokenID((res) => {
    console.log(res);
  });
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
