import { Response } from 'express';
import Product from '../models/Product';
import Notification from '../models/Notification';
import { PAGINATION_LIMIT, LOW_STOCK_THRESHOLD, NOTIFICATION_TYPES } from '../config/constants';
import { AuthRequest } from '../middleware/auth';

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { search, category, page = 1, limit = PAGINATION_LIMIT } = req.query;
    const skip = ((Number(page) - 1) * Number(limit));

    let query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      query.category = category;
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      products,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, sku, category, weight, purity, makingCharges, price, stock, description, image } = req.body;

    const product = new Product({
      name,
      sku,
      category,
      weight,
      purity,
      makingCharges,
      price,
      stock,
      description,
      image
    });

    await product.save();
    res.status(201).json({ message: 'Product created', product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { new: true });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product updated', product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLowStockProducts = async (req: AuthRequest, res: Response) => {
  try {
    const products = await Product.find({ stock: { $lte: LOW_STOCK_THRESHOLD } });

    for (const product of products) {
      const existingNotif = await Notification.findOne({
        type: NOTIFICATION_TYPES.LOW_STOCK,
        relatedId: product._id
      });

      if (!existingNotif) {
        await Notification.create({
          type: NOTIFICATION_TYPES.LOW_STOCK,
          title: 'Low Stock Alert',
          message: `Product "${product.name}" is running low (${product.stock} units)`,
          relatedId: product._id
        });
      }
    }

    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
