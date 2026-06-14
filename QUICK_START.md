# 🚀 GANESH BEDA CRM - QUICK START REFERENCE

## ✅ Installation Complete!

**All npm packages installed successfully:**

- Backend: 217 packages ✅
- Frontend: 1333 packages ✅

## 📋 Pre-requisite: MongoDB Setup

> **IMPORTANT: MongoDB must be configured before running the app**

### Easiest Way: MongoDB Atlas (Cloud)

```
1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Copy connection string
5. Update backend/.env with your connection string
```

### Alternative: MongoDB Local

```
1. Download from: https://www.mongodb.com/try/download/community
2. Install & run: mongod
3. Uses default .env (localhost:27017)
```

## 🎯 Run Application in 3 Steps

### Step 1: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected:** ✓ Server running on port 5000

### Step 2: Seed Database (New Terminal)

```bash
cd backend
npm run seed
```

**Expected:** ✅ Seed data created successfully!

### Step 3: Start Frontend (New Terminal)

```bash
cd frontend
npm start
```

**Expected:** App opens at http://localhost:3000

## 🔐 Login Credentials

| Role    | Email                  | Password    |
| ------- | ---------------------- | ----------- |
| Owner   | owner@ganeshbeda.com   | password123 |
| Manager | manager@ganeshbeda.com | password123 |
| Staff   | staff@ganeshbeda.com   | password123 |

## 📚 Documentation Files

- **README.md** - Project overview
- **SETUP.md** - Detailed installation guide
- **MONGODB_SETUP.md** - MongoDB configuration steps
- **COMPLETION_SUMMARY.md** - Feature breakdown
- **QUICK_START.md** - This file

## 🔗 Access Points

| Component   | URL                       | Port  |
| ----------- | ------------------------- | ----- |
| Frontend    | http://localhost:3000     | 3000  |
| Backend API | http://localhost:5000/api | 5000  |
| MongoDB     | localhost:27017 (local)   | 27017 |

## 📦 What's Included

### Backend (Node.js + Express)

- ✅ 50+ REST API endpoints
- ✅ JWT Authentication
- ✅ Role-based access control
- ✅ MongoDB with Mongoose
- ✅ CORS enabled
- ✅ Error handling

### Frontend (React + TypeScript)

- ✅ Premium gold/black UI theme
- ✅ Responsive design
- ✅ Protected routes
- ✅ Real-time validation
- ✅ Dark theme
- ✅ Tailwind CSS

### Database (MongoDB)

- ✅ 7 collections
- ✅ Proper schemas
- ✅ Indexes on search fields
- ✅ Seed data included

## ⚡ Features Ready

✅ Authentication & Authorization
✅ Customer Management (CRUD, Search, Filter)
✅ Inventory Management (Stock Tracking, Low Stock Alerts)
✅ Sales & Billing (Invoices, GST Calculation)
✅ Custom Orders (Tracking, Status Updates)
✅ Dashboard & Analytics (KPIs, Charts)
✅ Reports (Sales, Inventory, Customers)
✅ Settings & User Management
✅ Notifications System

## 🆘 Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check connection string in `backend/.env`
- For Atlas: whitelist your IP in security settings

### CORS Error

- Verify backend is on port 5000
- Check `REACT_APP_API_URL=http://localhost:5000/api` in frontend/.env

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## 📝 File Structure

```
ganesh-crm/
├── backend/               (Express.js API)
│   ├── src/
│   │   ├── controllers/  (9 files)
│   │   ├── models/       (7 files)
│   │   ├── routes/       (9 files)
│   │   ├── middleware/   (auth, errors)
│   │   ├── utils/        (jwt, validation)
│   │   └── seeds/        (test data)
│   └── package.json
│
├── frontend/             (React App)
│   ├── src/
│   │   ├── pages/        (Login, Dashboard, Customers, etc)
│   │   ├── components/   (ProtectedRoute, etc)
│   │   ├── context/      (Auth state)
│   │   ├── layouts/      (MainLayout)
│   │   ├── services/     (API client)
│   │   └── App.tsx       (Routing)
│   └── package.json
│
├── README.md
├── SETUP.md
├── QUICK_START.md
└── MONGODB_SETUP.md
```

## 🎨 Tech Stack

**Frontend:**

- React 18 with TypeScript
- Tailwind CSS
- React Router
- Axios
- Lucide Icons

**Backend:**

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Bcryptjs

## 🚀 Next Steps After Setup

1. ✅ MongoDB configured
2. ✅ Both servers running
3. ✅ Logged in with test account
4. Try these actions:
   - Add a customer
   - Create a product
   - Make a sale
   - View dashboard
   - Check reports

## 💡 Tips

- Use MongoDB Atlas for production (no local MongoDB needed)
- Keep both backend and frontend terminals open
- Use `npm run seed` to reset test data anytime
- Check browser console (F12) for API errors
- Check terminal logs for backend errors

## 📞 Support

Check these files for more help:

- SETUP.md - Full guide
- COMPLETION_SUMMARY.md - Features overview
- README.md - Project overview

---

**Happy Building! 🎉**

Your complete CRM application is ready to run!
