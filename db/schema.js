const { gql } = require('apollo-server');

const typeDefs = gql`
  type User {
    id: ID
    name: String
    surname: String
    email: String
    createdAt: String
  }
  type Product {
    id: ID
    name: String
    quantity: Int
    price: Float
    createdAt: String
  }
  type Customer {
    id: ID
    name: String
    surname: String
    company: String
    email: String
    phone: String
    seller: User
    createdAt: String
  }
  type Order {
    id: ID
    products: [Product]
    total: Float
    customer: Customer
    seller: User
    state: OrderState
    createdAt: String
  }
  type Token {
    token: String
  }
  type BestCustomer {
    total: Float
    customer: [Customer]
  }
  type BestSeller {
    total: Float
    seller: [User]
  }
  input UserInput {
    name: String!
    surname: String!
    email: String!
    password: String!
  }
  input AuthInput {
    email: String!
    password: String!
  }
  input ProductInput {
    name: String!
    quantity: Int!
    price: Float!
  }
  input CustomerInput {
    name: String!
    surname: String!
    company: String!
    email: String!
    phone: String!
  }
  input OrderProductInput {
    id: ID!
    quantity: Int!
    name: String
    price: Float
  }
  input OrderInput {
    products: [OrderProductInput]
    total: Float
    customer: ID
    state: OrderState
  }
  enum OrderState {
    PENDING
    COMPLETED
    CANCELED
  }
  type Query {
    # Users
    getUser: User
    # Products
    getProducts: [Product]
    getProduct(id: ID!): Product
    # Customers
    getCustomer(id: ID!): Customer
    getCustomers: [Customer]
    getCustomersBySeller: [Customer]
    # Orders
    getOrder(id: ID!): Order
    getOrders: [Order]
    getOrdersBySeller(id: ID!): [Order]
    getOrdersByState(state: OrderState!): [Order]
    # Advanced Searchs
    bestCustomers: [BestCustomer]
    bestSellers: [BestSeller]
    searchProducts(text: String!): [Product]
  }
  type Mutation {
    # Users
    createUser(input: UserInput): User
    authUser(input: AuthInput): Token
    # Products
    createProduct(input: ProductInput): Product
    updateProduct(id: ID!, input: ProductInput): Product
    deleteProduct(id: ID!): String
    # Customers
    createCustomer(input: CustomerInput): Customer
    updateCustomer(id: ID!, input: CustomerInput): Customer
    deleteCustomer(id: ID!): String
    # Orders
    createOrder(input: OrderInput): Order
    updateOrder(id: ID!, input: OrderInput): Order
    deleteOrder(id: ID!): String
  }
`;

module.exports = typeDefs;
