import { useState, useEffect } from 'react';

const Profile = ({ user }) => {
    // Initialize with empty strings
    const [formData, setFormData] = useState({
        dob: '', gender: 'male', height: '', activityLevel: 'moderate', goal: 'maintain'
    });
    const [latestWeight, setLatestWeight] = useState(null);
    const [bmi, setBmi] = useState(null);
    const [age, setAge] = useState(null);

    // --- 1. DEFINE FUNCTIONS ---

    const calculateAge = (dateString) => {
        if (!dateString) return;
        const today = new Date();
        const birthDate = new Date(dateString);
        let ageNow = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            ageNow--;
        }
        setAge(ageNow);
    };

    // FETCH SAVED DATA
    const fetchProfile = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`http://localhost:5000/api/profile/${user.email}`);
            if (res.ok) {
                const data = await res.json();
                // ✅ MERGE saved data into form
                setFormData(prev => ({ ...prev, ...data }));
                if(data.dob) calculateAge(data.dob);
            }
        } catch (err) { console.error("No profile found yet, that's okay."); }
    };

    const fetchLatestWeight = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`http://localhost:5000/api/weight/${user.email}`);
            if (res.ok) {
                const logs = await res.json();
                if (logs.length > 0) {
                    setLatestWeight(logs[0].weight); // Get most recent
                }
            }
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch('http://localhost:5000/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, ...formData })
            });
            calculateAge(formData.dob);
            alert("✅ details saved successfully!");
        } catch (err) { console.error(err); }
    };

    // --- 2. EFFECTS ---
    
    // Calculate BMI whenever Weight (from DB) or Height (from input) changes
    useEffect(() => {
        if (latestWeight && formData.height) {
            const hInMeters = formData.height / 100;
            const bmiValue = (latestWeight / (hInMeters * hInMeters)).toFixed(1);
            setBmi(bmiValue);
        }
    }, [latestWeight, formData.height]);

    // Load Data ONCE when component mounts
    useEffect(() => {
        if (user?.email) {
            fetchProfile();
            fetchLatestWeight();
        }
    }, [user]);

    return (
        <div className="glass-panel fade-in">
            <h2 style={{color: '#00f2ff'}}>👤 Your Profile</h2>
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                
                {/* Form Section */}
                <form onSubmit={handleSubmit} style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{color:'#aaa', fontSize:'0.9rem'}}>Date of Birth (Auto-Saves)</label>
                        {/* ✅ Value is tied to State */}
                        <input 
                            type="date" 
                            value={formData.dob} 
                            onChange={e=>{
                                setFormData({...formData, dob:e.target.value}); 
                                calculateAge(e.target.value)
                            }} 
                            style={{width:'100%', padding:'12px', marginTop:'5px', borderRadius:'8px', border:'none'}} 
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{color:'#aaa', fontSize:'0.9rem'}}>Height (cm)</label>
                        {/* ✅ Value is tied to State */}
                        <input 
                            type="number" 
                            value={formData.height} 
                            onChange={e=>setFormData({...formData, height:e.target.value})} 
                            placeholder="e.g. 175" 
                            style={{width:'100%', padding:'12px', marginTop:'5px', borderRadius:'8px', border:'none'}} 
                        />
                    </div>
                    
                    <div style={{ marginBottom: '20px', padding:'15px', background:'rgba(255,255,255,0.05)', borderRadius:'10px', borderLeft:'4px solid #a55eea' }}>
                        <label style={{color:'#aaa', fontSize:'0.8rem'}}>Latest Weight (from Weight Tab)</label>
                        <div style={{fontSize:'1.4rem', fontWeight:'bold', color:'white'}}>
                            {latestWeight ? `${latestWeight} kg` : "No data yet"}
                        </div>
                    </div>

                    <button type="submit" className="primary-btn" style={{width:'100%'}}>Save Information</button>
                </form>

                {/* Stats Section */}
                <div style={{ flex: 1, textAlign: 'center', display:'flex', flexDirection:'column', gap:'20px' }}>
                     <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '15px', flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
                        <h3 style={{margin:0, color:'#ccc'}}>Age</h3>
                        <h1 style={{ fontSize:'3rem', margin:'10px 0', color: '#00f2ff' }}>{age || '--'}</h1>
                        <small style={{color:'#777'}}>Years Old</small>
                     </div>
                     <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '15px', flex:1 }}>
                        <h3 style={{margin:0, color:'#ccc'}}>BMI Score 

[Image of BMI Gauge]
</h3>
                        {bmi ? (
                            <>
                                <h1 style={{ fontSize: '4rem', margin: '10px 0', color: bmi > 25 ? '#ff4444' : bmi < 18.5 ? '#ff9100' : '#00ff88' }}>{bmi}</h1>
                                <p style={{color:'#fff', fontWeight:'bold'}}>{bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy Weight' : 'Overweight'}</p>
                            </>
                        ) : <p style={{marginTop:'20px', color:'#777'}}>Enter Height & Log Weight</p>}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;