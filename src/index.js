import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import globalErrorHandler from './controllers/errorController.js';
import AppError from './utils/appError.js';
import userRoutes from './routes/userRoutes.js';
import walletRoutes from './routes/walletRoutes.js';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Mount Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/wallets', walletRoutes);

// unknown route
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
// handle error
app.use(globalErrorHandler);

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
