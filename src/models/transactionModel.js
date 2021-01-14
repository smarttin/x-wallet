import mongoose from 'mongoose';

const type = ['deposit', 'withdrawal'];
const status = ['pending', 'success', 'failed'];

const transactionSchema = new mongoose.Schema(
  {
    transaction_status: {
      type: String,
      enum: status,
      required: true,
    },
    transaction_type: {
      type: String,
      enum: type,
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
      required: true,
    },
    baseCurrency: {
      type: String,
      required: true,
    },
    targetCurrency: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {timestamps: true},
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
