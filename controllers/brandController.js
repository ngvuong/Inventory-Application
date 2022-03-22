const async = require('async');
const { body, validationResult } = require('express-validator');
const fs = require('fs');

const Item = require('../models/item');
const Category = require('../models/category');
const Brand = require('../models/brand');

exports.brand_list = async function (req, res, next) {
  try {
    const brands = await Brand.find();
    res.render('brand_list', {
      title: 'Product Brands',
      brands,
      activePage: 'brand',
    });
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

exports.brand_delete_get = function (req, res, next) {
  const { id } = req.params;

  async.parallel(
    {
      brand: function (callback) {
        Brand.findById(id).exec(callback);
      },

      items: function (callback) {
        Item.find({ brand: id }).populate('brand').exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      res.render('brand_delete', {
        title: 'Remove Brand',
        items: results.items,
        brand: results.brand,
      });
    }
  );
};

exports.brand_delete_post = async function (req, res, next) {
  const { brandid, password } = req.body;

  if (process.env.ADMIN_PASSWORD !== password) {
    async.parallel(
      {
        brand: function (callback) {
          Brand.findById(brandid).exec(callback);
        },

        items: function (callback) {
          Item.find({ brand: brandid }).populate('brand').exec(callback);
        },
      },
      function (err, results) {
        if (err) return next(err);
        res.render('brand_delete', {
          title: 'Remove Brand',
          items: results.items,
          brand: results.brand,
          error: 'Incorrect Password',
        });
      }
    );
  } else {
    try {
      const items = await Item.find({ brand: brandid });

      for (const item of items) {
        if (item.img_src) {
          await fs.promises.unlink('public/' + item.img_src);
        }
        await Item.findByIdAndDelete(item._id);
      }

      await Brand.findByIdAndDelete(brandid);
      res.redirect('/catalog/brands');
    } catch (err) {
      next(err);
    }
  }
};

exports.brand_update_get = async function (req, res, next) {
  const { id } = req.params;

  try {
    const brand = await Brand.findById(id);
    res.render('brand_form', { title: 'Update Brand', brand, update: true });
  } catch (err) {
    next(err);
  }
};

exports.brand_update_post = [
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
      _id: req.params.id,
    });

    if (!errors.isEmpty() || process.env.ADMIN_PASSWORD !== req.body.password) {
      res.render('brand_form', {
        title: 'Update Brand',
        brand,
        errors: errors.array(),
        update: true,
        error: 'Incorrect Password',
      });
    } else {
      Brand.findByIdAndUpdate(
        req.params.id,
        brand,
        {},
        function (err, theBrand) {
          if (err) return next(err);
          res.redirect(theBrand.url);
        }
      );
    }
  },
];
