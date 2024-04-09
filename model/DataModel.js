const mongoose = require('mongoose');
const dataSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: String,
});
const DataModel = mongoose.model('Data', dataSchema);

module.exports = DataModel;
