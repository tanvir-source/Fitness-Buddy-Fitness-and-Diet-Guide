const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 1. Import the new routes
const userRoutes = require('./routes/userRoutes');
const weightRoutes = require('./routes/weightRoutes');
const app = express();
const activityRoutes = require('./routes/activityRoutes'); // <--- ADD THIS
const stepRoutes = require('./routes/stepRoutes');

// ... listen
// Middleware
app.use(express.json());
app.use(cors());
app.use('/api/activity', activityRoutes); // <--- ADD THIS
app.use('/api/steps', stepRoutes);


// Database Connection
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

// 2. Use the routes
// Any request starting with /api will go to userRoutes
app.use('/api', userRoutes);
app.use('/api/weight', weightRoutes);
// Basic Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));