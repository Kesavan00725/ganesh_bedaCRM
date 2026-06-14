import { Response } from 'express';
import Sale from '../models/Sale';
import Product from '../models/Product';
import Customer from '../models/Customer';
import { AuthRequest } from '../middleware/auth';

export const getSalesReport = async (req: AuthRequest, res: Response) => {
  try {
    const { period = 'monthly' } = req.query;

    let dateFilter: any = {};
    const now = new Date();

    switch (period) {
      case 'daily':
        dateFilter = { $gte: new Date(now.setHours(0, 0, 0, 0)), $lt: new Date(now.setHours(23, 59, 59, 999)) };
        break;
      case 'weekly':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        dateFilter = { $gte: weekStart };
        break;
      case 'monthly':
        dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
        break;
      case 'yearly':
        dateFilter = { $gte: new Date(now.getFullYear(), 0, 1) };
        break;
    }

    const sales = await Sale.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          totalGST: { $sum: '$gstAmount' },
          avgSaleValue: { $avg: '$total' }
        }
      }
    ]);

    res.json({
      period,
      data: sales[0] || { totalSales: 0, totalRevenue: 0, totalGST: 0, avgSaleValue: 0 }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getInventoryReport = async (req: AuthRequest, res: Response) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalValue = await Product.aggregate([
      { $group: { _id: null, value: { $sum: { $multiply: ['$price', '$stock'] } } } }
    ]);

    const categoryBreakdown = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          value: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      }
    ]);

    const lowStockProducts = await Product.find({ stock: { $lte: 5 } }).limit(10);

    res.json({
      totalProducts,
      totalValue: totalValue[0]?.value || 0,
      categoryBreakdown,
      lowStockProducts
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCustomerReport = async (req: AuthRequest, res: Response) => {
  try {
    const topCustomers = await Customer.find()
      .sort({ totalSpent: -1 })
      .limit(10);

    const vipCustomers = await Customer.countDocuments({ isVIP: true });

    const totalCustomers = await Customer.countDocuments();

    const customerStats = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$totalSpent' },
          avgSpent: { $avg: '$totalSpent' },
          totalPurchases: { $sum: '$totalPurchases' }
        }
      }
    ]);

    res.json({
      totalCustomers,
      vipCustomers,
      topCustomers,
      stats: customerStats[0] || { totalSpent: 0, avgSpent: 0, totalPurchases: 0 }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const exportReport = async (req: AuthRequest, res: Response) => {
  try {
    const { type, format } = req.body;

    let data: any;

    if (type === 'sales') {
      const sales = await Sale.find().populate('customerId', 'name phone');
      data = sales.map((s: any) => ({
        'Invoice #': s.saleNumber,
        'Customer': s.customerId?.name,
        'Phone': s.customerId?.phone,
        'Subtotal': s.subtotal,
        'GST': s.gstAmount,
        'Total': s.total,
        'Date': new Date(s.createdAt).toLocaleDateString()
      }));
    } else if (type === 'inventory') {
      const products = await Product.find();
      data = products.map((p: any) => ({
        'SKU': p.sku,
        'Product': p.name,
        'Category': p.category,
        'Price': p.price,
        'Stock': p.stock,
        'Value': p.price * p.stock
      }));
    } else if (type === 'customers') {
      const customers = await Customer.find();
      data = customers.map((c: any) => ({
        'Name': c.name,
        'Phone': c.phone,
        'Email': c.email || '-',
        'Total Spent': c.totalSpent,
        'Purchases': c.totalPurchases,
        'VIP': c.isVIP ? 'Yes' : 'No'
      }));
    }

    if (format === 'csv') {
      const csv = [Object.keys(data[0]).join(','), ...data.map((row: any) => Object.values(row).join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_report.csv"`);
      res.send(csv);
    } else if (format === 'json') {
      res.json(data);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
