import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const adminId = mongoose.Types.ObjectId();
const eliteId = mongoose.Types.ObjectId();
const noobId = mongoose.Types.ObjectId();

const walletId0 = mongoose.Types.ObjectId();
const walletId1 = mongoose.Types.ObjectId();
const walletId2 = mongoose.Types.ObjectId();

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
    _id: walletId0,
    currencyName: 'Canadian Dollar',
    currencySymbol: 'CAD',
    owner: eliteId,
  },
  {
    _id: walletId1,
    currencyName: 'Euro',
    currencySymbol: 'EUR',
    owner: noobId,
  },
  {
    _id: walletId2,
    currencyName: 'United States Dollar',
    currencySymbol: 'USD',
    owner: eliteId,
  },
];

export {users, wallets};
