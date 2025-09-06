const mongoose = require('mongoose');
const validator = require('validator'); // npm install validator

// User Schema
const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full Name is required'],
      trim: true,
      maxlength: [50, 'Full Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      match: [/^[0-9]{10,15}$/, 'Phone must be 10-15 digits'],
    },
    nidNumber: {
      type: String,
      required: [true, 'NID is required'],
      trim: true,
      match: [/^[0-9]{10,17}$/, 'NID must be 10-17 digits'],
    },
    dob: {
      type: Date,
      required: [true, 'Date of Birth is required'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },
    accountType: {
      type: String,
      enum: ['savings', 'current'],
      required: [true, 'Account type is required'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: false, // OTP verify না হলে false
    },
    // OTP Verification
    otp: { type: String },
    otpExpire: { type: Date },
    // Forgot Password
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Hide sensitive fields
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpire;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

// Virtual id field
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

UserSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', UserSchema);
