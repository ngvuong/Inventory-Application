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
    const items = await Item.find({ brand: id })
      .populate('category')
      .populate('brand');
    const brand = await Brand.findById(id);
    res.render('brand_detail', { title: brand.name, brand, items });
  } catch (err) {
    next(err);
  }
};

exports.brand_create_get = function (req, res, next) {
  res.render('brand_form', { title: 'New Brand' });
};

exports.brand_create_post = [
  body('name', 'Brand name must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('description', 'Brand description must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('country', 'Brand country must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const brand = new Brand({
      name: req.body.name,
      description: req.body.description,
      country: req.body.country,
    });

    if (!errors.isEmpty()) {
      res.render('brand_form', {
        title: 'New Brand',
        brand,
        errors: errors.array(),
      });
    } else {
      brand.save((err) => {
        if (err) return next(err);
        res.redirect(brand.url);
      });
    }
  },
];
