import express from 'express';
import {
  getKPIs,
  getMonthlySalesChart,
  getProductDistribution,
  getRecentActivities
} from '../controllers/dashboard';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/kpis', getKPIs);
router.get('/sales-chart', getMonthlySalesChart);
router.get('/product-distribution', getProductDistribution);
router.get('/recent-activities', getRecentActivities);

export default router;
