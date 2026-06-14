import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';
import Customer from '../models/Customer';
import Product from '../models/Product';
import Sale from '../models/Sale';
import CustomOrder from '../models/CustomOrder';
import Settings from '../models/Settings';
import { ROLES, JEWELRY_CATEGORIES, PURITY_TYPES, ORDER_STATUSES } from '../config/constants';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ganesh-crm');
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Product.deleteMany({});
    await Sale.deleteMany({});
    await CustomOrder.deleteMany({});
    await Settings.deleteMany({});

    // Create users
    const hashedPassword = await bcryptjs.hash('password123', 10);
    const owner = await User.create({
      name: 'Ganesh Kumar',
      email: 'owner@ganeshbeda.com',
      password: hashedPassword,
      role: ROLES.OWNER,
      phone: '9876543210'
    });

    const manager = await User.create({
      name: 'Priya Sharma',
      email: 'manager@ganeshbeda.com',
      password: hashedPassword,
      role: ROLES.MANAGER,
      phone: '9876543211'
    });

    const staff = await User.create({
      name: 'Raj Singh',
      email: 'staff@ganeshbeda.com',
      password: hashedPassword,
      role: ROLES.STAFF,
      phone: '9876543212'
    });

    console.log('✓ Created users');

    // Create customers
    const customers = await Customer.insertMany([
      {
        name: 'Arun Kumar',
        phone: '9900001111',
        email: 'arun@example.com',
        address: '123 Gold Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        birthday: new Date('1990-05-15'),
        totalSpent: 125000,
        totalPurchases: 5,
        isVIP: true
      },
      {
        name: 'Divya Patel',
        phone: '9900002222',
        email: 'divya@example.com',
        address: '456 Diamond Lane',
        city: 'Bangalore',
        state: 'Karnataka',
        birthday: new Date('1992-08-22'),
        totalSpent: 85000,
        totalPurchases: 3,
        isVIP: false
      },
      {
        name: 'Rahul Singh',
        phone: '9900003333',
        email: 'rahul@example.com',
        address: '789 Silver Avenue',
        city: 'Delhi',
        state: 'Delhi',
        anniversary: new Date('2020-03-10'),
        totalSpent: 210000,
        totalPurchases: 8,
        isVIP: true
      }
    ]);

    console.log('✓ Created customers');

    // Create products
    const products = await Product.insertMany([
      {
        name: 'Gold Wedding Ring',
        sku: 'GWR-001',
        category: JEWELRY_CATEGORIES.GOLD,
        weight: 5,
        purity: PURITY_TYPES.GOLD_22K,
        makingCharges: 500,
        price: 25000,
        stock: 10,
        minStockLevel: 3,
        description: 'Traditional gold wedding ring'
      },
      {
        name: 'Diamond Necklace',
        sku: 'DNK-001',
        category: JEWELRY_CATEGORIES.DIAMOND,
        weight: 3,
        purity: PURITY_TYPES.DIAMOND_VS,
        makingCharges: 1000,
        price: 150000,
        stock: 2,
        minStockLevel: 2,
        description: 'Elegant diamond necklace'
      },
      {
        name: 'Silver Bangle Set',
        sku: 'SBS-001',
        category: JEWELRY_CATEGORIES.SILVER,
        weight: 50,
        purity: PURITY_TYPES.SILVER_925,
        makingCharges: 200,
        price: 8000,
        stock: 20,
        minStockLevel: 5,
        description: 'Set of 4 silver bangles'
      },
      {
        name: 'Platinum Pendant',
        sku: 'PPD-001',
        category: JEWELRY_CATEGORIES.PLATINUM,
        weight: 2,
        purity: PURITY_TYPES.PLATINUM_950,
        makingCharges: 2000,
        price: 80000,
        stock: 4,
        minStockLevel: 2,
        description: 'Exquisite platinum pendant'
      },
      {
        name: 'Gold Earrings',
        sku: 'GER-001',
        category: JEWELRY_CATEGORIES.GOLD,
        weight: 2,
        purity: PURITY_TYPES.GOLD_18K,
        makingCharges: 300,
        price: 12000,
        stock: 1,
        minStockLevel: 3,
        description: 'Delicate gold earrings'
      }
    ]);

    console.log('✓ Created products');

    // Create sales
    const sales = await Sale.insertMany([
      {
        saleNumber: 'INV-2024-00001',
        customerId: customers[0]._id,
        items: [
          {
            productId: products[0]._id,
            productName: products[0].name,
            quantity: 1,
            price: 25000,
            total: 25000
          }
        ],
        subtotal: 25000,
        gstAmount: 4500,
        gstRate: 18,
        discount: 0,
        total: 29500,
        paymentMethod: 'card'
      },
      {
        saleNumber: 'INV-2024-00002',
        customerId: customers[1]._id,
        items: [
          {
            productId: products[1]._id,
            productName: products[1].name,
            quantity: 1,
            price: 150000,
            total: 150000
          }
        ],
        subtotal: 150000,
        gstAmount: 27000,
        gstRate: 18,
        discount: 5000,
        total: 172000,
        paymentMethod: 'cash'
      }
    ]);

    console.log('✓ Created sales');

    // Create custom orders
    await CustomOrder.insertMany([
      {
        orderNumber: 'ORD-2024-00001',
        customerId: customers[0]._id,
        productType: 'Custom Engagement Ring',
        description: 'Diamond studded engagement ring with gold band',
        estimatedCost: 250000,
        status: ORDER_STATUSES.IN_PRODUCTION,
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        orderNumber: 'ORD-2024-00002',
        customerId: customers[2]._id,
        productType: 'Custom Bracelet',
        description: 'Platinum bracelet with ruby stones',
        estimatedCost: 180000,
        status: ORDER_STATUSES.PENDING,
        deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log('✓ Created custom orders');

    // Create settings
    await Settings.create({
      shopName: 'Ganesh Beda Jewellery',
      gstNumber: '27AABCT5055H1Z0',
      address: '123 Jewelry Lane, Premium Mall',
      phone: '080-12345678',
      email: 'info@ganeshbeda.com',
      owner: owner._id
    });

    console.log('✓ Created settings');

    console.log('\n✅ Seed data created successfully!');
    console.log('\nTest credentials:');
    console.log('Owner: owner@ganeshbeda.com / password123');
    console.log('Manager: manager@ganeshbeda.com / password123');
    console.log('Staff: staff@ganeshbeda.com / password123');
  } catch (error) {
    console.error('✗ Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
  }
};

connectDB().then(() => seedData());
