import express from 'express';
import authController from '../controllers/authController.js';
import transactionController from '../controllers/transactionController.js';
import adminController from '../controllers/adminController.js';

const router = express.Router();

// all routes after this middleware are Protected
router.use(authController.protectRoute);

router
  .route('/deposit')
  .post(authController.restrictTo('noob', 'elite'), transactionController.deposit);

router
  .route('/withdraw')
  .post(authController.restrictTo('noob', 'elite'), transactionController.withdraw);

// all routes after this middleware are restricted to admin
router.use(authController.restrictTo('admin'));

router.route('/admin').get(adminController.getPendingTransactions);

router.route('/admin/users').get(adminController.getUsers);

router
  .route('/admin/:id')
  .get(adminController.getUser)
  .post(adminController.FundAnyUser)
  .patch(adminController.approveTransaction)
  .patch(adminController.changeBaseCurrency)
  .patch(adminController.changeUserType);

export default router;
