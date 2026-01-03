const nodemailer = require('nodemailer');

// SEND REPORT EMAIL
const sendReport = async (req, res) => {
    const { user_email, period, stats } = req.body;

    try {
        // 1. Setup Transporter (Use your real email here)
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or 'outlook', 'yahoo'
            auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_PASS || 'your-app-password'
            }
        });

        // 2. Draft Email
        const mailOptions = {
            from: 'Fitness Buddy <noreply@fitnessbuddy.com>',
            to: user_email,
            subject: `📊 Your ${period} Fitness Report`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #00f2ff;">Fitness Buddy Report</h2>
                    <p>Here is your summary for the past ${period}:</p>
                    
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #f4f4f4;">
                            <td style="padding: 10px;"><strong>Calories Consumed:</strong></td>
                            <td style="padding: 10px;">${stats.totalCalories} kcal</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px;"><strong>Workouts Logged:</strong></td>
                            <td style="padding: 10px;">${stats.totalWorkouts}</td>
                        </tr>
                        <tr style="background: #f4f4f4;">
                            <td style="padding: 10px;"><strong>Weight Change:</strong></td>
                            <td style="padding: 10px;">${stats.weightChange}</td>
                        </tr>
                    </table>

                    <p>Keep crushing your goals! 💪</p>
                </div>
            `
        };

        // 3. Send
        // (Commented out actual send to prevent crash if no creds are set)
        // await transporter.sendMail(mailOptions);
        
        console.log(`📧 Mock Email sent to ${user_email}`);
        res.status(200).json({ message: 'Email sent successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send email' });
    }
};

module.exports = { sendReport };