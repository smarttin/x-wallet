import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

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
    userType: {
      type: String,
      enum: usertype,
      default: 'noob',
    },
    baseCurrency: {
      type: String,
      default: 'EUR',
      uppercase: true,
    },
    hasWallet: {
      type: Boolean,
      default: true,
      select: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {timestamps: true},
);

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.methods.matchPassword = async function (enteredPassword, userPassword) {
  return await bcrypt.compare(enteredPassword, userPassword);
};

const User = mongoose.model('User', userSchema);

export default User;
