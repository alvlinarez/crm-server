require('dotenv').config();

const { NODE_ENV, DB_MONGO, JWT_SECRET, PORT } = process.env;

module.exports = {
  env: NODE_ENV,
  dbMongo: DB_MONGO,
  jwtAuth: JWT_SECRET,
  port: PORT
};
