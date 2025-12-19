const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 1. Initialize App
const app = express();

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Import Routes
// ✅ YOUR ROUTES (Architect)
const userRoutes = require('./routes/userRoutes');
const weightRoutes = require('./routes/weightRoutes');

// ✅ FRIEND 2 (Nutrition) - Changed to 'foodRoutes' to fix your error
const foodRoutes = require('./routes/foodRoutes'); 

// ✅ FRIEND 3 (Fitness)
const activityRoutes = require('./routes/activityRoutes');

// ✅ FRIEND 4 (Social)
const socialRoutes = require('./routes/socialRoutes');

// 4. Connect Database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};
connectDB();

// 5. Use Routes
app.use('/api/users', userRoutes);         // Login/Register
app.use('/api/weight', weightRoutes);      // Your Weight Feature

// Changed to match the import above
app.use('/api/food', foodRoutes);          // Friend 2 (Nutrition)

app.use('/api/activity', activityRoutes);  // Friend 3 (Fitness)
app.use('/api/social', socialRoutes);      // Friend 4 (Social Wall)

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));