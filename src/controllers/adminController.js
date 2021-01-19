import Transaction from '../models/transactionModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/userModel.js';
import Wallet from '../models/walletModel.js';
import {validateCurrency} from './authController.js';
import {convertToBase, generateTransactionDetails} from './transactionController.js';

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
const approveTransaction = catchAsync(async (req, res, next) => {
  const transactionId = req.params.id;
  if (!transactionId) {
    return next(new AppError('Enter transaction ID in order to approve transaction', 400));
  }

  // find specific pending transaction using transactionStatus & transaction ID
  const transaction = await Transaction.findOne({_id: transactionId, transactionStatus: 'pending'});

  if (!transaction) {
    return next(new AppError('This transaction does not exist!', 404));
  }
  // find get wallet and confirm transaction
  const wallet = await Wallet.findById(transaction.walletId);

  transaction.transactionStatus = 'success';
  wallet.balance += transaction.amount;

  await transaction.save();
  await wallet.save();

  res.status(200).json({
    status: 'Success',
    data: {
      message: `${transaction.reference}'s transaction, confirmed successfully`,
    },
  });
});

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
const FundAnyUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const {targetCurrency, amount} = req.body;
  if (!targetCurrency || targetCurrency.length > 3 || targetCurrency.length < 3) {
    return next(
      new AppError(
        'Please choose a valid currency symbol, currency symbol must be 3 letters eg - EUR or USD',
        400,
      ),
    );
  }

  // validate input currency using fixer.io, and return name & symbol
  const {symbol, name} = await validateCurrency(targetCurrency, next);

  // find user whose wallet will be funded not logged in user
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('user not found', 404));
  }

  // if user.isAdmin, user is an Admin
  // and Admins don't have wallet and shouldn't fund themselves
  if (user.isAdmin) {
    return next(new AppError('you cannot perform this action', 403));
  }

  // find user wallet with targetCurrency and fund it
  // if user does not have wallet with targetCurrency
  // create and fund it
  const wallet = await Wallet.find({owner: user._id});
  const userWallet = wallet.find((w) => w.currencySymbol === symbol);

  if (user.userType === 'noob' && !userWallet) {
    const noobWallet = wallet[0];
    // convert targetCurrency to noobs baseCurrecy and fund
    const amountInBaseCurrency = await convertToBase(user.baseCurrency, symbol, amount);
    await generateTransactionDetails(
      'success',
      'deposit',
      noobWallet.currencySymbol,
      symbol,
      user.email,
      amountInBaseCurrency,
      noobWallet._id,
    );

    // update noob user wallet
    noobWallet.balance += amountInBaseCurrency;
    const updateWallet = await noobWallet.save();

    return res.status(200).json({
      status: 'Success',
      message: `Admin's deposit for ${user.email}, successfully`,
      data: {
        wallet: updateWallet,
      },
    });
  }

  if (user.userType === 'elite' && !userWallet) {
    // create new wallet based on target and fund
    const newWallet = await Wallet.create({
      currencyName: name,
      currencySymbol: symbol,
      owner: user._id,
      balance: amount,
    });

    await generateTransactionDetails(
      'success',
      'deposit',
      symbol,
      symbol,
      user.email,
      amount,
      newWallet._id,
    );

    return res.status(200).json({
      status: 'Success',
      message: `Admin's deposit for ${user.email}, successfully`,
      data: {
        wallet: newWallet,
      },
    });
  }

  // fund user wallet that contains targetCurrency
  await generateTransactionDetails(
    'success',
    'deposit',
    userWallet.currencySymbol,
    symbol,
    user.email,
    amount,
    userWallet._id,
  );

  // update and return
  userWallet.balance += amount;
  const updateWallet = await userWallet.save();

  res.status(200).json({
    status: 'Success',
    message: `Admin's deposit for ${user.email}, successfully`,
    data: {
      wallet: updateWallet,
    },
  });
});

/**
 * Admin change the main/base currency of any user
 */
const changeBaseCurrency = catchAsync(async (req, res, next) => {
  const {newBaseCurrency} = req.body;
  if (!newBaseCurrency || newBaseCurrency.length > 3 || newBaseCurrency.length < 3) {
    return next(
      new AppError(
        'Please choose a valid currency symbol, currency symbol must be 3 letters eg - EUR or USD',
        400,
      ),
    );
  }

  const user = await User.findByIdAndUpdate(
    {_id: req.params.id},
    {$set: {baseCurrency: newBaseCurrency}},
    {new: true},
  );
  if (!user) {
    return next(new AppError('No user was found with that ID', 404));
  }

  res.status(200).json({
    status: 'Success',
    message: `user main currency successfully changed to ${updatedUser.baseCurrency}`,
    data: null,
  });
});

/**
 * Admin promote or demote Noobs or Elite users
 */
const changeUserType = catchAsync(async (req, res, next) => {
  const {newUserType} = req.body;
  if (!newUserType) {
    return next(new AppError('You have to enter new user type', 400));
  }
  // find user by id and update
  const user = await User.findByIdAndUpdate(
    {_id: req.params.id},
    {$set: {userType: newUserType}},
    {new: true},
  );

  if (!user) {
    return next(new AppError('No user was found with that ID', 404));
  }

  res.status(200).json({
    status: 'Success',
    message: `user type changed successfully changed to ${user.userType}`,
    data: null,
  });
});

export default {
  getPendingTransactions,
  approveTransaction,
  getUsers,
  getUserById,
  FundAnyUser,
  changeBaseCurrency,
  changeUserType,
};
