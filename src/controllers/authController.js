import jwt from 'jsonwebtoken';
import {promisify} from 'util';
import User from '../models/userModel.js';
import Wallet from '../models/walletModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// sign JWT Token
const signToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// creates and send jwt token embedded in cookie
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'Success',
    token,
    data: {
      user: user,
    },
  });
};

const signup = catchAsync(async (req, res, next) => {
  const {username, email, password, passwordConfirm, userType, baseCurrency} = req.body;

  const newUserData = {
    username,
    email,
    password,
    passwordConfirm,
    userType,
    baseCurrency,
  };

  if (userType === 'admin') {
    newUserData.baseCurrency = null;
    newUserData.hasWallet = false;
    newUserData.wallet = null;
  }

  const user = new User(newUserData);

  if (user.hasWallet) {
    const wallet = await Wallet.create({
      currency: {name: baseCurrency},
      owner: user._id,
    });

    await user.wallet.push(wallet._id);
  }

  if (!user) {
    return next(new AppError('Invalid user data!', 400));
  }

  await user.save();

  createSendToken(user, 201, res);
});

const signin = catchAsync(async (req, res, next) => {
  const {email, password} = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({email}).select('+password');

  if (!user || !(await user.matchPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});

export default {signup, signin};
