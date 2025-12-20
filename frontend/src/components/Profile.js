import { useState, useEffect } from 'react';

const Profile = ({ user }) => {
    const [formData, setFormData] = useState({
        age: '', gender: 'male', height: '', currentWeight: '', activityLevel: 'moderate', goal: 'maintain'
    });
    const [bmi, setBmi] = useState(null);

    useEffect(() => {
        if (user?.email) fetchProfile();
        // eslint-disable-next-line
    }, [user]);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/profile/${user.email}`);
            if (res.ok) {
                const data = await res.json();
                setFormData({ ...formData, ...data });
                calculateBMI(data.currentWeight, data.height);
            }
        } catch (err) { console.error(err); }
    };

    const calculateBMI = (weight, height) => {
        if (weight && height) {
            const hInMeters = height / 100;
            const bmiValue = (weight / (hInMeters * hInMeters)).toFixed(1);
            setBmi(bmiValue);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, ...formData })
            });
            if (res.ok) {
                alert("Profile Updated! ✅");
                calculateBMI(formData.currentWeight, formData.height);
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div className="glass-panel fade-in">
            <h2 style={{color: '#00f2ff'}}>👤 Health Profile</h2>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                
                {/* Form Section */}
                <form onSubmit={handleSubmit} style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Age:</label>
                        <input type="number" value={formData.age} onChange={e=>setFormData({...formData, age:e.target.value})} style={{width:'100%', padding:'8px'}} />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Height (cm):</label>
                        <input type="number" value={formData.height} onChange={e=>setFormData({...formData, height:e.target.value})} style={{width:'100%', padding:'8px'}} />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Current Weight (kg):</label>
                        <input type="number" value={formData.currentWeight} onChange={e=>setFormData({...formData, currentWeight:e.target.value})} style={{width:'100%', padding:'8px'}} />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Goal:</label>
                        <select value={formData.goal} onChange={e=>setFormData({...formData, goal:e.target.value})} style={{width:'100%', padding:'8px'}}>
                            <option value="lose">Lose Weight</option>
                            <option value="maintain">Maintain</option>
                            <option value="gain">Gain Muscle</option>
                        </select>
                    </div>
                    <button type="submit" className="primary-btn" style={{marginTop:'10px'}}>Save Profile</button>
                </form>

                {/* Stats Section */}
                <div style={{ flex: 1, minWidth: '250px', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
                    <h3>Your BMI 

[Image of BMI chart]
</h3>
                    {bmi ? (
                        <>
                            <h1 style={{ fontSize: '4rem', margin: '10px 0', color: bmi > 25 ? '#ff4444' : '#00ff88' }}>{bmi}</h1>
                            <p>{bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal Weight' : 'Overweight'}</p>
                        </>
                    ) : <p>Enter details to calculate</p>}
                </div>
            </div>
        </div>
    );
};

export default Profile;