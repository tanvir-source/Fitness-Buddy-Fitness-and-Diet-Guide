const Water = require('../models/Water');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Weight = require('../models/Weight');

// Add Water (supports user_email or req.user when available)
const addWater = async (req, res) => {
  const { amount, date, user_email } = req.body;

  if (!amount || !date) {
    return res.status(400).json({ message: 'Please include amount and date' });
  }

  try {
    // Resolve user id if email provided
    let userId = undefined;
    let email = user_email;

    if (req.user && req.user.id) {
      userId = req.user.id;
      // Try to get email if available
      if (req.user.email) email = req.user.email;
    }

    if (!email && req.body.email) email = req.body.email;

    if (!userId && email) {
      const u = await User.findOne({ email });
      if (u) userId = u._id;
    }

    const water = await Water.create({
      user: userId,
      user_email: email,
      amount,
      date,
    });
    res.status(201).json(water);
  } catch (error) {
    console.error('AddWater Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get Water entries by date
const getWaterByDate = async (req, res) => {
  try {
    const date = req.params.date;
    const email = req.query.email || (req.user && req.user.email);

    const query = { date };
    if (email) query.user_email = email;
    else if (req.user && req.user.id) query.user = req.user.id;

    const waterLogs = await Water.find(query).sort({ createdAt: 1 });
    res.json(waterLogs);
  } catch (error) {
    console.error('getWaterByDate Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get total water amount for a date
const getTotalByDate = async (req, res) => {
  try {
    const date = req.params.date;
    const email = req.query.email || (req.user && req.user.email);

    const match = { date };
    if (email) match.user_email = email;
    else if (req.user && req.user.id) match.user = req.user.id;

    const result = await Water.aggregate([
      { $match: match },
      { $group: { _id: '$date', total: { $sum: '$amount' } } }
    ]);

    const total = (result[0] && result[0].total) || 0;
    res.json({ date, total });
  } catch (error) {
    console.error('getTotalByDate Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get hydration recommendation (based on profile goal.water or latest weight)
const getGoalRecommendation = async (req, res) => {
  try {
    const email = req.query.email || (req.user && req.user.email);
    if (!email) return res.status(400).json({ message: 'Query with ?email=...' });

    const profile = await Profile.findOne({ user_email: email });
    if (profile && profile.goals && profile.goals.water) {
      return res.json({ recommended_ml: profile.goals.water, source: 'profile_goal' });
    }

    // Fallback to latest weight
    const weightHistory = await Weight.find({ user_email: email }).sort({ date: -1 });
    if (weightHistory.length > 0) {
      const latest = weightHistory[0].weight; // kg
      const recommended = Math.round(latest * 35); // 35 ml per kg
      return res.json({ recommended_ml: recommended, source: 'weight_based' });
    }

    // Default
    return res.json({ recommended_ml: 2000, source: 'default' });
  } catch (error) {
    console.error('getGoalRecommendation Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get hydration streaks (consecutive days reaching goal up to today)
const getStreaks = async (req, res) => {
  try {
    const email = req.query.email || (req.user && req.user.email);
    if (!email) return res.status(400).json({ message: 'Query with ?email=...' });

    // Determine goal
    let goal = 2000;
    const profile = await Profile.findOne({ user_email: email });
    if (profile && profile.goals && profile.goals.water) goal = profile.goals.water;
    else {
      const weightHistory = await Weight.find({ user_email: email }).sort({ date: -1 });
      if (weightHistory.length > 0) goal = Math.round(weightHistory[0].weight * 35);
    }

    // Aggregate totals for the past 60 days
    const days = 60;
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - (days - 1));

    const dateList = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dateList.push(`${yyyy}-${mm}-${dd}`);
    }

    const match = { date: { $in: dateList }, user_email: email };

    const agg = await Water.aggregate([
      { $match: match },
      { $group: { _id: '$date', total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]);

    // Convert to map
    const totalsMap = {};
    agg.forEach(item => totalsMap[item._id] = item.total);

    // Compute streak ending today
    let streak = 0;
    for (let i = days - 1; i >= 0; i--) {
      const d = dateList[i];
      const t = totalsMap[d] || 0;
      if (t >= goal) streak += 1;
      else break;
    }

    res.json({ goal, streak, recent: dateList.slice(-14).map(d => ({ date: d, total: totalsMap[d] || 0 })) });
  } catch (error) {
    console.error('getStreaks Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { addWater, getWaterByDate, getTotalByDate, getStreaks, getGoalRecommendation };
