import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    currencyName: {
      type: String,
      required: [true, 'Currency name required'],
      minlength: [3, 'Currency name must be 3 letters eg - EUR'],
      maxlength: [3, 'Currency name must be 3 letters eg - EUR'],
    },
    currencySymbol: String,
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  {timestamps: true},
);

const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet;
