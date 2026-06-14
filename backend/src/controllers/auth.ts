import { Response } from 'express';
import bcryptjs from 'bcryptjs';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { validateEmail, validatePassword } from '../utils/validation';
import { AuthRequest } from '../middleware/auth';
import { ROLES } from '../config/constants';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!validateEmail(email) || !validatePassword(password)) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || ROLES.STAFF
    });

    await user.save();

    const token = generateToken({ userId: user._id.toString(), email: user.email, role: user.role });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcryptjs.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ userId: user._id.toString(), email: user.email, role: user.role });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = (req: AuthRequest, res: Response) => {
  res.json({ message: 'Logout successful' });
};

export const refreshToken = (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const token = generateToken({
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role
    });

    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
