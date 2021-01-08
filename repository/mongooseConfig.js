const mongoose = require("mongoose");

const connect = () => {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(process.env.MONGODB_CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      })
      .then((res, err) => {
        if (err) return reject(err);
        resolve();
      });
  });
};

const close = () => {
  return mongoose.disconnect();
};

module.exports = {
  connect,
  close,
};
