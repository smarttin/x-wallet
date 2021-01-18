import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import Wallet from '../models/walletModel.js';
import axios from 'axios';

// elite user can create more wallet & currencies
// get all wallet
// create new wallet
// update wallet
// delete wallet

const getMyWallets = catchAsync(async (req, res, next) => {
  const wallets = await Wallet.find({owner: req.user._id});

  if (!wallets) {
    return next(new AppError('No wallets found!', 404));
  }

  res.status(200).json({
    status: 'Success',
    results: wallets.length,
    data: {
      wallets: wallets,
    },
  });
});

const createNewWallet = catchAsync(async (req, res, next) => {
  const {currencySymbol} = req.body;
  if (!currencySymbol || currencySymbol.length > 3 || currencySymbol.length < 3) {
    return next(
      new AppError(
        'Please choose a valid currency symbol, currency symbol must be 3 letters eg - EUR or USD',
        400,
      ),
    );
  }

  // validate input currency using fixer.io, and return name & symbol
  const {symbol, name} = await validateCurrency(currencySymbol, next);

  // logged in user
  const user = req.user;

  const walletExists = await Wallet.findOne({owner: user._id, currencySymbol: symbol});
  if (walletExists) {
    return next(new AppError('Wallet for selected currency already exist!', 409));
  }

  const newWallet = await Wallet.create({
    currencyName: name,
    currencySymbol: symbol,
    owner: req.user._id,
  });

  res.status(200).json({
    status: 'Success',
    data: {
      wallet: newWallet,
    },
  });
});

export default {getMyWallets, createNewWallet};
