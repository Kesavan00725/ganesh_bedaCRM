import express from 'express';
import { getOrders, getOrderById, createOrder, updateOrder, deleteOrder } from '../controllers/orders';
import { authMiddleware, roleCheck } from '../middleware/auth';
import { ROLES } from '../config/constants';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', roleCheck([ROLES.OWNER, ROLES.MANAGER, ROLES.STAFF]), createOrder);
router.put('/:id', roleCheck([ROLES.OWNER, ROLES.MANAGER, ROLES.STAFF]), updateOrder);
router.delete('/:id', roleCheck([ROLES.OWNER]), deleteOrder);

export default router;
