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
    role: {
      type: String,
      enum: ['user', 'admin'], // শুধু এই দুই role allow করবে
      default: 'user', // default হবে "user"
    },
    isActive: {
      type: Boolean,
      default: false, // register করার পর OTP verify না করলে false
    },

    // ---------------- OTP Verification Fields ----------------
    otp: {
      type: String,
    },
    otpExpire: {
      type: Date,
    },

    // ---------------- Forgot Password Fields ----------------
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Hide password when converting to JSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp; // OTP hide
  delete obj.otpExpire; // OTP expire hide
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
