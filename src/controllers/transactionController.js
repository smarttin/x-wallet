import axios from 'axios';
import Transaction from '../models/transactionModel.js';
import Wallet from '../models/walletModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const base_url = `http://data.fixer.io/api`;

const convertCurrency = (currency, amount) => {
  return amount * currency;
};

// generates transaction details and save
export const generateTransactionDetails = (status, type, base, target, reference, amount, id) => {
  return Transaction.create({
    transactionStatus: status,
    transactionType: type,
    baseCurrency: base,
    targetCurrency: target,
    reference: reference,
    amount: amount,
    walletId: id,
  });
};

// converts targetCurrency to baseCurrency
export const convertToBase = async (base, target, amount) => {
  const rates_url = `${base_url}/latest?access_key=${process.env.API_KEY}&symbols=${base},${target}`;

  const {data} = await axios.get(rates_url);
  if (!data) {
    return next(new AppError('transaction rates not available at this time', 503));
  }
  const targetCurrencyRate = Object.values(data.rates)[1];
  const amountInBaseCurrency = convertCurrency(targetCurrencyRate, amount);
  return amountInBaseCurrency;
};

//TODO: use fixer.io/api/symbols to validate currency symbol and obtain currency name
/**
 * Deposit / Fund currnecy to same or different wallet
 */
const deposit = catchAsync(async (req, res, next) => {
  const {targetCurrency, amount} = req.body;
  if (!targetCurrency || !amount) {
    return next(new AppError('Please choose transaction target currency and amount'));
  }

  //logged in user & transaction reference
  const user = req.user;

  // user.baseCurrency === targetCurrency i.e deposit is based on same currency
  // since this is only accessible to noob/elite, user must! have wallet[atleast one]
  // find user wallet that contains targetCurrency
  const wallet = await Wallet.find({owner: user._id}); //currencySymbol: targetCurrency
  const userWallet = wallet.find((w) => w.currencySymbol === targetCurrency);

  // for noob users where baseCurreny !== targetCurrency
  if (user.userType === 'noob' && user.baseCurrency !== targetCurrency) {
    //convert targetCurrency to baseCurrency using Latest Rates Endpoint
    const amountInBaseCurrency = await convertToBase(user.baseCurrency, targetCurrency, amount);

    await generateTransactionDetails(
      'pending',
      'deposit',
      user.baseCurrency,
      targetCurrency,
      user.email,
      amountInBaseCurrency,
      userWallet._id,
    );

    return res.json({
      status: 'success',
      message: 'You transaction is successful pending approval by the x-wallet admin',
      data: null,
    });
  }

  // for elite users where baseCurreny !== targetCurrency
  if (user.userType === 'elite' && user.baseCurrency !== targetCurrency) {
    // check if elite user already has wallet with targetCurrency
    // if yes update it, if no create and update it
    let updateWallet;

    if (!userWallet) {
      // user[elite] has no wallet based on targetCurrency, create it
      updateWallet = await Wallet.create({
        currencyName: targetCurrency,
        currencySymbol: targetCurrency,
        owner: user._id,
        balance: amount,
      });
    } else {
      // user[elite] has wallet based on targetCurrency, update it
      userWallet.balance += amount;
      updateWallet = await userWallet.save();
    }

    await generateTransactionDetails(
      'success',
      'deposit',
      user.baseCurrency,
      targetCurrency,
      user.email,
      amount,
      updateWallet._id,
    );

    return res.json({
      status: 'success',
      message: 'You transaction is successful',
      data: updateWallet,
    });
  }

  // user.baseCurrency === targetCurreny
  let updateWallet;
  let message;

  // update if userType === elite else
  if (user.userType === 'elite') {
    userWallet.balance += amount;
    updateWallet = await userWallet.save();
    message = 'You transaction is successful';
  } else if (user.userType === 'noob') {
    // send message telling (noob) user to await admin confirmation
    updateWallet = null;
    message = 'You transaction is successful pending approval by the x-wallet admin';
  }

  const transactionStatus = user.userType === 'noob' ? 'pending' : 'success';
  await generateTransactionDetails(
    transactionStatus,
    'deposit',
    user.baseCurrency,
    targetCurrency,
    user.email,
    amount,
    userWallet._id,
  );

  res.status(200).json({
    status: 'Success',
    message: message,
    data: {
      wallet: updateWallet,
    },
  });
});

const withdraw = catchAsync(async (req, res, next) => {});

export default {deposit, withdraw};
