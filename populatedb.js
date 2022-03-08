const userArgs = process.argv.slice(2);

const async = require('async');
const Item = require('./models/item');
const Category = require('./models/category');
const Brand = require('./models/brand');

const mongoose = require('mongoose');

const mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDb connection error:'));

const items = [];
const categories = [];
const brand = [];

function itemCreate(name, description, category, brand, price, stock, cb) {
  const itemDetail = {
    name,
    description,
    category,
    brand,
    price,
    stock,
  };

  const item = new Item(itemDetail);

  item.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
  });

  console.log('New Item' + item)
  items.push(item);
  cb(null, item);
}

function categoryCreate()





