import express from 'express';
import { getSalesReport, getInventoryReport, getCustomerReport, exportReport } from '../controllers/reports';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/sales', getSalesReport);
router.get('/inventory', getInventoryReport);
router.get('/customers', getCustomerReport);
router.post('/export', exportReport);

export default router;
