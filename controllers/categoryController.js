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

exports.category_create_get = async function (req, res, next) {
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
