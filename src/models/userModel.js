import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';

const usertype = ['noob', 'elite', 'admin'];

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please tell us your username!'],
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same!',
      },
    },
    userType: {
      type: String,
      enum: usertype,
      default: 'noob',
    },
    baseCurrency: {
      type: String,
      // required: true,
      default: 'EUR',
    },
    hasWallet: {
      type: Boolean,
      required: true,
      default: true,
    },
    wallet: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Wallet',
        required: [true, 'Wallet must belong to a user'],
      },
    ],
  },
  {timestamps: true},
);

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.matchPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

export default User;
