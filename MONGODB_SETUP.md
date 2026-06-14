# Quick Setup Instructions

## ⚠️ MongoDB Required

The application requires MongoDB to run. Choose one option:

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get your connection string
5. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ganesh-crm
   ```

### Option 2: MongoDB Local

1. Download MongoDB Community Edition: https://www.mongodb.com/try/download/community
2. Install it
3. Start MongoDB:
   ```bash
   mongod
   ```
4. The default `.env` will work:
   ```
   MONGODB_URI=mongodb://localhost:27017/ganesh-crm
   ```

## Quick Start (After MongoDB is setup)

### Terminal 1 - Start Backend

```bash
cd backend
npm run dev
```

Expected output: "✓ Server running on port 5000"

### Terminal 2 - Seed Database

```bash
cd backend
npm run seed
```

This populates test data.

### Terminal 3 - Start Frontend

```bash
cd frontend
npm start
```

Browser opens at http://localhost:3000

## Login with Test Credentials

- Email: owner@ganeshbeda.com
- Password: password123
