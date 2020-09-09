const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Index used to search products
productSchema.index({ name: 'text' });

productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

module.exports = mongoose.model('Product', productSchema);
