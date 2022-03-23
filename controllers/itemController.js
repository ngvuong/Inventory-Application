const async = require('async');
const { body, validationResult } = require('express-validator');
const fs = require('fs');

const Item = require('../models/item');
const Category = require('../models/category');
const Brand = require('../models/brand');

exports.index = async function (req, res, next) {
  try {
    const categories = await Category.find();
    const items = await Item.find().populate('category');

    const rows = {};
    const cookies = req.cookies;
    categories.forEach((category) => {
      console.log(cookies);

      // rows = { ...rows, category: [] };
    });
    res.render('index', {
      title: 'Badminton Inventory',
      categories,
      items,
      rows,
      activePage: 'inventory',
    });
  } catch (err) {
    next(err);
  }
};

exports.item_list = async function (req, res, next) {
  try {
    const items = await Item.find().populate('category').populate('brand');
    res.render('item_list', {
      title: 'Item Catalog',
      items,
      activePage: 'product',
    });
  } catch (err) {
    next(err);
  }
};

exports.item_detail = async function (req, res, next) {
  const { id } = req.params;
  let fileExists;

  try {
    const item = await Item.findById(id).populate('category').populate('brand');
    if (item.img_src) {
      fs.access('public/' + item.img_src, fs.constants.F_OK, (err) => {
        if (err) {
          fileExists = false;
        } else fileExists = true;
        res.render('item_detail', { title: item.name, item, fileExists });
      });
    } else {
      res.render('item_detail', { title: item.name, item, fileExists });
    }
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
  body('img_src', 'Invalid file type or file too large').custom(
    (image, { req }) => {
      if (
        req.file &&
        (!req.file.originalname.match(/\.(png|jpeg|jpg)$/) ||
          req.file.size > 1000000)
      ) {
        fs.unlink(req.file.path, (err) => {
          if (err) return false;
        });
        return false;
      }
      return true;
    }
  ),
  (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      brand: req.body.brand,
      price: req.body.price,
      stock: req.body.stock,
      img_src: req.file ? `images/${req.file.filename}` : '',
    });

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
      item.save(function (err) {
        if (err) return next(err);
        res.redirect(item.url);
      });
    }
  },
];

exports.item_delete_get = async function (req, res, next) {
  const { id } = req.params;
  try {
    const item = await Item.findById(id);
    res.render('item_delete', { title: 'Delete Product', item });
  } catch (err) {
    next(err);
  }
};

exports.item_delete_post = async function (req, res, next) {
  const { itemid, password } = req.body;

  try {
    const item = await Item.findById(itemid);

    if (password !== process.env.ADMIN_PASSWORD) {
      res.render('item_delete', {
        title: 'Delete Product',
        item,
        error: 'Incorrect Password',
      });
      return;
    }

    const imgSrc = item.img_src ? 'public/' + item.img_src : '';

    await Item.findByIdAndDelete(itemid);
    if (imgSrc) {
      fs.unlink(imgSrc, (err) => {
        if (err) next(err);
      });
    }
    res.redirect('/catalog/items');
  } catch (err) {
    next(err);
  }
};

exports.item_update_get = function (req, res, next) {
  async.parallel(
    {
      item: function (callback) {
        Item.findById(req.params.id)
          .populate('category')
          .populate('brand')
          .exec(callback);
      },
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
        title: 'Update Product',
        item: results.item,
        categories: results.categories,
        brands: results.brands,
        update: true,
      });
    }
  );
};

exports.item_update_post = [
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
  body('img_src', 'Invalid file type or file too large').custom(
    (image, { req }) => {
      if (
        req.file &&
        (!req.file.originalname.match(/\.(png|jpeg|jpg)$/) ||
          req.file.size > 1000000)
      ) {
        fs.unlink(req.file.path, (err) => {
          if (err) return false;
        });
        return false;
      }
      return true;
    }
  ),
  (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      brand: req.body.brand,
      price: req.body.price,
      stock: req.body.stock,
      img_src: req.file ? `images/${req.file.filename}` : '',
      _id: req.params.id,
    });

    if (!errors.isEmpty() || process.env.ADMIN_PASSWORD !== req.body.password) {
      if (item.img_src) {
        fs.unlink('public/' + item.img_src, (err) => {
          if (err) return next(err);
        });
      }

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
          if (err) return next(err);
          res.render('item_form', {
            title: 'Update Product',
            item,
            categories: results.categories,
            brands: results.brands,
            errors: errors.array(),
            update: true,
            error: 'Incorrect Password',
          });
        }
      );
      return;
    } else {
      Item.findById(req.params.id).exec(function (err, data) {
        if (err) return next(err);
        if (data.img_src && data.img_src !== item.img_src) {
          fs.unlink('public/' + data.img_src, (err) => {
            if (err) return next(err);
          });
        }
      });

      Item.findByIdAndUpdate(req.params.id, item, {}, function (err, theItem) {
        if (err) return next(err);
        res.redirect(theItem.url);
      });
    }
  },
];
