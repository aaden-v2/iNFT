const { MongoClient } = require("mongodb");
const confManager = require("../confManager.js");

class MongoDB {
  constructor() {
    const baseConf = confManager.getBaseConf();
    this.uri = baseConf["MongoURI"];
    this.client = new MongoClient(this.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  async insertOneUser(_userdata, _address) {
    this.client.connect(async (err) => {
      const collection = this.client.db("nft").collection("user");
      const doc = {
        address: _address,
        userdata: _userdata,
      };
      const result = await collection.insertOne(doc);
      this.client.close();
    });
  }
  async queryUser(_address, callback) {
    return this.client.connect(async (err) => {
      const collection = this.client.db("nft").collection("user");
      // perform actions on the collection object
      const res = await collection.findOne({ address: _address });
      console.log(res);
      this.client.close();
      return callback(res);
    });
  }
  async insertOneToken(_image, _id) {
    this.client.connect(async (err) => {
      const collection = this.client.db("nft").collection("image");
      const doc = {
        image: _image,
        id: _id,
      };
      const result = await collection.insertOne(doc);
      console.log(result);
      this.client.close();
    });
  }
  async queryToken(_id, callback) {
    return this.client.connect(async (err) => {
      const collection = this.client.db("nft").collection("image");
      // perform actions on the collection object
      const res = await collection.findOne({ id: _id });
      console.log(res);
      this.client.close();
      return callback(res);
    });
  }
  async getLastedTokenID(callback) {
    return this.client.connect(async (err) => {
      const collection = this.client.db("nft").collection("image");
      // perform actions on the collection object
      const cursor = collection.find({});
      const count = await cursor.count();
      this.client.close();
      return callback(count);
    });
  }
}

const mongodb = new MongoDB();

module.exports = mongodb;
