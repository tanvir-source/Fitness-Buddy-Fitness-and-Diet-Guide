import { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ForgotPassword = ({ onBack }) => {
    const [step, setStep] = useState(1); // 1: Request, 2: Reset
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Step 1: Request Reset Token
    const handleRequestReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch(`${API_BASE_URL}/api/users/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(`✅ ${data.message}`);

                // In development, auto-fill otp from response
                if (data.dev_token) {
                    setOtp(data.dev_token);
                    alert(`🔑 Development Mode: Your reset OTP is:\n\n${data.dev_token}\n\n(In production, this would be sent via email)`);
                }

                setStep(2);
            } else {
                setMessage(`❌ ${data.error || 'Error sending reset email'}`);
            }
        } catch (err) {
            console.error(err);
            setMessage('❌ Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage('❌ Passwords do not match!');
            return;
        }

        if (newPassword.length < 6) {
            setMessage('❌ Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const res = await fetch(`${API_BASE_URL}/api/users/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(`✅ ${data.message}`);
                setTimeout(() => {
                    onBack(); // Go back to login
                }, 2000);
            } else {
                setMessage(`❌ ${data.error || 'Error resetting password'}`);
            }
        } catch (err) {
            console.error(err);
            setMessage('❌ Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel fade-in" style={{ padding: '40px', width: '400px', maxWidth: '90%' }}>
            <h2 style={{ textAlign: 'center', color: '#00f2ff', marginBottom: '10px' }}>
                🔐 Forgot Password
            </h2>
            <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '30px', fontSize: '0.9rem' }}>
                {step === 1
                    ? "Enter your email to receive a password reset OTP"
                    : "Enter the OTP and your new password"}
            </p>

            {message && (
                <div style={{
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    background: message.includes('✅')
                        ? 'rgba(0, 255, 136, 0.1)'
                        : 'rgba(255, 68, 68, 0.1)',
                    border: `1px solid ${message.includes('✅') ? '#00ff88' : '#ff4444'}`,
                    color: message.includes('✅') ? '#00ff88' : '#ff4444',
                    textAlign: 'center'
                }}>
                    {message}
                </div>
            )}

            {step === 1 ? (
                <form onSubmit={handleRequestReset} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        style={{ width: '100%' }}
                    />

                    <button
                        type="submit"
                        className="primary-btn"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? '⏳ Sending...' : '📧 Send Reset Token'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        required
                        disabled={loading}
                        style={{ width: '100%' }}
                    />

                    <input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        disabled={loading}
                        style={{ width: '100%' }}
                    />

                    <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        style={{ width: '100%' }}
                    />

                    <button
                        type="submit"
                        className="primary-btn"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? '⏳ Resetting...' : '🔑 Reset Password'}
                    </button>
                </form>
            )}

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#00f2ff',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        textDecoration: 'underline'
                    }}
                >
                    ← Back to Login
                </button>
            </div>

            {step === 2 && (
                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: 'rgba(255, 165, 2, 0.1)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: '#ffa502',
                    borderLeft: '4px solid #ffa502'
                }}>
                    <strong>💡 Development Note:</strong> In production, the reset OTP would be sent to your email.
                    For testing, check the browser console or the OTP should have been auto-filled.
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;
