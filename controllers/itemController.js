const async = require('async');
const { body, validationResult } = require('express-validator');

const Item = require('../models/item');
const Category = require('../models/category');
const Brand = require('../models/brand');

exports.index = async function (req, res) {
  const categories = await Category.find({});
  const items = await Item.find({}).populate('category');
  res.render('index', { title: 'Badminton Inventory', categories, items });
};
