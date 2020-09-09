const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      }
    ],
    total: {
      type: Number,
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Customer'
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    state: {
      type: String,
      default: 'PENDING'
    }
  },
  {
    timestamps: true
  }
);

// Method to fill orders with products, customer, and seller fields
const autoPopulate = function (next) {
  this.populate([
    {
      path: 'products'
    },
    {
      path: 'customer'
    },
    {
      path: 'seller'
    }
  ]);
  next();
};

orderSchema
  .pre('find', autoPopulate)
  .pre('findOne', autoPopulate)
  .pre('findOneAndUpdate', autoPopulate)
  .pre('update', autoPopulate);

orderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

module.exports = mongoose.model('Order', orderSchema);
