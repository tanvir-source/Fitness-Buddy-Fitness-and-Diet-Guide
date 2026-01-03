const Activity = require('../models/Activity');

// Get all activities for a user
exports.getActivities = async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        const activities = await Activity.find({ user_email: email })
            .sort({ date: -1 })
            .limit(100); // Limit to last 100 activities
            
        res.status(200).json(activities);
    } catch (err) {
        console.error('Get activities error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Add new activity
exports.addActivity = async (req, res) => {
    try {
        const { user_email, type, duration, calories, intensity, equipment, goal } = req.body;
        
        // Validation
        if (!user_email || !type || !duration || !calories) {
            return res.status(400).json({ 
                error: 'Missing required fields: user_email, type, duration, calories' 
            });
        }
        
        const newActivity = new Activity({ 
            user_email, 
            type, 
            duration: Number(duration), 
            calories: Number(calories),
            intensity: intensity || 'moderate',
            equipment: equipment || 'noEquipment',
            goal: goal || 'general',
            date: new Date()
        });
        
        await newActivity.save();
        res.status(201).json(newActivity);
    } catch (err) {
        console.error('Add activity error:', err);
        res.status(400).json({ error: err.message });
    }
};

// Get activity statistics
exports.getActivityStats = async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        // Get last 30 days of activities
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activities = await Activity.find({
            user_email: email,
            date: { $gte: thirtyDaysAgo }
        });
        
        // Calculate statistics
        const totalWorkouts = activities.length;
        const totalCalories = activities.reduce((sum, a) => sum + a.calories, 0);
        const totalMinutes = activities.reduce((sum, a) => sum + a.duration, 0);
        
        // Group by type
        const byType = {};
        activities.forEach(activity => {
            if (!byType[activity.type]) {
                byType[activity.type] = {
                    count: 0,
                    totalCalories: 0,
                    totalMinutes: 0
                };
            }
            byType[activity.type].count++;
            byType[activity.type].totalCalories += activity.calories;
            byType[activity.type].totalMinutes += activity.duration;
        });
        
        // Group by intensity
        const byIntensity = {
            light: activities.filter(a => a.intensity === 'light').length,
            moderate: activities.filter(a => a.intensity === 'moderate').length,
            vigorous: activities.filter(a => a.intensity === 'vigorous').length
        };
        
        res.status(200).json({
            totalWorkouts,
            totalCalories,
            totalMinutes,
            byType,
            byIntensity,
            averageCaloriesPerWorkout: totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0,
            averageMinutesPerWorkout: totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0
        });
    } catch (err) {
        console.error('Get stats error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Delete activity
exports.deleteActivity = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ error: 'Activity ID is required' });
        }
        
        const deleted = await Activity.findByIdAndDelete(id);
        
        if (!deleted) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        
        res.status(200).json({ message: 'Activity deleted successfully', deleted });
    } catch (err) {
        console.error('Delete activity error:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getActivities,
    addActivity,
    getActivityStats,
    deleteActivity
};