import express from 'express';
import { getSales, getSaleById, createSale, deleteSale } from '../controllers/sales';
import { authMiddleware, roleCheck } from '../middleware/auth';
import { ROLES } from '../config/constants';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getSales);
router.get('/:id', getSaleById);
router.post('/', roleCheck([ROLES.OWNER, ROLES.MANAGER, ROLES.STAFF]), createSale);
router.delete('/:id', roleCheck([ROLES.OWNER, ROLES.MANAGER]), deleteSale);

export default router;
