import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts
} from '../controllers/products';
import { authMiddleware, roleCheck } from '../middleware/auth';
import { ROLES } from '../config/constants';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/:id', getProductById);
router.post('/', roleCheck([ROLES.OWNER, ROLES.MANAGER]), createProduct);
router.put('/:id', roleCheck([ROLES.OWNER, ROLES.MANAGER]), updateProduct);
router.delete('/:id', roleCheck([ROLES.OWNER]), deleteProduct);

export default router;
