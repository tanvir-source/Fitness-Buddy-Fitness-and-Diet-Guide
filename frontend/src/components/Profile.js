import { useState, useEffect } from 'react';

const Profile = ({ user }) => {
    // Form State
    const [formData, setFormData] = useState({
        age: '', 
        gender: 'Male', 
        height: '', 
        activityLevel: 'Moderate', 
        goal: 'Maintenance'
    });

    // Display State (Calculated by Backend)
    const [stats, setStats] = useState({
        weight: '--',
        bmi: '--',
        bmiColor: '#fff',
        bmiCategory: 'Unknown'
    });

    // 1. Fetch Profile Data
    const fetchProfile = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`http://localhost:5000/api/profile/${user.email}`);
            if (res.ok) {
                const data = await res.json();
                
                // Update Form with saved data
                setFormData({
                    age: data.age || '',
                    gender: data.gender || 'Male',
                    height: data.height || '',
                    activityLevel: data.activityLevel || 'Moderate',
                    goal: data.goal || 'Maintenance'
                });

                // Update Stats (Weight comes from Weight DB now!)
                if (data.bmi) {
                    let color = '#00ff88'; // Green (Healthy)
                    let category = 'Healthy';
                    
                    if (data.bmi < 18.5) { color = '#ff9100'; category = 'Underweight'; }
                    if (data.bmi >= 25) { color = '#ff4444'; category = 'Overweight'; }
                    
                    setStats({
                        weight: data.weight || '--',
                        bmi: data.bmi,
                        bmiColor: color,
                        bmiCategory: category
                    });
                }
            }
        } catch (err) { console.error(err); }
    };

    // 2. Save Profile Data
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: user.email, // ✅ Key Fix: matches Backend
                    ...formData
                })
            });
            
            if (res.ok) {
                alert("Profile Saved!");
                fetchProfile(); // Refresh to recalc BMI
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchProfile(); }, [user]);

    return (
        <div className="glass-panel fade-in">
            <h2 style={{color: '#00f2ff', marginBottom:'20px'}}>👤 Your Profile</h2>
            
            <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
                
                {/* LEFT: EDIT FORM */}
                <form onSubmit={handleSave} style={{flex: 1, minWidth: '300px'}}>
                    <div style={{marginBottom:'15px'}}>
                        <label style={{display:'block', color:'#aaa', marginBottom:'5px'}}>Age</label>
                        <input 
                            type="number" 
                            value={formData.age} 
                            onChange={e => setFormData({...formData, age: e.target.value})}
                            style={{width:'100%', padding:'10px', borderRadius:'8px', border:'none', background:'rgba(255,255,255,0.1)', color:'white'}}
                        />
                    </div>
                    
                    <div style={{marginBottom:'15px'}}>
                        <label style={{display:'block', color:'#aaa', marginBottom:'5px'}}>Height (cm)</label>
                        <input 
                            type="number" 
                            value={formData.height} 
                            onChange={e => setFormData({...formData, height: e.target.value})}
                            style={{width:'100%', padding:'10px', borderRadius:'8px', border:'none', background:'rgba(255,255,255,0.1)', color:'white'}}
                        />
                    </div>

                    <div style={{marginBottom:'15px'}}>
                        <label style={{display:'block', color:'#aaa', marginBottom:'5px'}}>Gender</label>
                        <select 
                            value={formData.gender} 
                            onChange={e => setFormData({...formData, gender: e.target.value})}
                            style={{width:'100%', padding:'10px', borderRadius:'8px', border:'none', background:'rgba(255,255,255,0.1)', color:'white'}}
                        >
                            <option>Male</option>
                            <option>Female</option>
                        </select>
                    </div>

                    <button type="submit" className="primary-btn" style={{marginTop:'10px', width:'100%'}}>Save Profile</button>
                    <p style={{fontSize:'0.8rem', color:'#777', marginTop:'10px', textAlign:'center'}}>
                        *To update Weight, use the <b>Weight Tracker</b> tab.
                    </p>
                </form>

                {/* RIGHT: LIVE STATS */}
                <div style={{flex: 1, display:'flex', flexDirection:'column', gap:'20px'}}>
                    
                    {/* Weight Card */}
                    <div style={{background:'rgba(0,0,0,0.3)', padding:'20px', borderRadius:'15px', textAlign:'center', borderTop:'4px solid #a55eea'}}>
                        <h3 style={{color:'#aaa', margin:0}}>Current Weight</h3>
                        <h1 style={{fontSize:'3rem', margin:'10px 0', color:'#fff'}}>{stats.weight} <span style={{fontSize:'1rem', color:'#777'}}>kg</span></h1>
                    </div>

                    {/* BMI Card */}
                    <div style={{background:'rgba(0,0,0,0.3)', padding:'20px', borderRadius:'15px', textAlign:'center', borderTop:`4px solid ${stats.bmiColor}`}}>
                        <h3 style={{color:'#aaa', margin:0}}>BMI Score</h3>
                        <h1 style={{fontSize:'3rem', margin:'10px 0', color: stats.bmiColor}}>{stats.bmi}</h1>
                        <div style={{color: stats.bmiColor, fontWeight:'bold', textTransform:'uppercase', letterSpacing:'1px'}}>
                            {stats.bmiCategory}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;