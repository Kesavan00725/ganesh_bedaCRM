import { Response } from 'express';
import User from '../models/User';
import Settings from '../models/Settings';
import { AuthRequest } from '../middleware/auth';
import { ROLES } from '../config/constants';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role, phone, isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated', user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user?.userId === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await Settings.findOne().populate('owner', 'name email');

    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { shopName, gstNumber, address, phone, email, logo } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings({
        shopName,
        gstNumber,
        address,
        phone,
        email,
        logo,
        owner: req.user?.userId
      });
    } else {
      settings.shopName = shopName || settings.shopName;
      settings.gstNumber = gstNumber || settings.gstNumber;
      settings.address = address || settings.address;
      settings.phone = phone || settings.phone;
      settings.email = email || settings.email;
      if (logo) settings.logo = logo;
    }

    await settings.save();

    res.json({ message: 'Settings updated', settings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
