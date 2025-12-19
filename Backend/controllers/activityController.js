const Activity = require('../models/Activity');

exports.getActivities = async (req, res) => {
    try {
        const { email } = req.query;
        const activities = await Activity.find({ user_email: email }).sort({ date: -1 });
        res.status(200).json(activities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addActivity = async (req, res) => {
    try {
        const { user_email, type, duration, calories } = req.body;
        const newActivity = new Activity({ user_email, type, duration, calories });
        await newActivity.save();
        res.status(201).json(newActivity);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};