const async = require('async');
const { body, validationResult } = require('express-validator');

const Item = require('../models/item');
const Category = require('../models/category');
const Brand = require('../models/brand');

exports.brand_list = async function (req, res, next) {
  try {
    const brands = await Brand.find();
    res.render('brand_list', { title: 'Product Brands', brands });
  } catch (err) {
    next(err);
  }
};

exports.brand_detail = async function (req, res, next) {
  const { id } = req.params;
  try {
    const items = await Item.find().populate('category').populate('brand');
    const brand = await Brand.findById(id);
    res.render('brand_detail', { title: brand.name, brand, items });
  } catch (err) {
    next(err);
  }
};
