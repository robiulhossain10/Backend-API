const mongoose = require('mongoose');

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
);

// Hide password when converting to JSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Export User model
module.exports = mongoose.model('User', UserSchema);
