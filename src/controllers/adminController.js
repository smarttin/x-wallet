import Transaction from '../models/transactionModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/userModel.js';
import Wallet from '../models/walletModel.js';

/**
 * Admin gets the list of pending transactions
 */
const getPendingTransactions = catchAsync(async (req, res, next) => {
  const pendingTransactions = await Transaction.find({transactionStatus: 'pending'});

  if (!pendingTransactions) {
    return next(new AppError('No pending transactions found', 404));
  }

  res.status(200).json({
    status: 'Success',
    data: pendingTransactions,
  });
});

/**
 * Admin approve pending transactions for noob users using transaction ID
 */
const approveTransaction = catchAsync(async (req, res, next) => {});

/**
 * Admin get all user
 */
const getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({});

  if (!users) {
    return next(new AppError('No user found', 404));
  }

  res.status(200).json({
    status: 'Success',
    results: users.length,
    data: {
      users: users,
    },
  });
});

/**
 * Admin specific user by id
 */
const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'Success',
    data: {
      user: user,
    },
  });
});

/**
 * Admin fund wallets for Noob or Elite users in any currency
 */
const FundAnyUser = catchAsync(async (req, res, next) => {});

/**
 * Admin change the main/base currency of any user
 */
const changeBaseCurrency = catchAsync(async (req, res, next) => {});

/**
 * Admin promote or demote Noobs or Elite users
 */
const changeUserType = catchAsync(async (req, res, next) => {});

export default {
  getPendingTransactions,
  approveTransaction,
  getUsers,
  getUserById,
  FundAnyUser,
  changeBaseCurrency,
  changeUserType,
};
