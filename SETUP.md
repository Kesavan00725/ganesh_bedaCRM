# Setup & Installation Guide

## Prerequisites

- **Node.js**: 16.x or higher
- **npm**: 8.x or higher
- **MongoDB**: Local installation or MongoDB Atlas account
- **Git**: For version control

---

## Installation Steps

### 1. Clone/Setup Project

```bash
cd ganesh-crm
```

### 2. MongoDB Setup

#### Option A: Local MongoDB

```bash
# Install MongoDB Community Edition
# https://docs.mongodb.com/manual/installation/

# Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Use in `.env` file

---

### 3. Backend Setup

```bash
cd backend
npm install

# Configure environment variables
# Edit .env file with:
# MONGODB_URI=mongodb://localhost:27017/ganesh-crm
# JWT_SECRET=your_secret_key_here
# PORT=5000
# NODE_ENV=development

# Run seed data (populates test data)
npm run seed

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

---

### 4. Frontend Setup

```bash
cd ../frontend
npm install

# Configure environment variables
# .env already has REACT_APP_API_URL=http://localhost:5000/api

# Start frontend development server
npm start
```

Frontend will open at `http://localhost:3000`

---

## Test Credentials

After running seed data, use:

| Role    | Email                  | Password    |
| ------- | ---------------------- | ----------- |
| Owner   | owner@ganeshbeda.com   | password123 |
| Manager | manager@ganeshbeda.com | password123 |
| Staff   | staff@ganeshbeda.com   | password123 |

---

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Key Endpoints

#### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - Logout

#### Customers

- `GET /customers` - List customers (search, filter, pagination)
- `POST /customers` - Create customer
- `GET /customers/:id` - Get customer details
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

#### Products (Inventory)

- `GET /products` - List products (search, filter, pagination)
- `POST /products` - Create product
- `GET /products/:id` - Get product details
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `GET /products/low-stock` - Get low stock products

#### Sales & Invoices

- `GET /sales` - List invoices
- `POST /sales` - Create invoice
- `GET /sales/:id` - Get invoice details
- `DELETE /sales/:id` - Delete invoice

#### Custom Orders

- `GET /orders` - List custom orders
- `POST /orders` - Create custom order
- `GET /orders/:id` - Get order details
- `PUT /orders/:id` - Update order status
- `DELETE /orders/:id` - Delete order

#### Dashboard

- `GET /dashboard/kpis` - Get KPI metrics
- `GET /dashboard/sales-chart` - Get sales chart data
- `GET /dashboard/product-distribution` - Get product distribution
- `GET /dashboard/recent-activities` - Get recent activities

#### Reports

- `GET /reports/sales?period=daily|weekly|monthly|yearly` - Sales reports
- `GET /reports/inventory` - Inventory report
- `GET /reports/customers` - Customer report
- `POST /reports/export` - Export report as CSV/JSON

#### Settings

- `GET /settings` - Get shop settings
- `PUT /settings` - Update shop settings
- `GET /settings/users` - List users (Owner only)
- `PUT /settings/users/:id` - Update user (Owner only)
- `DELETE /settings/users/:id` - Delete user (Owner only)

#### Notifications

- `GET /notifications` - Get notifications
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

---

## Project Structure

```
ganesh-crm/
├── backend/
│   ├── src/
│   │   ├── config/       # Database & app config
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth & error handling
│   │   ├── utils/        # Helpers & utilities
│   │   ├── seeds/        # Test data
│   │   └── server.ts     # Express app entry
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # Global state (Auth)
│   │   ├── services/     # API client
│   │   ├── layouts/      # Layout components
│   │   ├── App.tsx       # Main App
│   │   ├── index.tsx     # React entry
│   │   └── index.css     # Styles
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── .env
│
├── README.md
└── .gitignore
```

---

## Development Workflow

### Running Both Servers

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
```

### Building for Production

**Backend:**

```bash
cd backend
npm run build
npm start  # Runs dist/server.js
```

**Frontend:**

```bash
cd frontend
npm run build
# Outputs to build/ directory for deployment
```

---

## Features Implemented

✅ **Complete** - Authentication, Dashboard, Customer Management, Inventory, Sales, Custom Orders
⏳ **Placeholder UI** - Reports, Settings, Notifications
🔄 **Phase 2** - AI Sales Assistant, Advanced Reports, WhatsApp Integration

---

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- For MongoDB Atlas, whitelist your IP

### Port Already in Use

```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Missing Dependencies

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Error

- Ensure backend is running on correct port
- Check REACT_APP_API_URL in frontend .env

---

## Next Steps & Enhancements

1. **Add Tests** - Jest + React Testing Library
2. **Improve UI** - Complete all module pages
3. **Mobile App** - React Native version
4. **Notifications** - Real-time WebSocket updates
5. **AI Features** - OpenAI integration for smart search
6. **Deployment** - Docker, CI/CD pipeline
7. **Database** - Add MongoDB indexes for performance
8. **Security** - Add rate limiting, input validation

---

## Support

For issues or questions, contact: support@ganeshbeda.com

Happy Coding! 🎉
