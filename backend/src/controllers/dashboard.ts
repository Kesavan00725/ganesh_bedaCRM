import { Response } from 'express';
import Customer from '../models/Customer';
import Product from '../models/Product';
import Sale from '../models/Sale';
import CustomOrder from '../models/CustomOrder';
import { AuthRequest } from '../middleware/auth';
import { LOW_STOCK_THRESHOLD, ORDER_STATUSES } from '../config/constants';

export const getKPIs = async (req: AuthRequest, res: Response) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalSales = await Sale.countDocuments();
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: LOW_STOCK_THRESHOLD } });

    const currentMonth = new Date();
    currentMonth.setDate(1);

    const monthlyRevenue = await Sale.aggregate([
      { $match: { createdAt: { $gte: currentMonth } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const pendingOrders = await CustomOrder.countDocuments({
      status: { $in: [ORDER_STATUSES.PENDING, ORDER_STATUSES.APPROVED, ORDER_STATUSES.IN_PRODUCTION] }
    });

    res.json({
      totalCustomers,
      totalProducts,
      totalSales,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      lowStockProducts,
      pendingOrders
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMonthlySalesChart = async (req: AuthRequest, res: Response) => {
  try {
    const lastTwelveMonths = new Date();
    lastTwelveMonths.setMonth(lastTwelveMonths.getMonth() - 12);

    const sales = await Sale.aggregate([
      { $match: { createdAt: { $gte: lastTwelveMonths } } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          total: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const labels = sales.map((s: any) => `${s._id.month}/${s._id.year}`);
    const data = sales.map((s: any) => s.total);

    res.json({ labels, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductDistribution = async (req: AuthRequest, res: Response) => {
  try {
    const distribution = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const labels = distribution.map((d: any) => d._id);
    const data = distribution.map((d: any) => d.count);

    res.json({ labels, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRecentActivities = async (req: AuthRequest, res: Response) => {
  try {
    const recentCustomers = await Customer.find().sort({ createdAt: -1 }).limit(5);
    const recentSales = await Sale.find().sort({ createdAt: -1 }).limit(5).populate('customerId', 'name');
    const pendingOrders = await CustomOrder.find({
      status: { $in: [ORDER_STATUSES.PENDING, ORDER_STATUSES.IN_PRODUCTION] }
    }).sort({ createdAt: -1 }).limit(5).populate('customerId', 'name');

    res.json({
      recentCustomers,
      recentSales,
      pendingOrders
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
