import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { fundWalletSchema, transferSchema, withdrawSchema } from '../utils/validation';

const router = Router();
const walletController = new WalletController();

router.use(authenticate); // All wallet routes require authentication

router.get('/balance', walletController.getBalance);
router.post('/fund', validateRequest(fundWalletSchema), walletController.fundWallet);
router.post('/transfer', validateRequest(transferSchema), walletController.transfer);
router.post('/withdraw', validateRequest(withdrawSchema), walletController.withdraw);
router.get('/transactions', walletController.getTransactions);

export default router;


