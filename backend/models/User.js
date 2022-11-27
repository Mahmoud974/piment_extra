const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
/**
 * Préparer le schema utilisateur
 */
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
//Iddentifier comme en étant unique
userSchema.plugin(uniqueValidator);
module.exports = mongoose.model("User", userSchema);
