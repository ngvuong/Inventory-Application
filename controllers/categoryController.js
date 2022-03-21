const async = require('async');
const { body, validationResult } = require('express-validator');
const fs = require('fs');

const Item = require('../models/item');
const Category = require('../models/category');
const Brand = require('../models/brand');

exports.category_list = async function (req, res, next) {
  try {
    const categories = await Category.find();
    res.render('category_list', { title: 'Product Categories', categories });
  } catch (err) {
    next(err);
  }
};

exports.category_detail = async function (req, res, next) {
  const { id } = req.params;
  try {
    const items = await Item.find().populate('category').populate('brand');
    const category = await Category.findById(id);
    res.render('category_detail', { title: category.name, category, items });
  } catch (err) {
    next(err);
  }
};

exports.category_create_get = function (req, res, next) {
  res.render('category_form', { title: 'New Category' });
};

exports.category_create_post = [
  body('name', 'Category name must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('description', 'Category description must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      res.render('category_form', {
        title: 'New Category',
        category,
        errors: errors.array(),
      });
    } else {
      category.save((err) => {
        if (err) return next(err);
        res.redirect(category.url);
      });
    }
  },
];

exports.category_delete_get = async function (req, res, next) {
  const { id } = req.params;

  async.parallel(
    {
      category: function (callback) {
        Category.findById(id).exec(callback);
      },

      items: function (callback) {
        Item.find({ category: id }).populate('brand').exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      res.render('category_delete', {
        title: 'Delete Category',
        category: results.category,
        items: results.items,
      });
    }
  );
};

exports.category_delete_post = async function (req, res, next) {
  const { categoryid, password } = req.body;

  if (process.env.ADMIN_PASSWORD !== password) {
    async.parallel(
      {
        category: function (callback) {
          Category.findById(categoryid).exec(callback);
        },

        items: function (callback) {
          Item.find({ category: categoryid }).populate('brand').exec(callback);
        },
      },
      function (err, results) {
        if (err) return next(err);
        res.render('category_delete', {
          title: 'Delete Category',
          category: results.category,
          items: results.items,
          error: 'Incorrect Password',
        });
      }
    );
  } else {
    try {
      const items = await Item.find({ category: categoryid });
      items.forEach((item) => {
        Item.findByIdAndDelete(item._id, (err) => {
          if (err) return next(err);
        });

        if (item.img_src) {
          fs.unlink('public/' + item.img_src, (err) => {
            if (err) return next(err);
          });
        }
      });
      await Category.findByIdAndDelete(categoryid);
      res.redirect('/catalog/categories');
    } catch (err) {
      next(err);
    }
  }
};

exports.category_update_get = async function (req, res, next) {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    res.render('category_form', {
      title: 'Update Category',
      category,
      update: true,
    });
  } catch (err) {
    next(err);
  }
};

exports.category_update_post = [
  body('name', 'Category name must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('description', 'Category description must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty() || process.env.ADMIN_PASSWORD !== req.body.password) {
      res.render('category_form', {
        title: 'Update Category',
        category,
        update: true,
        errors: errors.array(),
        error: 'Incorrect Password',
      });
    } else {
      Category.findByIdAndUpdate(
        req.params.id,
        category,
        {},
        function (err, theCategory) {
          if (err) return next(err);
          res.redirect(theCategory.url);
        }
      );
    }
  },
];
