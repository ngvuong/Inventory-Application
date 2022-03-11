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
