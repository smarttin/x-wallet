import axios from 'axios';
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

export const validateCurrency = async (currency, next) => {
  // use fixer.io/api/symbols to validate currency symbol and obtain currency name
  const currency_symbol = `http://data.fixer.io/api/symbols?access_key=${process.env.API_KEY}`;
  const {data} = await axios.get(currency_symbol);

  if (!data.symbols.hasOwnProperty(currency)) {
    return next(
      new AppError(
        'Please choose a valid currency symbol, currency symbol must be 3 letters eg - EUR or USD',
        400,
      ),
    );
  }

  const symbol = currency;
  const name = data.symbols[currency];
  return {symbol, name};
};

const signup = catchAsync(async (req, res, next) => {
  const {username, email, password, passwordConfirm, userType, baseCurrency} = req.body;
  if (!baseCurrency || baseCurrency.length > 3 || baseCurrency.length < 3) {
    return next(
      new AppError(
        'Please choose a valid currency symbol, currency symbol must be 3 letters eg - EUR or USD',
        400,
      ),
    );
  }
  if (password !== passwordConfirm) {
    return next(new AppError('Passwords must match', 400));
  }

  // validate input currency using fixer.io, and return name & symbol
  const {symbol, name} = await validateCurrency(baseCurrency, next);

  const newUser = {
    username,
    email,
    password,
    userType,
    baseCurrency: symbol,
  };

  if (userType === 'admin') {
    newUser.baseCurrency = null;
    newUser.hasWallet = false;
    newUser.isAdmin = true;
  }

  //userModel data validation
  const user = new User(newUser);
  if (!user) {
    return next(new AppError('Invalid user data!', 400));
  }

  if (user.hasWallet) {
    await Wallet.create({
      currencyName: name,
      currencySymbol: symbol,
      owner: user._id,
    });
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

const protectRoute = catchAsync(async (req, res, next) => {
  // get token from req.header OR req.cookies
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user with this token does no longer exist.', 401));
  }

  // grant access to protected route
  req.user = currentUser;
  next();
});

const restrictTo = (...userType) => {
  return (req, res, next) => {
    if (!userType.includes(req.user.userType)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

export default {signup, signin, protectRoute, restrictTo};
