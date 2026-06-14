import { Response } from 'express';
import CustomOrder from '../models/CustomOrder';
import { ORDER_STATUSES, PAGINATION_LIMIT, ROLES } from '../config/constants';
import { AuthRequest } from '../middleware/auth';

const generateOrderNumber = async () => {
  const count = await CustomOrder.countDocuments();
  return `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = 1, limit = PAGINATION_LIMIT } = req.query;
    const skip = ((Number(page) - 1) * Number(limit));

    let query: any = {};
    if (status) {
      query.status = status;
    }

    const total = await CustomOrder.countDocuments(query);
    const orders = await CustomOrder.find(query)
      .populate('customerId', 'name phone')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      orders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await CustomOrder.findById(id).populate('customerId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { customerId, productType, description, estimatedCost, deliveryDate, notes } = req.body;

    const order = new CustomOrder({
      orderNumber: await generateOrderNumber(),
      customerId,
      productType,
      description,
      estimatedCost,
      deliveryDate,
      notes,
      status: ORDER_STATUSES.PENDING
    });

    await order.save();
    res.status(201).json({ message: 'Order created', order });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, deliveryDate, notes } = req.body;

    // Staff role restriction: cannot modify status or deliveryDate
    if (req.user?.role === ROLES.STAFF) {
      const existingOrder = await CustomOrder.findById(id);
      if (!existingOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Only allow updating notes
      existingOrder.notes = notes;
      await existingOrder.save();
      
      return res.json({ message: 'Order updated (notes only)', order: existingOrder });
    }

    const order = await CustomOrder.findByIdAndUpdate(
      id,
      { status, deliveryDate, notes },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order updated', order });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await CustomOrder.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
