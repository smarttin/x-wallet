import express from 'express';
import authController from '../controllers/authController.js';
import walletController from '../controllers/walletController.js';

const router = express.Router();

router
  .route('/')
  .get(authController.protectRoute, walletController.getMyWallets)
  .post(
    authController.protectRoute,
    authController.restrictTo('elite'),
    walletController.createNewWallet,
  );

export default router;
