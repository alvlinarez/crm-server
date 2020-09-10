const config = require('./config/env');
const connectionDb = require('./config/db');
const { ApolloServer } = require('apollo-server');
const jwt = require('jsonwebtoken');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');

connectionDb();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers['authorization'] || '';
    if (token) {
      try {
        const { sub: id, name, surname, email } = jwt.verify(
          token.replace('Bearer ', ''),
          config.jwtAuth
        );
        return {
          user: { id, name, surname, email }
        };
      } catch (e) {
        console.log('An error happened!');
        console.log(e);
      }
    }
  }
});

server.listen({ port: process.env.PORT || 4001 }).then(({ url }) => {
  console.log(`Server running on URL: ${url}`);
});
