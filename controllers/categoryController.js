const async = require('async');
const { body, validationResult } = require('express-validator');

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
