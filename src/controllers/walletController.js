import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import Wallet from '../models/walletModel.js';

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
  const {currencyName} = req.body;
  if (!currencyName) {
    return next(new AppError('Please provide currency name!', 400));
  }

  const user = req.user;
  // const user = await User.findById(req.user._id);

  const ownWallets = await Wallet.find({owner: user._id});
  // console.log('ownWallets', ownWallets);

  const alreadyPresent = ownWallets.filter((wallet) => wallet.currencyName === currencyName);

  // console.log('alreadyPresent', alreadyPresent);

  if (alreadyPresent.length) {
    return next(new AppError('Wallet or selected currency already exist!', 409));
  }

  const newWallet = await Wallet.create({
    currencyName: currencyName,
    currencySymbol: currencyName,
    owner: req.user._id,
  });

  user.wallet.push(newWallet._id);

  await user.save();

  res.status(200).json({
    status: 'Success',
    data: {
      currency: newWallet,
    },
  });
});

export default {getMyWallets, createNewWallet};
