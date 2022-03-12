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
