import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const adminId = mongoose.Types.ObjectId();
const eliteId = mongoose.Types.ObjectId();
const noobId = mongoose.Types.ObjectId();

const eliteWalletId = mongoose.Types.ObjectId();
const noobWalletId = mongoose.Types.ObjectId();

const testPassword = bcrypt.hashSync('121212', 12);

const users = [
  {
    _id: adminId,
    username: 'admin',
    email: 'admin@gmail.com',
    password: testPassword,
    userType: 'admin',
    baseCurrency: null,
    hasWallet: false,
    isAdmin: true,
  },
  {
    _id: eliteId,
    username: 'elite',
    email: 'elite@gmail.com',
    password: testPassword,
    userType: 'elite',
    baseCurrency: 'CAD',
    hasWallet: true,
  },
  {
    _id: noobId,
    username: 'nooob',
    email: 'noob@gmail.com',
    password: testPassword,
    userType: 'noob',
    baseCurrency: 'EUR',
    hasWallet: true,
  },
];

const wallets = [
  {
    _id: eliteWalletId,
    currencyName: 'CAD',
    currencySymbol: 'CAD',
    owner: eliteId,
  },
  {
    _id: noobWalletId,
    currencyName: 'EUR',
    currencySymbol: 'EUR',
    owner: noobId,
  },
];

export {users, wallets};
