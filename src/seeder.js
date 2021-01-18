import dotenv from 'dotenv';
import colors from 'colors';
import connectDB from './config/database.js';
import Wallet from './models/walletModel.js';
import User from './models/userModel.js';
import {users, wallets} from './data/data.js';
import Transaction from './models/transactionModel.js';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Wallet.deleteMany();
    await Transaction.deleteMany();

    await User.insertMany(users);
    await Wallet.insertMany(wallets);

    console.log('Data Imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Wallet.deleteMany();
    await Transaction.deleteMany();

    console.log('Data Deleted!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === '-import') {
  importData();
} else if (process.argv[2] === '-delete') {
  destroyData();
}
