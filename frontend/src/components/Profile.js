import { useState, useEffect } from 'react';

const Profile = ({ user }) => {
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
        weight: '--', // This will now come from the DB
        bmi: '--',
        bmiColor: '#fff',
        bmiCategory: 'Unknown',
        age: '--'
    });

    // 1. Fetch Profile + Latest Weight
    const fetchProfile = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`http://localhost:5000/api/profile/${user.email}`);
            if (res.ok) {
                const data = await res.json();
                
                // Update Form Fields
                setFormData({
                    dob: data.dob || '',
                    gender: data.gender || 'Male',
                    height: data.height || '',
                    activityLevel: data.activityLevel || 'Moderate',
                    goal: data.goal || 'Maintenance'
                });

                // CALCULATE STATS
                // Use the 'latestWeight' we sent from the backend
                const weight = data.latestWeight || 0;
                const height = data.height || 0;
                
                let calculatedBMI = '--';
                let color = '#fff';
                let category = 'Unknown';

                if (weight > 0 && height > 0) {
                    const heightInMeters = height / 100;
                    calculatedBMI = (weight / (heightInMeters * heightInMeters)).toFixed(1);

                    if (calculatedBMI < 18.5) { color = '#ff9100'; category = 'Underweight'; }
                    else if (calculatedBMI < 25) { color = '#00ff88'; category = 'Healthy'; }
                    else { color = '#ff4444'; category = 'Overweight'; }
                }

                // Calculate Age
                let ageVal = '--';
                if (data.dob) {
                    const birthDate = new Date(data.dob);
                    const today = new Date();
                    ageVal = today.getFullYear() - birthDate.getFullYear();
                }

                setStats({
                    weight: weight > 0 ? weight : '--', // Show the fetched weight!
                    bmi: calculatedBMI,
                    bmiColor: color,
                    bmiCategory: category,
                    age: ageVal
                });
            }
        } catch (err) { console.error(err); }
    };

    // 2. Save Profile (Only saves static info, not weight)
    const handleSave = async (e) => {
        e.preventDefault();
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
                alert("Profile Saved!");
                fetchProfile(); // Refresh to recalculate stats
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
                        <label style={{display:'block', color:'#aaa', marginBottom:'5px'}}>Date of Birth</label>
                        <input 
                            type="date" 
                            value={formData.dob} 
                            onChange={e => setFormData({...formData, dob: e.target.value})}
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
                    
                    {/* Age & Weight Row */}
                    <div style={{display:'flex', gap:'20px'}}>
                        <div style={{flex:1, background:'rgba(0,0,0,0.3)', padding:'20px', borderRadius:'15px', textAlign:'center', borderTop:'4px solid #00f2ff'}}>
                            <h3 style={{color:'#aaa', margin:0}}>Age</h3>
                            <h1 style={{fontSize:'2.5rem', margin:'10px 0', color:'#fff'}}>{stats.age}</h1>
                        </div>
                        <div style={{flex:1, background:'rgba(0,0,0,0.3)', padding:'20px', borderRadius:'15px', textAlign:'center', borderTop:'4px solid #a55eea'}}>
                            <h3 style={{color:'#aaa', margin:0}}>Weight</h3>
                            <h1 style={{fontSize:'2.5rem', margin:'10px 0', color:'#fff'}}>{stats.weight} <span style={{fontSize:'1rem', color:'#777'}}>kg</span></h1>
                        </div>
                    </div>

                    {/* BMI Card */}
                    <div style={{background:'rgba(0,0,0,0.3)', padding:'20px', borderRadius:'15px', textAlign:'center', borderTop:`4px solid ${stats.bmiColor}`}}>
                        <h3 style={{color:'#aaa', margin:0}}>BMI Score</h3>
                        <h1 style={{fontSize:'3.5rem', margin:'10px 0', color: stats.bmiColor}}>{stats.bmi}</h1>
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