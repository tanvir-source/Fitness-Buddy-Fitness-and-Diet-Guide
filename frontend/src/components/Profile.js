import { useState, useEffect } from 'react';

const Profile = ({ user }) => {
    const [formData, setFormData] = useState({
        dob: '', gender: 'male', height: '', activityLevel: 'moderate', goal: 'maintain'
    });
    const [latestWeight, setLatestWeight] = useState(null);
    const [bmi, setBmi] = useState(null);
    const [age, setAge] = useState(null);

    // --- 1. DEFINE FUNCTIONS FIRST ---

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

    const fetchProfile = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`http://localhost:5000/api/profile/${user.email}`);
            if (res.ok) {
                const data = await res.json();
                setFormData({ ...data }); 
                if(data.dob) calculateAge(data.dob);
            }
        } catch (err) { console.error(err); }
    };

    const fetchLatestWeight = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`http://localhost:5000/api/weight/${user.email}`);
            if (res.ok) {
                const logs = await res.json();
                if (logs.length > 0) {
                    setLatestWeight(logs[0].weight); 
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
            alert("Profile Saved! ✅");
        } catch (err) { console.error(err); }
    };

    // --- 2. RUN EFFECTS LAST --- (This fixes the crash)
    
    // Auto-calculate BMI
    useEffect(() => {
        if (latestWeight && formData.height) {
            const hInMeters = formData.height / 100;
            const bmiValue = (latestWeight / (hInMeters * hInMeters)).toFixed(1);
            setBmi(bmiValue);
        }
    }, [latestWeight, formData.height]);

    // Load data on startup
    useEffect(() => {
        if (user?.email) {
            fetchProfile();
            fetchLatestWeight();
        }
    }, [user]);

    return (
        <div className="glass-panel fade-in">
            <h2 style={{color: '#00f2ff'}}>👤 Smart Health Profile</h2>
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                
                {/* Form */}
                <form onSubmit={handleSubmit} style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Date of Birth:</label>
                        <input type="date" value={formData.dob} onChange={e=>{setFormData({...formData, dob:e.target.value}); calculateAge(e.target.value)}} style={{width:'100%', padding:'10px', marginTop:'5px'}} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Height (cm):</label>
                        <input type="number" value={formData.height} onChange={e=>setFormData({...formData, height:e.target.value})} placeholder="e.g. 175" style={{width:'100%', padding:'10px', marginTop:'5px'}} />
                    </div>
                    
                    <div style={{ marginBottom: '15px', padding:'10px', background:'rgba(255,255,255,0.05)', borderRadius:'8px' }}>
                        <label style={{color:'#aaa'}}>Current Weight (from Tracker):</label>
                        <div style={{fontSize:'1.2rem', fontWeight:'bold', color:'white'}}>
                            {latestWeight ? `${latestWeight} kg` : "No logs yet. Go to Weight tab!"}
                        </div>
                    </div>

                    <button type="submit" className="primary-btn" style={{width:'100%'}}>Save Details</button>
                </form>

                {/* Live Stats */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                     <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
                        <h3>Age</h3>
                        <h1 style={{ color: '#00f2ff' }}>{age || '--'}</h1>
                     </div>
                     <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '15px' }}>
                        <h3>Your BMI 

[Image of BMI Gauge]
</h3>
                        {bmi ? (
                            <>
                                <h1 style={{ fontSize: '4rem', margin: '10px 0', color: bmi > 25 ? '#ff4444' : '#00ff88' }}>{bmi}</h1>
                                <p>{bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy' : 'Overweight'}</p>
                            </>
                        ) : <p>Enter Height & Log Weight</p>}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;