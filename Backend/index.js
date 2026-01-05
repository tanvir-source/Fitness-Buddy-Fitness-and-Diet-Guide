const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- IMPORTS ---
const userRoutes = require('./routes/userRoutes');
const weightRoutes = require('./routes/weightRoutes');
const foodRoutes = require('./routes/foodRoutes');
const activityRoutes = require('./routes/activityRoutes');
const socialRoutes = require('./routes/socialRoutes');
const profileRoutes = require('./routes/profileRoutes');
const statsRoutes = require('./routes/statsRoutes');
const waterRoutes = require('./routes/waterRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const stepRoutes = require('./routes/stepRoutes');
const mealPlanRoutes = require('./routes/mealplanRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const broadcastRoutes = require('./routes/broadcastRoutes');


// --- DATABASE ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ DB Error:', err));

// --- ROUTES ---
app.use('/api/users', userRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api', recipeRoutes);
app.use('/api/steps', stepRoutes);
app.use('/api/mealplan', mealPlanRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', broadcastRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Fitness Buddy API is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));