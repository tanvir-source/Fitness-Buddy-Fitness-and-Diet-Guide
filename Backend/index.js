const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 1. Initialize App
const app = express();

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Import Routes (The Architect's Core)
// Only keep YOUR files active. Comment out the others.
const userRoutes = require('./routes/userRoutes');
const weightRoutes = require('./routes/weightRoutes');     // You kept this
const profileRoutes = require('./routes/profileRoutes');   // You kept this

// --- TEAM MODULES (Currently commented out so server doesn't crash) ---
// const activityRoutes = require('./routes/activityRoutes'); // Friend 3
// const stepRoutes = require('./routes/stepRoutes');         // Friend 3
// const waterRoutes = require('./routes/waterRoutes');       // Friend 2
// const foodRoutes = require('./routes/foodRoutes');         // Friend 2
// const postRoutes = require('./routes/postRoutes');         // Friend 4
// const adminRoutes = require('./routes/adminRoutes');       // Friend 4

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
// Note: We use specific paths for clarity
app.use('/api', userRoutes);            // Handles Login/Register
app.use('/api/weight', weightRoutes);   // Your Feature
app.use('/api/profile', profileRoutes); // Your Feature

// --- TEAM ROUTES (Uncomment these when friends merge their code) ---
// app.use('/api/activity', activityRoutes);
// app.use('/api/steps', stepRoutes);
// app.use('/api/water', waterRoutes);
// app.use('/api/food', foodRoutes);
// app.use('/api/posts', postRoutes);
// app.use('/api/admin', adminRoutes);

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));