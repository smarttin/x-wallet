import mongoose from 'mongoose';
import validator from 'validator';

const type = ['deposit', 'withdrawal'];
const status = ['pending', 'success', 'failed'];

const transactionSchema = new mongoose.Schema(
  {
    transactionStatus: {
      type: String,
      enum: status,
      required: true,
    },
    transactionType: {
      type: String,
      enum: type,
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
      required: [true, 'Please provide amount'],
    },
    baseCurrency: {
      type: String,
      required: [true, 'Please provide base currency'],
    },
    targetCurrency: {
      type: String,
      required: [true, 'Please provide target currency'],
    },
    walletId: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      required: [true, 'Please provide user email for reference'],
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
  },
  {timestamps: true},
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
