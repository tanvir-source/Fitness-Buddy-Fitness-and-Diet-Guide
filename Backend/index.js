const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- IMPORTS ---
const userRoutes = require('./routes/userRoutes');
const weightRoutes = require('./routes/weightRoutes'); // Fixed Version
const foodRoutes = require('./routes/foodRoutes');
const activityRoutes = require('./routes/activityRoutes');
const socialRoutes = require('./routes/socialRoutes');
const profileRoutes = require('./routes/profileRoutes'); // You missed this in original
const { getStats } = require('./controllers/statsController'); // New Controller

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

// Manual Route for Stats (Since it's just one function)
app.get('/api/stats', getStats);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));