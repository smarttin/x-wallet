import Transaction from '../models/transactionModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

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
 * Admin approves pending transactions for noob users using transaction ID
 */
const approveTransaction = catchAsync(async (req, res, next) => {});

/**
 * Admin get all user
 */
const getUsers = catchAsync(async (req, res, next) => {});

/**
 * Admin specific user by id
 */
const getUser = catchAsync(async (req, res, next) => {});

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
  getUser,
  FundAnyUser,
  changeBaseCurrency,
  changeUserType,
};
