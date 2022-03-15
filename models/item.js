const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  img_src: { type: String },
});

ItemSchema.virtual('url').get(function () {
  return '/catalog/item/' + this._id;
});

module.exports = mongoose.model('Item', ItemSchema);
