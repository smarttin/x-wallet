import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    currencyName: {
      type: String,
      required: [true, 'Currency name required'],
    },
    currencySymbol: {
      type: String,
      minlength: [3, 'Currency symbol must be 3 letters eg - EUR'],
      maxlength: [3, 'Currency symbol must be 3 letters eg - EUR'],
      required: [true, 'Currency symbol is required'],
      uppercase: true,
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {timestamps: true},
);

const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet;
