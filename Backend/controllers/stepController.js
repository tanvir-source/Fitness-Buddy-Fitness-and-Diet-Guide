// stepController.js - Step Counter Controller
const Step = require('../models/Step');

// Get step history for a user
const getSteps = async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({ 
                message: 'Email parameter is required' 
            });
        }

        // Get last 30 days of step data, sorted by date descending
        const steps = await Step.find({ user_email: email })
            .sort({ date: -1 })
            .limit(30);
        
        res.status(200).json(steps);
    } catch (error) {
        console.error('Get Steps Error:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve step data',
            error: error.message 
        });
    }
};

// Add or update steps for a specific date
const addSteps = async (req, res) => {
    try {
        const { user_email, steps, goal, date } = req.body;

        console.log('Received request body:', req.body);

        // Validation
        if (!user_email) return res.status(400).json({ message: 'user_email is required' });
        if (steps === undefined || steps === null) return res.status(400).json({ message: 'steps is required' });
        if (!date) return res.status(400).json({ message: 'date is required' });

        const stepCount = Number(steps);
        if (isNaN(stepCount) || stepCount < 0) {
            return res.status(400).json({ message: 'Steps must be a positive number' });
        }

        // Check if entry exists for this date
        const existingEntry = await Step.findOne({ user_email, date });

        if (existingEntry) {
            // Update existing entry
            existingEntry.steps += stepCount;
            if (goal) existingEntry.goal = goal;

            // FIX: Manually recalculate derived fields (Crucial for accuracy)
            existingEntry.calories_burned = Math.round(existingEntry.steps * 0.04);
            existingEntry.distance_km = Math.round((existingEntry.steps * 0.8 / 1000) * 100) / 100;

            await existingEntry.save();
            console.log('Updated existing entry:', existingEntry);
            res.status(200).json(existingEntry);
        } else {
            // Create new entry
            const newStep = new Step({
                user_email,
                steps: stepCount,
                goal: goal || 10000,
                date,
                // Calculate explicitly here for consistency
                calories_burned: Math.round(stepCount * 0.04),
                distance_km: Math.round((stepCount * 0.8 / 1000) * 100) / 100
            });

            await newStep.save();
            console.log('Created new entry:', newStep);
            res.status(201).json(newStep);
        }
    } catch (error) {
        console.error('Add Steps Error:', error);
        res.status(500).json({ 
            message: 'Failed to add step data',
            error: error.message 
        });
    }
};

// Update step goal for user
const updateGoal = async (req, res) => {
    try {
        const { user_email, goal } = req.body;

        if (!user_email || !goal) {
            return res.status(400).json({ 
                message: 'user_email and goal are required' 
            });
        }

        // Validate goal
        const goalValue = Number(goal);
        if (isNaN(goalValue) || goalValue < 1000 || goalValue > 50000) {
            return res.status(400).json({ 
                message: 'Goal must be between 1,000 and 50,000 steps' 
            });
        }

        // Update all future entries and today's entry with new goal
        const today = new Date().toISOString().split('T')[0];
        
        const result = await Step.updateMany(
            { 
                user_email,
                date: { $gte: today }
            },
            { 
                $set: { goal: goalValue } 
            }
        );

        console.log('Goal update result:', result);
        res.status(200).json({ 
            message: 'Goal updated successfully',
            goal: goalValue,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Update Goal Error:', error);
        res.status(500).json({ 
            message: 'Failed to update goal',
            error: error.message 
        });
    }
};

// Get step statistics (optional - for advanced features)
const getStepStats = async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({ 
                message: 'Email parameter is required' 
            });
        }

        // Get last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const dateStr = sevenDaysAgo.toISOString().split('T')[0];

        const weeklySteps = await Step.find({
            user_email: email,
            date: { $gte: dateStr }
        }).sort({ date: -1 });

        // Calculate stats
        const totalSteps = weeklySteps.reduce((sum, day) => sum + day.steps, 0);
        const avgSteps = Math.round(totalSteps / 7);
        const goalsHit = weeklySteps.filter(day => day.steps >= day.goal).length;

        res.status(200).json({
            weeklyTotal: totalSteps,
            dailyAverage: avgSteps,
            goalsHit: goalsHit,
            data: weeklySteps
        });
    } catch (error) {
        console.error('Get Step Stats Error:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve step statistics',
            error: error.message 
        });
    }
};

// Delete step entry (optional)
const deleteStep = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ 
                message: 'Step ID is required' 
            });
        }

        const deletedStep = await Step.findByIdAndDelete(id);
        
        if (!deletedStep) {
            return res.status(404).json({ 
                message: 'Step entry not found' 
            });
        }

        res.status(200).json({ 
            message: 'Step entry deleted successfully',
            deletedStep 
        });
    } catch (error) {
        console.error('Delete Step Error:', error);
        res.status(500).json({ 
            message: 'Failed to delete step entry',
            error: error.message 
        });
    }
};

module.exports = {
    getSteps,
    addSteps,
    updateGoal,
    getStepStats,
    deleteStep
};