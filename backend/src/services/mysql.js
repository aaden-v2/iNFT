const mysql = require("mysql2");
const confManager = require("../confManager.js");

class Mysql {
  constructor() {
    const dbConf = confManager.getDBConf();
    this.connection = mysql.createConnection({
      host: dbConf["Host"],
      user: dbConf["User"],
      password: dbConf["Password"],
      database: dbConf["DataBase"]
    });
    //this.connection.connect();
    //console.log("Connected!");
  }
  end() {
    this.connection.end();
  }
  async testAsync() {
    let results = await this.connection.promise().query("SELECT 1 + 1 AS solution");
    return results[0];
  }
  test(callback) {
    this.connection.query("SELECT 1 + 1 AS solution", function (err, rows, fields) {
      if (err) throw err;
      return callback(rows[0].solution);
    });
  }
  insertOneUser(_address, _userdata) {
    var sql = "INSERT INTO t_users (address, user_data) VALUES (?, ?)";
    this.connection.query(sql, [_address, _userdata], function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    });
  }
  queryUserByAddress(_address, callback) {
    this.connection.query(
      "SELECT user_data FROM t_users where address = ?",
      [_address],
      function (err, rows, fields) {
        if (err) throw err;
        return callback(rows[0].user_data);
      }
    );
  }
  existUserByAddress(_address, callback) {
    this.connection.query(
      "SELECT user_data FROM t_users where address = ?",
      [_address],
      function (err, rows, fields) {
        if (err) throw err;
        return callback(Boolean(rows[0]));
      }
    );
  }
  insertOneToken(_image, address, _description) {
    var sql =
      "INSERT INTO t_tokens (`img_ipfs_url`, `creator_address`, `description`) VALUES (?, ?, ?)";
    this.connection.query(sql, [_image, address, _description], function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    });
  }
  async queryLastTokenIDAsync() {
    let [rows, fields] = await this.connection
      .promise()
      .query("SELECT id FROM t_tokens order by id desc limit 1");
    if (rows.length == 0) {
      console.log("query returns none");
      return 0;
    }
    console.log(rows[0]);
    return rows[0].id;
  }

  async queryTokenByAddressAsync(_address) {
    let [rows, fields] = await this.connection
      .promise()
      .query("SELECT id, img_ipfs_url FROM t_tokens where creator_address = ?", [_address]);
    if (rows.length == 0) {
      console.log("query returns none");
      return 0;
    }
    console.log(rows[0]);
    return rows[0].id;
  }

  async queryTokensByAddress(_address, limit, offset) {
    let [rows, fields] = await this.connection
      .promise()
      .query(
        `SELECT id, creator_address, img_ipfs_url, description, created_at FROM t_tokens where creator_address = ? LIMIT ${limit} OFFSET ${offset}`,
        [_address]
      );
    return rows;
  }

  async queryAllTokens(limit, offset) {
    let [rows] = await this.connection
      .promise()
      .query(
        `SELECT id, creator_address, img_ipfs_url, description, created_at FROM t_tokens where is_deleted = ? LIMIT ${limit} OFFSET ${offset}`,
        [0]
      );
    return rows;
  }

  async queryBatchTokensById(tokenIds) {
    let [rows] = await this.connection
      .promise()
      .query(
        `SELECT id, creator_address, img_ipfs_url, description, created_at FROM t_tokens where id IN (${tokenIds.join()})`,
        tokenIds
      );
    return rows;
  }

  async queryAllTokensCount() {
    let [res] = await this.connection.promise().query(`SELECT COUNT(*) FROM t_tokens`);
    return res[0]["COUNT(*)"];
  }

  async queryTokensCountByAddress(_address) {
    // let [rows, fields] = await this.connection.promise().query('SELECT COUNT(*) FROM t_tokens where creator_address = ?', [_address]);
    const [res] = await this.connection
      .promise()
      .query("SELECT COUNT(*) FROM t_tokens where creator_address = ?", [_address]);
    return res[0]["COUNT(*)"];
  }

  async queryTokenByIMGURLAsync(img_ipfs_url) {
    let [rows, fields] = await this.connection
      .promise()
      .query("SELECT id, img_ipfs_url FROM t_tokens where img_ipfs_url = ?", [img_ipfs_url]);
    if (rows.length == 0) {
      console.log("query returns none");
      return 0;
    }
    console.log(rows[0]);
    return rows[0].id;
  }

  queryTokenByAddress(_address, callback) {
    this.connection.query(
      "SELECT id, img_ipfs_url FROM t_tokens where creator_address = ?",
      [_address],
      function (err, rows, fields) {
        if (err) throw err;
        console.log(rows[0]);
        return callback(rows[0].id);
      }
    );
  }
  async queryTokenByIDAsyncPromise(tokenID) {
    return new Promise((resolve, reject) => {
      this.queryTokenByID(tokenID, (content, image_url) => {
        // 代表正确拿到了这个db查询结果并通过resolve返回
        resolve({
          content,
          image_url
        });
        // 如果出错了你需要把error用reject返回，像 reject(error)
      });
    });
  }
  async deleteTokenById(id) {
    await this.connection.promise().query("UPDATE t_tokens SET is_deleted='1' WHERE id=?", [id]);
  }
  async confirmTokenById(id) {
    await this.connection.promise().query("UPDATE t_tokens SET is_deleted='0' WHERE id=?", [id]);
  }

  async queryTokenByIDAsync(_id) {
    let [rows, fields] = await this.connection
      .promise()
      .query("SELECT description, img_ipfs_url FROM t_tokens where id = ?", [_id]);
    if (rows.length == 0) {
      console.log("query returns none");
      return "", "";
    }
    console.log(rows[0]);
    return rows[0];
  }
  queryTokenByID(_id, callback) {
    this.connection.query(
      "SELECT token_content, img_ipfs_url FROM t_tokens where id = ?",
      [_id],
      function (err, rows, fields) {
        if (err) throw err;
        if (rows.length == 0) {
          console.log("query returns none");
          return;
        }
        console.log(rows[0]);
        return callback(rows[0].token_content, rows[0].img_ipfs_url);
      }
    );
  }
}

const mysqlConn = new Mysql();

module.exports = mysqlConn;
