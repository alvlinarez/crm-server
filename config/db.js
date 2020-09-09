const mongoose = require('mongoose');
const config = require('./env');

const connectionDB = async () => {
  try {
    await mongoose.connect(config.dbMongo, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    });
  } catch (e) {
    console.log('An error happened!');
    console.log(e);
    process.exit(1);
  }
};

module.exports = connectionDB;
