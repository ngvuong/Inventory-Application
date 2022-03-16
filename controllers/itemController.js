const async = require('async');
const { body, validationResult } = require('express-validator');

const Item = require('../models/item');
const Category = require('../models/category');
const Brand = require('../models/brand');

exports.index = async function (req, res, next) {
  try {
    const categories = await Category.find();
    const items = await Item.find().populate('category');
    res.render('index', { title: 'Badminton Inventory', categories, items });
  } catch (err) {
    next(err);
  }
};

exports.item_list = async function (req, res, next) {
  try {
    const items = await Item.find().populate('category').populate('brand');
    res.render('item_list', { title: 'Item Catalog', items });
  } catch (err) {
    next(err);
  }
};

exports.item_detail = async function (req, res, next) {
  const { id } = req.params;
  try {
    const item = await Item.findById(id).populate('category').populate('brand');
    res.render('item_detail', { title: item.name, item });
  } catch (err) {
    next(err);
  }
};

exports.item_create_get = function (req, res, next) {
  async.parallel(
    {
      categories: function (callback) {
        Category.find(callback);
      },
      brands: function (callback) {
        Brand.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render('item_form', {
        title: 'New Product',
        categories: results.categories,
        brands: results.brands,
      });
    }
  );
};

exports.item_create_post = [
  body('name', 'Product name must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('description', 'Product description must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('category', 'Product category must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('brand', 'Product brand must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('price', 'Product price must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('stock', 'Product stock must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('img_src').escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      brand: req.body.brand,
      price: req.body.price,
      stock: req.body.stock,
      img_src: req.body.img_src,
    });
    console.log(req.body);

    if (!errors.isEmpty()) {
      async.parallel(
        {
          categories: function (callback) {
            Category.find(callback);
          },
          brands: function (callback) {
            Brand.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          res.render('item_form', {
            title: 'New Product',
            categories: results.categories,
            brands: results.brands,
            item,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // item.save(function (err) {
      //   if (err) return next(err);
      //   res.redirect(item.url);
      // });
    }
  },
];
