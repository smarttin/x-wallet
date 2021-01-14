import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    currency: [
      {
        name: {type: String},
        symbol: {type: String},
      },
    ],
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {timestamps: true},
);

const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet;
