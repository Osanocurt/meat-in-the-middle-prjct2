const mongoose = require('mongoose');


const pubSchema = mongoose.Schema({
  name: { type: String, trim: true, required: true, unique: true },
  location: { type: String, trim: true, required: true },
  rating: { type: Number, trim: true, required:true }
});








module.exports = mongoose.model('Pub', pubSchema);
