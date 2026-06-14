import express from 'express';
import { getUsers, updateUser, deleteUser, getSettings, updateSettings } from '../controllers/settings';
import { authMiddleware, roleCheck } from '../middleware/auth';
import { ROLES } from '../config/constants';

const router = express.Router();

router.use(authMiddleware);

// Users
router.get('/users', roleCheck([ROLES.OWNER]), getUsers);
router.put('/users/:id', roleCheck([ROLES.OWNER]), updateUser);
router.delete('/users/:id', roleCheck([ROLES.OWNER]), deleteUser);

// Settings
router.get('/', getSettings);
router.put('/', roleCheck([ROLES.OWNER]), updateSettings);

export default router;
