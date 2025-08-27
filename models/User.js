const mongoose = require('mongoose');

<<<<<<< HEAD
// User Schema
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
  },
  {
    timestamps: true, // createdAt, updatedAt automatically
    versionKey: false, // remove __v field
  }
=======
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
>>>>>>> 177cb9c3252395a9fbf1d72cf40b9e5b66aae429
);

// Hide password when converting to JSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Export User model
module.exports = mongoose.model('User', UserSchema);
