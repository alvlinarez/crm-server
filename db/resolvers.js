const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

const createToken = (user, jwtAuth, expiresIn) => {
  const { id, email, name, surname } = user;
  return jwt.sign({ sub: id, name, surname, email }, jwtAuth, { expiresIn });
};

const resolvers = {
  Query: {
    // Users
    getUser: async (_, {}, ctx) => {
      return ctx.user;
    },
    // Products
    getProducts: async () => {
      try {
        return await Product.find({});
      } catch (e) {
        console.log(e);
      }
    },
    getProduct: async (_, { id }) => {
      const product = await Product.findById(id);
      if (!product) {
        throw new Error('Product not found.');
      }
      return product;
    },
    // Customers
    getCustomers: async (_, {}, ctx) => {
      try {
        return await Customer.find({});
      } catch (e) {
        console.log(e);
      }
    },
    getCustomer: async (_, { id }, ctx) => {
      if (!ctx.user) {
        throw new Error('Token Error');
      }
      const customer = await Customer.findOne({ _id: id });
      if (!customer) {
        throw new Error('Customer not found.');
      }
      if (customer.seller.id !== ctx.user.id) {
        throw new Error('Access denied.');
      }
      return customer;
    },
    getCustomersBySeller: async (_, {}, ctx) => {
      if (!ctx.user) {
        throw new Error('User not signed.');
      }
      try {
        return await Customer.find({ seller: ctx.user.id });
      } catch (e) {
        console.log(e);
      }
    },
    // Orders
    getOrders: async () => {
      try {
        return await Order.find({});
      } catch (e) {
        console.log(e);
      }
    },
    getOrder: async (_, { id }, ctx) => {
      if (!ctx.user) {
        throw new Error('Token Error');
      }
      const order = await Order.findOne({ _id: id });
      if (!order) {
        throw new Error('Order does not exists.');
      }
      if (order.seller.id !== ctx.user.id) {
        throw new Error('Access denied.');
      }
      return order;
    },
    getOrdersBySeller: async (_, {}, ctx) => {
      if (!ctx.user) {
        throw new Error('Token Error');
      }
      try {
        return await Order.find({ seller: ctx.user.id });
      } catch (e) {
        console.log(e);
      }
    },
    getOrdersByState: async (_, { state }, ctx) => {
      if (!ctx.user) {
        throw new Error('Token Error');
      }
      try {
        return await Order.find({ seller: ctx.user.id, state });
      } catch (e) {
        console.log(e);
      }
    },
    bestCustomers: async () => {
      try {
        return await Order.aggregate([
          { $match: { state: 'COMPLETED' } },
          {
            $group: {
              _id: '$customer',
              total: { $sum: '$total' }
            }
          },
          {
            $lookup: {
              from: 'customers',
              localField: '_id',
              foreignField: '_id',
              as: 'customer'
            }
          },
          { $limit: 10 },
          { $sort: { total: -1 } }
        ]);
      } catch (e) {
        console.log(e);
      }
    },
    bestSellers: async () => {
      try {
        return await Order.aggregate([
          { $match: { state: 'COMPLETED' } },
          {
            $group: {
              _id: '$seller',
              total: { $sum: '$total' }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'seller'
            }
          },
          {
            $limit: 3
          },
          {
            $sort: {
              total: -1
            }
          }
        ]);
      } catch (e) {
        console.log(e);
      }
    },
    searchProducts: async (_, { text }) => {
      try {
        return await Product.find({ $text: { $search: text } }).limit(10);
      } catch (e) {
        console.log(e);
      }
    }
  },
  Mutation: {
    // Users
    createUser: async (_, { input }) => {
      const { email, name, surname, password } = input;
      let user = await User.findOne({ email });
      if (user) {
        throw new Error('User already exists.');
      }
      user = new User({ email, name, surname, password });
      try {
        user = await user.save();
        user = user.toJSON();
        return user;
      } catch (e) {
        console.log(e);
      }
    },
    authUser: async (_, { input }) => {
      const { email, password } = input;
      let user = await User.findOne({ email });
      if (!user) {
        throw new Error('User does not exists.');
      }
      if (!user.authenticate(password)) {
        throw new Error('Incorrect password');
      }
      user = user.toJSON();
      return {
        token: createToken(user, config.jwtAuth, '24h')
      };
    },
    // Products
    createProduct: async (_, { input }, ctx) => {
      if (!ctx.user) {
        throw new Error('Token Error');
      }
      try {
        let product = new Product(input);
        product = await product.save();
        return product.toJSON();
      } catch (e) {
        console.log(e);
      }
    },
    updateProduct: async (_, { id, input }) => {
      let product = await Product.findOne({ _id: id });
      if (!product) {
        throw new Error('Product not found.');
      }
      product = await Product.findOneAndUpdate({ _id: id }, input, {
        new: true
      });
      return product;
    },
    deleteProduct: async (_, { id }) => {
      const product = await Product.findOneAndDelete({ _id: id });
      if (!product) {
        throw new Error('Product not found');
      }
      return 'Product deleted successfully';
    },
    // Customers
    createCustomer: async (_, { input }, ctx) => {
      if (!ctx.user) {
        throw new Error('Token Error');
      }
      const { email } = input;
      let customer = await Customer.findOne({ email });
      if (customer) {
        throw new Error('Customer already exists!');
      }
      customer = new Customer({ ...input, seller: ctx.user.id });
      try {
        customer = await customer.save();
        return customer.toJSON();
      } catch (e) {
        console.log(e);
      }
    },
    updateCustomer: async (_, { id, input }) => {
      let customer = await Customer.findOne({ _id: id });
      if (!customer) {
        throw new Error('Customer not found.');
      }
      customer = await Customer.findOneAndUpdate({ _id: id }, input, {
        new: true
      });
      return customer;
    },
    deleteCustomer: async (_, { id }) => {
      const customer = await Customer.findOneAndDelete({ _id: id });
      if (!customer) {
        throw new Error('Customer not found');
      }
      return 'Customer deleted successfully';
    },
    // Orders
    createOrder: async (_, { input }, ctx) => {
      if (!ctx.user) {
        throw new Error('Token Error');
      }
      const { customer: customerId } = input;
      let customer = await Customer.findOne({ _id: customerId });
      if (!customer) {
        throw new Error('Customer not found.');
      }
      if (customer.seller.id !== ctx.user.id) {
        throw new Error('Access denied!');
      }
      for await (const asset of input.products) {
        const { product: id } = asset;
        const product = await Product.findOne({ _id: id });
        if (!product) {
          throw new Error('Product not found.');
        }
        if (asset.quantity > product.quantity) {
          throw new Error(`The product: ${product.name}
          exceeds quantity available`);
        } else {
          product.quantity -= asset.quantity;
          await product.save();
        }
      }
      let order = new Order(input);
      order.seller = ctx.user.id;
      order = await order.save();
      return order.toJSON();
    },
    updateOrder: async (_, { id, input }, ctx) => {
      if (!ctx.user) {
        throw new Error('Token Error');
      }
      const order = await Order.findOne({ _id: id });
      if (!order) {
        throw new Error('Order does not exists!');
      }
      if (order.seller.id !== ctx.user.id) {
        throw new Error('Access denied!');
      }
      if (input.products) {
        for await (const asset of input.products) {
          const { product: id } = asset;
          const product = await Product.findOne({ _id: id });
          if (product) {
            if (asset.quantity > product.quantity) {
              throw new Error(`The product: ${product.name} 
          exceeds quantity available`);
            } else {
              product.quantity -= asset.quantity;
              await product.save();
            }
          } else {
            throw new Error('Product not found.');
          }
        }
      } else {
        throw new Error('Error updating products in order.');
      }
      return Order.findOneAndUpdate({ _id: id }, input, { new: true });
    },
    deleteOrder: async (_, { id }, ctx) => {
      if (!ctx.user) {
        throw new Error('Token Error');
      }
      const order = await Order.findOneAndDelete({
        _id: id,
        seller: ctx.user.id
      });
      if (!order) {
        if (!order) {
          throw new Error('Order not found');
        }
      }
      return 'Order deleted successfully.';
    }
  }
};

module.exports = resolvers;
