import { Response } from 'express';
import Sale from '../models/Sale';
import Product from '../models/Product';
import Customer from '../models/Customer';
import { PAGINATION_LIMIT } from '../config/constants';
import { AuthRequest } from '../middleware/auth';

const generateSaleNumber = async () => {
  const count = await Sale.countDocuments();
  return `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
};

export const getSales = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = PAGINATION_LIMIT } = req.query;
    const skip = ((Number(page) - 1) * Number(limit));

    const total = await Sale.countDocuments();
    const sales = await Sale.find()
      .populate('customerId', 'name phone')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      sales,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSaleById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findById(id).populate('customerId').populate('items.productId');

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json(sale);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createSale = async (req: AuthRequest, res: Response) => {
  try {
    const { customerId, items, discount = 0, paymentMethod = 'cash', notes } = req.body;

    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      processedItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });

      product.stock -= item.quantity;
      await product.save();
    }

    const gstRate = 18;
    const gstAmount = (subtotal - discount) * (gstRate / 100);
    const total = subtotal + gstAmount - discount;

    const sale = new Sale({
      saleNumber: await generateSaleNumber(),
      customerId,
      items: processedItems,
      subtotal,
      gstAmount,
      gstRate,
      discount,
      total,
      paymentMethod,
      notes
    });

    await sale.save();

    const customer = await Customer.findById(customerId);
    if (customer) {
      customer.totalSpent += total;
      customer.totalPurchases += 1;
      customer.lastVisit = new Date();
      if (customer.totalSpent > 100000) {
        customer.isVIP = true;
      }
      await customer.save();
    }

    res.status(201).json({ message: 'Sale created', sale });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSale = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findByIdAndDelete(id);

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    for (const item of sale.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    res.json({ message: 'Sale deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
