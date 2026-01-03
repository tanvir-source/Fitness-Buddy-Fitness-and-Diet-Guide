import { useState, useEffect } from 'react';

const Profile = ({ user, onUpdate }) => {
    // Form State
    const [formData, setFormData] = useState({
        dob: '', 
        gender: 'Male', 
        height: '', 
        activityLevel: 'Moderately Active', 
        healthGoal: 'Maintenance',
        targetWeight: '',
        medicalConditions: 'None',
        dietaryRestrictions: 'None'
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
    const [showCongrats, setShowCongrats] = useState(false);

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
                    activityLevel: profileData.activityLevel || 'Moderately Active',
                    healthGoal: profileData.healthGoal || 'Maintenance',
                    targetWeight: profileData.targetWeight || '',
                    medicalConditions: profileData.medicalConditions || 'None',
                    dietaryRestrictions: profileData.dietaryRestrictions || 'None'
                });

                // Get latest weight from weight history
                const latestWeight = Array.isArray(weightData) && weightData.length > 0 
                    ? weightData.sort((a, b) => new Date(b.date) - new Date(a.date))[0].weight 
                    : 0;

                // Check if target weight reached
                if (profileData.targetWeight && latestWeight > 0) {
                    const difference = Math.abs(latestWeight - profileData.targetWeight);
                    if (difference <= 1) { // Within 1kg of target
                        setShowCongrats(true);
                    }
                }

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
        fontSize: '0.9rem',
        boxSizing: 'border-box'
    };

    const labelStyle = {
        display:'block', 
        color:'#aaa', 
        marginBottom:'8px', 
        fontSize:'0.85rem',
        fontWeight: '500'
    };

    // Calculate progress to target
    const calculateProgress = () => {
        if (!formData.targetWeight || stats.weight === '--') return null;
        
        const current = parseFloat(stats.weight);
        const target = parseFloat(formData.targetWeight);
        
        if (formData.healthGoal === 'Weight Loss') {
            const remaining = current - target;
            const percentage = remaining <= 0 ? 100 : Math.max(0, 100 - (remaining / current * 100));
            return { remaining: Math.max(0, remaining), percentage, direction: 'lose' };
        } else if (formData.healthGoal === 'Weight Gain') {
            const remaining = target - current;
            const percentage = remaining <= 0 ? 100 : Math.max(0, 100 - (remaining / target * 100));
            return { remaining: Math.max(0, remaining), percentage, direction: 'gain' };
        }
        return null;
    };

    const progress = calculateProgress();

    return (
        <div className="glass-panel fade-in">
            {/* Congratulations Modal */}
            {showCongrats && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => setShowCongrats(false)}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,242,255,0.2))',
                        border: '2px solid #00ff88',
                        padding: '40px',
                        borderRadius: '20px',
                        textAlign: 'center',
                        maxWidth: '500px',
                        boxShadow: '0 20px 60px rgba(0,255,136,0.3)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{fontSize: '5rem', marginBottom: '20px'}}>🎉</div>
                        <h2 style={{color: '#00ff88', margin: '0 0 15px 0', fontSize: '2rem'}}>
                            Congratulations!
                        </h2>
                        <p style={{color: '#fff', fontSize: '1.1rem', marginBottom: '10px'}}>
                            You've reached your target weight of <strong>{formData.targetWeight} kg</strong>!
                        </p>
                        <p style={{color: '#aaa', fontSize: '0.9rem', marginBottom: '25px'}}>
                            Amazing work! Keep up the great habits to maintain your progress.
                        </p>
                        <button
                            onClick={() => setShowCongrats(false)}
                            style={{
                                padding: '12px 30px',
                                background: 'linear-gradient(135deg, #00ff88, #00aaff)',
                                border: 'none',
                                borderRadius: '10px',
                                color: '#000',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                cursor: 'pointer'
                            }}
                        >
                            Thanks! 🙌
                        </button>
                    </div>
                </div>
            )}

            <h2 style={{color: '#00f2ff', marginBottom:'25px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                👤 Your Profile
            </h2>

            {error && (
                <div style={{
                    background: 'rgba(255, 68, 68, 0.2)',
                    border: '1px solid #ff4444',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    color: '#ff4444',
                    fontSize: '0.9rem'
                }}>
                    {error}
                </div>
            )}
            
            {/* Top Stats Row - 4 Cards */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px'}}>
                <div style={{
                    background:'rgba(0,0,0,0.3)', 
                    padding:'20px', 
                    borderRadius:'12px', 
                    textAlign:'center', 
                    borderTop:'3px solid #00f2ff'
                }}>
                    <h3 style={{color:'#aaa', margin:'0 0 8px 0', fontSize:'0.75rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                        Age
                    </h3>
                    <h1 style={{fontSize:'2.2rem', margin:'5px 0', color:'#fff', fontWeight: 'bold'}}>
                        {stats.age}
                    </h1>
                    <p style={{fontSize:'0.75rem', color:'#777', margin: '5px 0 0 0'}}>years old</p>
                </div>
                
                <div style={{
                    background:'rgba(0,0,0,0.3)', 
                    padding:'20px', 
                    borderRadius:'12px', 
                    textAlign:'center', 
                    borderTop:'3px solid #a55eea'
                }}>
                    <h3 style={{color:'#aaa', margin:'0 0 8px 0', fontSize:'0.75rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                        Current
                    </h3>
                    <h1 style={{fontSize:'2.2rem', margin:'5px 0', color:'#fff', fontWeight: 'bold'}}>
                        {stats.weight}
                        {stats.weight !== '--' && <span style={{fontSize:'0.9rem', color:'#777'}}> kg</span>}
                    </h1>
                    <p style={{fontSize:'0.75rem', color:'#777', margin: '5px 0 0 0'}}>weight</p>
                </div>

                <div style={{
                    background:'rgba(0,0,0,0.3)', 
                    padding:'20px', 
                    borderRadius:'12px', 
                    textAlign:'center', 
                    borderTop:`3px solid ${formData.targetWeight ? '#00ff88' : '#555'}`
                }}>
                    <h3 style={{color:'#aaa', margin:'0 0 8px 0', fontSize:'0.75rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                        Target
                    </h3>
                    <h1 style={{fontSize:'2.2rem', margin:'5px 0', color:'#fff', fontWeight: 'bold'}}>
                        {formData.targetWeight || '--'}
                        {formData.targetWeight && <span style={{fontSize:'0.9rem', color:'#777'}}> kg</span>}
                    </h1>
                    <p style={{fontSize:'0.75rem', color:'#777', margin: '5px 0 0 0'}}>goal</p>
                </div>

                <div style={{
                    background:'rgba(0,0,0,0.3)', 
                    padding:'20px', 
                    borderRadius:'12px', 
                    textAlign:'center', 
                    borderTop:`3px solid ${stats.bmiColor}`
                }}>
                    <h3 style={{color:'#aaa', margin:'0 0 8px 0', fontSize:'0.75rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                        BMI
                    </h3>
                    <h1 style={{fontSize:'2.2rem', margin:'5px 0', color: stats.bmiColor, fontWeight: 'bold'}}>
                        {stats.bmi}
                    </h1>
                    <p style={{fontSize:'0.75rem', color: stats.bmiColor, margin: '5px 0 0 0', fontWeight: '600'}}>
                        {stats.bmiCategory}
                    </p>
                </div>
            </div>

            {/* Target Progress - Full Width if exists */}
            {progress && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(0,242,255,0.1), rgba(165,94,234,0.1))',
                    border: '1px solid rgba(0,242,255,0.3)',
                    padding: '18px 20px',
                    borderRadius: '12px',
                    marginBottom: '25px'
                }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                        <h3 style={{color:'#00f2ff', margin: 0, fontSize:'0.95rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                            🎯 Progress to Target
                        </h3>
                        <span style={{color: '#00ff88', fontWeight: 'bold', fontSize: '1.1rem'}}>
                            {progress.percentage.toFixed(0)}%
                        </span>
                    </div>
                    
                    <div style={{
                        width: '100%',
                        height: '14px',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '7px',
                        overflow: 'hidden',
                        marginBottom: '10px'
                    }}>
                        <div style={{
                            width: `${Math.min(progress.percentage, 100)}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #00f2ff, #00ff88)',
                            borderRadius: '7px',
                            transition: 'width 0.5s ease'
                        }}></div>
                    </div>
                    
                    <p style={{color: '#aaa', fontSize: '0.85rem', margin: 0}}>
                        {progress.remaining > 0 
                            ? `${progress.remaining.toFixed(1)} kg to ${progress.direction}` 
                            : '🎉 Target reached! Great job!'}
                    </p>
                </div>
            )}
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px'}}>
                
                {/* LEFT: EDIT FORM */}
                <div>
                    <h3 style={{color: '#00f2ff', marginTop: 0, marginBottom: '18px', fontSize: '1rem', borderBottom: '2px solid rgba(0,242,255,0.3)', paddingBottom: '10px'}}>
                        📋 Personal Information
                    </h3>

                    <div style={{marginBottom:'16px'}}>
                        <label style={labelStyle}>Date of Birth</label>
                        <input 
                            type="date" 
                            value={formData.dob} 
                            onChange={e => setFormData({...formData, dob: e.target.value})}
                            disabled={loading}
                            style={inputStyle}
                        />
                    </div>
                    
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px'}}>
                        <div>
                            <label style={labelStyle}>Height (cm)</label>
                            <input 
                                type="number" 
                                value={formData.height} 
                                onChange={e => setFormData({...formData, height: e.target.value})}
                                disabled={loading}
                                placeholder="170"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Gender</label>
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
                    </div>

                    <h3 style={{color: '#00f2ff', marginTop: '22px', marginBottom: '18px', fontSize: '1rem', borderBottom: '2px solid rgba(0,242,255,0.3)', paddingBottom: '10px'}}>
                        🎯 Health & Fitness Goals
                    </h3>

                    <div style={{marginBottom:'16px'}}>
                        <label style={labelStyle}>Activity Level</label>
                        <select 
                            value={formData.activityLevel} 
                            onChange={e => setFormData({...formData, activityLevel: e.target.value})}
                            disabled={loading}
                            style={inputStyle}
                        >
                            <option value="Sedentary">Sedentary (Little/No Exercise)</option>
                            <option value="Lightly Active">Lightly Active (1-3 days/week)</option>
                            <option value="Moderately Active">Moderately Active (3-5 days/week)</option>
                            <option value="Very Active">Very Active (6-7 days/week)</option>
                            <option value="Extremely Active">Extremely Active (Physical Job + Exercise)</option>
                        </select>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px'}}>
                        <div>
                            <label style={labelStyle}>Health Goal</label>
                            <select 
                                value={formData.healthGoal} 
                                onChange={e => setFormData({...formData, healthGoal: e.target.value})}
                                disabled={loading}
                                style={inputStyle}
                            >
                                <option value="Weight Loss">🔥 Weight Loss</option>
                                <option value="Weight Gain">💪 Weight Gain</option>
                                <option value="Muscle Building">🏋️ Muscle Building</option>
                                <option value="Maintenance">⚖️ Maintenance</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Target Weight (kg)</label>
                            <input 
                                type="number" 
                                value={formData.targetWeight} 
                                onChange={e => setFormData({...formData, targetWeight: e.target.value})}
                                disabled={loading}
                                placeholder="75"
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT: MEDICAL & ACTIONS */}
                <div>
                    <h3 style={{color: '#00f2ff', marginTop: 0, marginBottom: '18px', fontSize: '1rem', borderBottom: '2px solid rgba(0,242,255,0.3)', paddingBottom: '10px'}}>
                        ⚕️ Medical & Dietary Information
                    </h3>

                    <div style={{marginBottom:'16px'}}>
                        <label style={labelStyle}>Medical Conditions</label>
                        <select 
                            value={formData.medicalConditions} 
                            onChange={e => setFormData({...formData, medicalConditions: e.target.value})}
                            disabled={loading}
                            style={inputStyle}
                        >
                            <option value="None">None</option>
                            <option value="Diabetes">Diabetes</option>
                            <option value="Hypertension">Hypertension (High Blood Pressure)</option>
                            <option value="Heart Disease">Heart Disease</option>
                            <option value="Asthma">Asthma</option>
                            <option value="Thyroid">Thyroid Disorder</option>
                            <option value="Other">Other (Please Consult Doctor)</option>
                        </select>
                    </div>

                    <div style={{marginBottom:'16px'}}>
                        <label style={labelStyle}>Dietary Restrictions</label>
                        <select 
                            value={formData.dietaryRestrictions} 
                            onChange={e => setFormData({...formData, dietaryRestrictions: e.target.value})}
                            disabled={loading}
                            style={inputStyle}
                        >
                            <option value="None">None</option>
                            <option value="Vegetarian">🥗 Vegetarian</option>
                            <option value="Vegan">🌱 Vegan</option>
                            <option value="Gluten-Free">🌾 Gluten-Free</option>
                            <option value="Lactose Intolerant">🥛 Lactose Intolerant</option>
                            <option value="Nut Allergy">🥜 Nut Allergy</option>
                            <option value="Halal">☪️ Halal</option>
                            <option value="Kosher">✡️ Kosher</option>
                        </select>
                    </div>

                    {/* Medical/Dietary Info Display */}
                    {(formData.medicalConditions !== 'None' || formData.dietaryRestrictions !== 'None') && (
                        <div style={{
                            background: 'rgba(255,145,0,0.1)',
                            border: '1px solid rgba(255,145,0,0.3)',
                            padding: '15px',
                            borderRadius: '10px',
                            marginBottom: '16px'
                        }}>
                            <h4 style={{color: '#ff9100', margin: '0 0 10px 0', fontSize: '0.85rem'}}>
                                ⚠️ Important Health Information
                            </h4>
                            {formData.medicalConditions !== 'None' && (
                                <p style={{color: '#aaa', fontSize: '0.8rem', margin: '5px 0'}}>
                                    <strong>Medical:</strong> {formData.medicalConditions}
                                </p>
                            )}
                            {formData.dietaryRestrictions !== 'None' && (
                                <p style={{color: '#aaa', fontSize: '0.8rem', margin: '5px 0'}}>
                                    <strong>Dietary:</strong> {formData.dietaryRestrictions}
                                </p>
                            )}
                        </div>
                    )}

                    {/* BMI Guidance Card */}
                    {stats.bmi !== '--' && (
                        <div style={{
                            background: 'rgba(0,0,0,0.2)',
                            border: `1px solid ${stats.bmiColor}40`,
                            padding: '15px',
                            borderRadius: '10px',
                            marginBottom: '16px'
                        }}>
                            <h4 style={{color: stats.bmiColor, margin: '0 0 10px 0', fontSize: '0.85rem'}}>
                                📊 BMI Guidance
                            </h4>
                            <p style={{color: '#aaa', fontSize: '0.8rem', margin: 0, lineHeight: '1.5'}}>
                                {stats.bmiCategory === 'Healthy' && '✅ You are in a healthy weight range! Keep maintaining your current habits.'}
                                {stats.bmiCategory === 'Underweight' && '⚠️ You may want to consider gaining some weight. Consult a nutritionist for guidance.'}
                                {stats.bmiCategory === 'Overweight' && '⚠️ Consider a calorie deficit and regular exercise. Track your progress in Weight Tracker.'}
                                {stats.bmiCategory === 'Obese' && '🚨 We recommend consulting a healthcare professional for personalized advice.'}
                            </p>
                        </div>
                    )}

                    <button 
                        onClick={handleSave}
                        className="primary-btn" 
                        disabled={loading}
                        style={{
                            width:'100%',
                            opacity: loading ? 0.6 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            padding: '14px',
                            fontSize: '0.95rem',
                            fontWeight: '600'
                        }}
                    >
                        {loading ? 'Saving...' : '💾 Save Profile'}
                    </button>

                    <p style={{
                        fontSize:'0.75rem', 
                        color:'#666', 
                        textAlign:'center',
                        lineHeight: '1.4',
                        margin: '12px 0 0 0'
                    }}>
                        💡 Update your weight in the <b style={{color: '#a55eea'}}>Weight Tracker</b> tab
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Profile;