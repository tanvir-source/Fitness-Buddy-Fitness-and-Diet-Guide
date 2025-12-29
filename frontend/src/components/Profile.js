import { useState, useEffect } from 'react';

const Profile = ({ user, onUpdate }) => {
    // Form State
    const [formData, setFormData] = useState({
        dob: '', 
        gender: 'Male', 
        height: '', 
        activityLevel: 'Moderate', 
        goal: 'Maintenance'
    });

    // Display State
    const [stats, setStats] = useState({
        weight: '--',
        bmi: '--',
        bmiColor: '#fff',
        bmiCategory: 'Unknown',
        age: '--'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch Profile + Latest Weight
    const fetchProfile = async () => {
        if (!user?.email) return;
        
        setLoading(true);
        try {
            // Fetch profile data
            const profileRes = await fetch(`http://localhost:5000/api/profile/${user.email}`);
            
            // Fetch latest weight separately
            const weightRes = await fetch(`http://localhost:5000/api/weight?email=${user.email}`);
            
            if (profileRes.ok && weightRes.ok) {
                const profileData = await profileRes.json();
                const weightData = await weightRes.json();
                
                // Update Form Fields
                setFormData({
                    dob: profileData.dob || '',
                    gender: profileData.gender || 'Male',
                    height: profileData.height || '',
                    activityLevel: profileData.activityLevel || 'Moderate',
                    goal: profileData.goal || 'Maintenance'
                });

                // Get latest weight from weight history
                const latestWeight = Array.isArray(weightData) && weightData.length > 0 
                    ? weightData[weightData.length - 1].weight 
                    : 0;

                // Calculate Stats
                const height = profileData.height || 0;
                
                let calculatedBMI = '--';
                let color = '#fff';
                let category = 'Unknown';

                if (latestWeight > 0 && height > 0) {
                    const heightInMeters = height / 100;
                    calculatedBMI = (latestWeight / (heightInMeters * heightInMeters)).toFixed(1);

                    if (calculatedBMI < 18.5) { 
                        color = '#ff9100'; 
                        category = 'Underweight'; 
                    } else if (calculatedBMI < 25) { 
                        color = '#00ff88'; 
                        category = 'Healthy'; 
                    } else if (calculatedBMI < 30) { 
                        color = '#ff4444'; 
                        category = 'Overweight'; 
                    } else { 
                        color = '#ff0000'; 
                        category = 'Obese'; 
                    }
                }

                // Calculate Age
                let ageVal = '--';
                if (profileData.dob) {
                    const birthDate = new Date(profileData.dob);
                    const today = new Date();
                    ageVal = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        ageVal--;
                    }
                }

                setStats({
                    weight: latestWeight > 0 ? latestWeight : '--',
                    bmi: calculatedBMI,
                    bmiColor: color,
                    bmiCategory: category,
                    age: ageVal
                });
            }
        } catch (err) { 
            console.error('Fetch error:', err);
            setError('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    // Save Profile
    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const res = await fetch('http://localhost:5000/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    ...formData
                })
            });
            
            if (res.ok) {
                alert("✅ Profile Saved Successfully!");
                await fetchProfile();
                if (onUpdate) onUpdate();
            } else {
                const errorData = await res.json();
                setError(errorData.message || 'Failed to save profile');
            }
        } catch (err) { 
            console.error('Save error:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfile(); }, [user]);

    const inputStyle = {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'rgba(255,255,255,0.1)',
        color: 'white',
        boxSizing: 'border-box'
    };

    return (
        <div className="glass-panel fade-in">
            <h2 style={{color: '#00f2ff', marginBottom:'30px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                👤 Your Profile
            </h2>

            {error && (
                <div style={{
                    background: 'rgba(255, 68, 68, 0.2)',
                    border: '1px solid #ff4444',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    color: '#ff4444'
                }}>
                    {error}
                </div>
            )}
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px'}}>
                
                {/* LEFT: EDIT FORM */}
                <div>
                    <div style={{marginBottom:'20px'}}>
                        <label style={{display:'block', color:'#aaa', marginBottom:'8px', fontSize:'0.9rem'}}>
                            Date of Birth
                        </label>
                        <input 
                            type="date" 
                            value={formData.dob} 
                            onChange={e => setFormData({...formData, dob: e.target.value})}
                            disabled={loading}
                            style={inputStyle}
                        />
                    </div>
                    
                    <div style={{marginBottom:'20px'}}>
                        <label style={{display:'block', color:'#aaa', marginBottom:'8px', fontSize:'0.9rem'}}>
                            Height (cm)
                        </label>
                        <input 
                            type="number" 
                            value={formData.height} 
                            onChange={e => setFormData({...formData, height: e.target.value})}
                            disabled={loading}
                            placeholder="e.g., 170"
                            style={inputStyle}
                        />
                    </div>

                    <div style={{marginBottom:'20px'}}>
                        <label style={{display:'block', color:'#aaa', marginBottom:'8px', fontSize:'0.9rem'}}>
                            Gender
                        </label>
                        <select 
                            value={formData.gender} 
                            onChange={e => setFormData({...formData, gender: e.target.value})}
                            disabled={loading}
                            style={inputStyle}
                        >
                            <option>Male</option>
                            <option>Female</option>
                        </select>
                    </div>

                    <button 
                        onClick={handleSave}
                        className="primary-btn" 
                        disabled={loading}
                        style={{
                            marginTop:'10px', 
                            width:'100%',
                            opacity: loading ? 0.6 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                    
                    <p style={{
                        fontSize:'0.85rem', 
                        color:'#777', 
                        marginTop:'15px', 
                        textAlign:'center',
                        lineHeight: '1.5'
                    }}>
                        💡 To update Weight, use the <b style={{color: '#a55eea'}}>Weight Tracker</b> tab.
                    </p>
                </div>

                {/* RIGHT: LIVE STATS */}
                <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
                    
                    {/* Age & Weight Row */}
                    <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap:'20px'}}>
                        <div style={{
                            background:'rgba(0,0,0,0.3)', 
                            padding:'25px', 
                            borderRadius:'15px', 
                            textAlign:'center', 
                            borderTop:'4px solid #00f2ff'
                        }}>
                            <h3 style={{color:'#aaa', margin:'0 0 10px 0', fontSize:'0.9rem', textTransform: 'uppercase'}}>
                                Age
                            </h3>
                            <h1 style={{fontSize:'3rem', margin:'10px 0', color:'#fff'}}>
                                {stats.age}
                            </h1>
                        </div>
                        
                        <div style={{
                            background:'rgba(0,0,0,0.3)', 
                            padding:'25px', 
                            borderRadius:'15px', 
                            textAlign:'center', 
                            borderTop:'4px solid #a55eea'
                        }}>
                            <h3 style={{color:'#aaa', margin:'0 0 10px 0', fontSize:'0.9rem', textTransform: 'uppercase'}}>
                                Weight
                            </h3>
                            <h1 style={{fontSize:'3rem', margin:'10px 0', color:'#fff'}}>
                                {stats.weight}
                                {stats.weight !== '--' && <span style={{fontSize:'1.2rem', color:'#777'}}> kg</span>}
                            </h1>
                        </div>
                    </div>

                    {/* BMI Card */}
                    <div style={{
                        background:'rgba(0,0,0,0.3)', 
                        padding:'30px', 
                        borderRadius:'15px', 
                        textAlign:'center', 
                        borderTop:`4px solid ${stats.bmiColor}`,
                        flex: 1
                    }}>
                        <h3 style={{color:'#aaa', margin:'0 0 15px 0', fontSize:'0.9rem', textTransform: 'uppercase'}}>
                            BMI Score
                        </h3>
                        <h1 style={{
                            fontSize:'4.5rem', 
                            margin:'15px 0', 
                            color: stats.bmiColor,
                            fontWeight: 'bold'
                        }}>
                            {stats.bmi}
                        </h1>
                        <div style={{
                            color: stats.bmiColor, 
                            fontWeight:'bold', 
                            textTransform:'uppercase', 
                            letterSpacing:'2px',
                            fontSize: '1.1rem'
                        }}>
                            {stats.bmiCategory}
                        </div>
                        
                        {stats.bmi !== '--' && (
                            <div style={{
                                marginTop: '20px',
                                padding: '10px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                color: '#aaa'
                            }}>
                                {stats.bmiCategory === 'Healthy' && '✅ You are in a healthy weight range!'}
                                {stats.bmiCategory === 'Underweight' && '⚠️ Consider gaining some weight.'}
                                {stats.bmiCategory === 'Overweight' && '⚠️ Consider a calorie deficit.'}
                                {stats.bmiCategory === 'Obese' && '🚨 Consult a healthcare professional.'}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;