const mongoose = require('mongoose');


const friendSchema = mongoose.Schema({
  name: { type: String, trim: true, required: true, unique: true },
  location: { type: String, trim: true, required: true }
});








module.exports = mongoose.model('Friend', friendSchema);
