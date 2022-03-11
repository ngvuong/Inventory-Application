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
const brands = [];

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
    console.log('New Item' + item);
    items.push(item);
    cb(null, item);
  });
}

function categoryCreate(name, description, cb) {
  const categoryDetail = { name, description };

  const category = new Category(categoryDetail);

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Category' + category);
    categories.push(category);
    cb(null, category);
  });
}

function brandCreate(name, description, country, cb) {
  const brandDetail = { name, description, country };

  const brand = new Brand(brandDetail);

  brand.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Brand' + brand);
    brands.push(brand);
    cb(null, brand);
  });
}

function createCategories(cb) {
  async.series(
    [
      function (callback) {
        categoryCreate('Racket', 'Badminton rackets', callback);
      },
      function (callback) {
        categoryCreate('Shoes', 'Badminton shoes', callback);
      },
      function (callback) {
        categoryCreate('Apparels', 'Badminton clothing', callback);
      },
      function (callback) {
        categoryCreate('Shuttles', 'Badminton shuttlecocks', callback);
      },
    ],
    cb
  );
}

function createBrands(cb) {
  async.series(
    [
      function (callback) {
        brandCreate(
          'Yonex',
          'Japanese badminton manufacturer',
          'Japan',
          callback
        );
      },
      function (callback) {
        brandCreate(
          'Victor',
          'Taiwanese badminton manufacturer',
          'Taiwan',
          callback
        );
      },
      function (callback) {
        brandCreate(
          'Li-Ning',
          'Chinese badminton manufacturer',
          'China',
          callback
        );
      },
      function (callback) {
        brandCreate(
          'Apacs',
          'Malaysian badminton manufacturer',
          'Malaysia',
          callback
        );
      },
    ],
    cb
  );
}

function createItems(cb) {
  async.parallel(
    [
      function (callback) {
        itemCreate(
          'ArcSaber 11',
          'ArcSaber 11 ISOMETRIC design increases sweet spot without sacrificing power.',
          categories[0],
          brands[0],
          110,
          5,
          callback
        );
      },
      function (callback) {
        itemCreate(
          'Jetspeed S12',
          'Jetspeed S12 features innovative frame structure and technology enabling fast and smooth swing for instant strength.',
          categories[0],
          brands[1],
          250,
          2,
          callback
        );
      },
      function (callback) {
        itemCreate(
          'Tantrum 200',
          'Tantrum 200 features lightweight material and aerodynamic design allowing for great maneuverability',
          categories[0],
          brands[3],
          100,
          1,
          callback
        );
      },
      function (callback) {
        itemCreate(
          'Lin Dan Hero 2',
          'Lin Dan Hero 2 badminton shoes with soft cushions are disigned for comfort and speed.',
          categories[1],
          brands[2],
          99,
          10,
          callback
        );
      },
      function (callback) {
        itemCreate(
          '16420-EX',
          'Comfortable and lightweight badminton shirt made with soft and absorbent material.',
          categories[2],
          brands[0],
          29,
          4,
          callback
        );
      },
      function (callback) {
        itemCreate(
          'AC-05',
          'Aero Club 05 economical shuttlecocks made with premium duck feather offers exellent durability.',
          categories[3],
          brands[0],
          26,
          50,
          callback
        );
      },
    ],
    cb
  );
}

async.series(
  [createCategories, createBrands, createItems],
  function (err, results) {
    if (err) {
      console.log('Final error' + err);
    } else {
      console.log('Items: ' + items);
    }
    mongoose.connection.close();
  }
);
