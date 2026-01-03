import { useState, useEffect } from 'react';

const BmiBmr = ({ user }) => {
    const [formData, setFormData] = useState({
        weight: '',
        height: '',
        age: '',
        gender: 'Male',
        activityLevel: 'Sedentary'
    });

    const [results, setResults] = useState({
        bmi: null,
        bmiCategory: '',
        bmiColor: '',
        bmr: null,
        tdee: null
    });

    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState('');

    const activityLevels = {
        'Sedentary': { multiplier: 1.2, description: 'Little or no exercise' },
        'Lightly Active': { multiplier: 1.375, description: 'Light exercise 1-3 days/week' },
        'Moderately Active': { multiplier: 1.55, description: 'Moderate exercise 3-5 days/week' },
        'Very Active': { multiplier: 1.725, description: 'Hard exercise 6-7 days/week' },
        'Extremely Active': { multiplier: 1.9, description: 'Very hard exercise & physical job' }
    };

    // ✅ FETCH ALL DATA FROM PROFILE
    const fetchProfileData = async () => {
        if (!user?.email) return;
        
        setLoading(true);
        try {
            // Fetch profile
            const profileRes = await fetch(`http://localhost:5000/api/profile/${user.email}`);
            
            // Fetch latest weight
            const weightRes = await fetch(`http://localhost:5000/api/weight?email=${user.email}`);
            
            if (profileRes.ok && weightRes.ok) {
                const profileData = await profileRes.json();
                const weightData = await weightRes.json();
                
                // Get latest weight
                const latestWeight = Array.isArray(weightData) && weightData.length > 0 
                    ? weightData.sort((a, b) => new Date(b.date) - new Date(a.date))[0].weight 
                    : '';
                
                // Calculate age from DOB
                let calculatedAge = '';
                if (profileData.dob) {
                    const birthDate = new Date(profileData.dob);
                    const today = new Date();
                    calculatedAge = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        calculatedAge--;
                    }
                }
                
                // Update form with profile data
                setFormData({
                    weight: latestWeight.toString(),
                    height: profileData.height?.toString() || '',
                    age: calculatedAge.toString(),
                    gender: profileData.gender || 'Male',
                    activityLevel: profileData.activityLevel && activityLevels[profileData.activityLevel] 
                        ? profileData.activityLevel 
                        : 'Sedentary'
                });
                
                setDataSource(`Loaded from Profile (${new Date().toLocaleTimeString()})`);
                
                console.log('📊 Profile data loaded:', {
                    weight: latestWeight,
                    height: profileData.height,
                    age: calculatedAge,
                    gender: profileData.gender
                });
            }
        } catch (err) {
            console.error('Error fetching profile data:', err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ AUTO-LOAD on mount
    useEffect(() => {
        fetchProfileData();
    }, [user]);

    // ✅ AUTO-REFRESH every 5 seconds to stay in sync with Profile
    useEffect(() => {
        const interval = setInterval(() => {
            fetchProfileData();
        }, 5000);

        return () => clearInterval(interval);
    }, [user]);

    const calculateResults = () => {
        const { weight, height, age, gender, activityLevel } = formData;

        // Validation
        if (!weight || !height || !age) {
            setResults({
                bmi: null,
                bmiCategory: '',
                bmiColor: '',
                bmr: null,
                tdee: null
            });
            return;
        }

        const w = parseFloat(weight);
        const h = parseFloat(height);
        const a = parseFloat(age);

        if (isNaN(w) || isNaN(h) || isNaN(a) || w <= 0 || h <= 0 || a <= 0) {
            return;
        }

        // BMI Calculation
        const heightInMeters = h / 100;
        const bmi = (w / (heightInMeters * heightInMeters)).toFixed(1);

        // BMI Category and Color
        let category = '';
        let color = '';

        if (bmi < 18.5) {
            category = 'Underweight';
            color = '#FFA500';
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Normal Weight';
            color = '#00ff88';
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Overweight';
            color = '#ff9100';
        } else {
            category = 'Obese';
            color = '#ff4444';
        }

        // BMR Calculation (Mifflin-St Jeor)
        let bmr;
        if (gender === 'Male') {
            bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
        } else {
            bmr = (10 * w) + (6.25 * h) - (5 * a) - 161;
        }
        bmr = Math.round(bmr);

        // TDEE Calculation
        const tdee = Math.round(bmr * activityLevels[activityLevel].multiplier);

        setResults({
            bmi: parseFloat(bmi),
            bmiCategory: category,
            bmiColor: color,
            bmr: bmr,
            tdee: tdee
        });
    };

    useEffect(() => {
        calculateResults();
    }, [formData]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const getBMIIndicatorPosition = () => {
        if (!results.bmi) return 0;
        const minBMI = 15;
        const maxBMI = 40;
        const percentage = ((results.bmi - minBMI) / (maxBMI - minBMI)) * 100;
        return Math.min(Math.max(percentage, 0), 100);
    };

    const inputStyle = {
        width: '100%',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'rgba(255,255,255,0.1)',
        color: 'white',
        fontSize: '1.1rem',
        height: '56px',
        boxSizing: 'border-box'
    };

    return (
        <div className="glass-panel fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ color: '#00f2ff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    📊 BMI & BMR Calculator
                </h2>
                
                <div style={{ textAlign: 'right' }}>
                    <button
                        onClick={fetchProfileData}
                        disabled={loading}
                        style={{
                            padding: '8px 16px',
                            background: 'rgba(0, 242, 255, 0.2)',
                            border: '1px solid #00f2ff',
                            borderRadius: '8px',
                            color: '#00f2ff',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '0.85rem',
                            opacity: loading ? 0.5 : 1,
                            marginBottom: '5px'
                        }}
                    >
                        {loading ? '⏳ Syncing...' : '🔄 Sync from Profile'}
                    </button>
                    {dataSource && (
                        <div style={{ fontSize: '0.7rem', color: '#00ff88' }}>
                            ✓ {dataSource}
                        </div>
                    )}
                </div>
            </div>

            {/* Info Banner */}
            <div style={{
                background: 'rgba(0, 242, 255, 0.1)',
                border: '1px solid rgba(0, 242, 255, 0.3)',
                padding: '15px',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '0.9rem',
                color: '#00f2ff'
            }}>
                💡 <strong>Auto-Sync Enabled:</strong> All data automatically loads from your Profile. 
                Update weight, height, age, or gender in <strong>Profile</strong> tab and it syncs here automatically.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(400px, 2fr)', gap: '40px' }}>
                
                {/* LEFT: Input Form (Auto-populated from Profile) */}
                <div>
                    <h3 style={{ color: '#00f2ff', marginBottom: '20px', fontSize: '1.1rem' }}>
                        Details
                        <span style={{ fontSize: '0.75rem', color: '#00ff88', marginLeft: '10px' }}>
                            {formData.weight && formData.height && formData.age ? '✓ Synced' : '⚠ Incomplete'}
                        </span>
                    </h3>

                    {/* Weight (from Weight Tracker) */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '10px', fontSize: '0.9rem', fontWeight: '500' }}>
                            Weight (kg)
                            <span style={{ fontSize: '0.75rem', color: '#00ff88', marginLeft: '8px', fontWeight: 'normal' }}>
                            </span>
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            placeholder="Log weight in Weight Tracker"
                            value={formData.weight}
                            onChange={(e) => handleInputChange('weight', e.target.value)}
                            style={{
                                ...inputStyle,
                                borderColor: formData.weight ? '#00ff88' : 'rgba(255,68,68,0.5)'
                            }}
                        />
                    </div>

                    {/* Height (from Profile) */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '10px', fontSize: '0.9rem', fontWeight: '500' }}>
                            Height (cm)
                            <span style={{ fontSize: '0.75rem', color: '#00ff88', marginLeft: '8px', fontWeight: 'normal' }}>
                            </span>
                        </label>
                        <input
                            type="number"
                            placeholder="Set height in Profile"
                            value={formData.height}
                            onChange={(e) => handleInputChange('height', e.target.value)}
                            style={{
                                ...inputStyle,
                                borderColor: formData.height ? '#00ff88' : 'rgba(255,68,68,0.5)'
                            }}
                        />
                    </div>

                    {/* Age (from Profile DOB) */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '10px', fontSize: '0.9rem', fontWeight: '500' }}>
                            Age (years)
                            <span style={{ fontSize: '0.75rem', color: '#00ff88', marginLeft: '8px', fontWeight: 'normal' }}>
                            </span>
                        </label>
                        <input
                            type="number"
                            placeholder="Set DOB in Profile"
                            value={formData.age}
                            onChange={(e) => handleInputChange('age', e.target.value)}
                            style={{
                                ...inputStyle,
                                borderColor: formData.age ? '#00ff88' : 'rgba(255,68,68,0.5)'
                            }}
                        />
                    </div>

                    {/* Gender (from Profile) */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '10px', fontSize: '0.9rem', fontWeight: '500' }}>
                            Gender
                            <span style={{ fontSize: '0.75rem', color: '#00ff88', marginLeft: '8px', fontWeight: 'normal' }}>
                            </span>
                        </label>
                        <select
                            value={formData.gender}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            style={inputStyle}
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    {/* Activity Level (editable) */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '10px', fontSize: '0.9rem', fontWeight: '500' }}>
                            Activity Level
                        </label>
                        <select
                            value={formData.activityLevel}
                            onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                            style={inputStyle}
                        >
                            {Object.entries(activityLevels).map(([level, data]) => (
                                <option key={level} value={level}>
                                    {level}
                                </option>
                            ))}
                        </select>
                        <p style={{ fontSize: '0.75rem', color: '#777', marginTop: '8px', marginBottom: 0 }}>
                            {activityLevels[formData.activityLevel]?.description || 'Select your activity level'}
                        </p>
                    </div>

                    {/* Missing Data Warning */}
                    {(!formData.weight || !formData.height || !formData.age) && (
                        <div style={{
                            background: 'rgba(255, 145, 0, 0.1)',
                            border: '1px solid #ff9100',
                            padding: '15px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            color: '#ff9100'
                        }}>
                            <strong>⚠️ Missing Data</strong>
                            <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                                {!formData.weight && <li>Log your weight in <strong>Weight Tracker</strong></li>}
                                {!formData.height && <li>Set your height in <strong>Profile</strong></li>}
                                {!formData.age && <li>Set your date of birth in <strong>Profile</strong></li>}
                            </ul>
                        </div>
                    )}
                </div>

                {/* RIGHT: Results */}
                <div>
                    {results.bmi ? (
                        <>
                            {/* Top Row: BMI and BMR/TDEE side by side */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                {/* BMI Card */}
                                <div style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    padding: '25px',
                                    borderRadius: '20px',
                                    borderTop: `4px solid ${results.bmiColor}`,
                                    textAlign: 'center'
                                }}>
                                    <h4 style={{ color: '#aaa', margin: '0 0 10px 0', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                        Body Mass Index
                                    </h4>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: results.bmiColor, marginBottom: '10px' }}>
                                        {results.bmi}
                                    </div>
                                    <div style={{
                                        color: results.bmiColor,
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px',
                                        fontSize: '1rem'
                                    }}>
                                        {results.bmiCategory}
                                    </div>

                                    {/* BMI Scale */}
                                    <div style={{ marginTop: '20px' }}>
                                        <div style={{
                                            height: '10px',
                                            background: 'linear-gradient(to right, #FFA500 0%, #00ff88 25%, #00ff88 50%, #ff9100 75%, #ff4444 100%)',
                                            borderRadius: '5px',
                                            position: 'relative',
                                            marginBottom: '8px'
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                left: `${getBMIIndicatorPosition()}%`,
                                                top: '-6px',
                                                transform: 'translateX(-50%)',
                                                width: '0',
                                                height: '0',
                                                borderLeft: '8px solid transparent',
                                                borderRight: '8px solid transparent',
                                                borderTop: `12px solid ${results.bmiColor}`,
                                            }} />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#777' }}>
                                            <span>15</span>
                                            <span>18.5</span>
                                            <span>25</span>
                                            <span>30</span>
                                            <span>40</span>
                                        </div>
                                    </div>
                                </div>

                                {/* BMR & TDEE Combined Card */}
                                <div style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    padding: '25px',
                                    borderRadius: '20px',
                                    borderTop: '4px solid #00f2ff',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    {/* BMR */}
                                    <div style={{ marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h4 style={{ color: '#aaa', margin: '0 0 5px 0', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                    Basal Metabolic Rate
                                                </h4>
                                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00f2ff' }}>
                                                    {results.bmr}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#777' }}>cal/day at rest</div>
                                            </div>
                                            <div style={{ fontSize: '2rem' }}>🔥</div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                                        {/* TDEE */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h4 style={{ color: '#aaa', margin: '0 0 5px 0', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                    Total Daily Energy
                                                </h4>
                                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9100' }}>
                                                    {results.tdee}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#777' }}>{formData.activityLevel}</div>
                                            </div>
                                            <div style={{ fontSize: '2rem' }}>⚡</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Calorie Goals */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr',
                                gap: '15px',
                                marginBottom: '20px'
                            }}>
                                <div style={{
                                    background: 'rgba(255, 68, 68, 0.1)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    borderLeft: '4px solid #ff4444',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '8px', textTransform: 'uppercase' }}>Lose Weight</div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#ff4444' }}>
                                        {results.tdee - 500}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#777' }}>cal/day</div>
                                    <div style={{ fontSize: '0.65rem', color: '#555', marginTop: '5px' }}>-500 deficit</div>
                                </div>
                                
                                <div style={{
                                    background: 'rgba(0, 255, 136, 0.1)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    borderLeft: '4px solid #00ff88',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '8px', textTransform: 'uppercase' }}>Maintain</div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#00ff88' }}>
                                        {results.tdee}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#777' }}>cal/day</div>
                                    <div style={{ fontSize: '0.65rem', color: '#555', marginTop: '5px' }}>balanced</div>
                                </div>
                                
                                <div style={{
                                    background: 'rgba(0, 242, 255, 0.1)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    borderLeft: '4px solid #00f2ff',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '8px', textTransform: 'uppercase' }}>Gain Weight</div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#00f2ff' }}>
                                        {results.tdee + 500}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#777' }}>cal/day</div>
                                    <div style={{ fontSize: '0.65rem', color: '#555', marginTop: '5px' }}>+500 surplus</div>
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div style={{
                                background: 'rgba(0, 242, 255, 0.1)',
                                padding: '20px',
                                borderRadius: '12px',
                                borderLeft: '4px solid #00f2ff'
                            }}>
                                <h4 style={{ color: '#00f2ff', marginTop: 0, fontSize: '1rem' }}>💡 Recommendations</h4>
                                <ul style={{ color: '#ccc', margin: 0, paddingLeft: '20px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                    {results.bmiCategory === 'Normal Weight' && (
                                        <>
                                            <li>Maintain at {results.tdee} calories/day</li>
                                            <li>Continue balanced diet and exercise</li>
                                            <li>Stay hydrated and get adequate sleep</li>
                                        </>
                                    )}
                                    {results.bmiCategory === 'Underweight' && (
                                        <>
                                            <li>Increase to {results.tdee + 500} calories/day</li>
                                            <li>Focus on nutrient-dense foods</li>
                                            <li>Strength training to build muscle</li>
                                        </>
                                    )}
                                    {results.bmiCategory === 'Overweight' && (
                                        <>
                                            <li>Target {results.tdee - 500} calories/day</li>
                                            <li>Increase physical activity</li>
                                            <li>Focus on whole foods</li>
                                        </>
                                    )}
                                    {results.bmiCategory === 'Obese' && (
                                        <>
                                            <li>Consult healthcare professional</li>
                                            <li>Start at {results.tdee - 750} calories/day</li>
                                            <li>Begin low-impact exercises</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            color: '#777'
                        }}>
                            <div style={{ fontSize: '5rem', marginBottom: '20px', opacity: 0.3 }}>📊</div>
                            <h3 style={{ color: '#999' }}>Complete Your Profile</h3>
                            <p style={{ color: '#666', marginBottom: '20px' }}>
                                Go to <strong style={{color: '#00f2ff'}}>Profile</strong> to set:<br/>
                                Height, Date of Birth, Gender
                            </p>
                            <p style={{ color: '#666' }}>
                                Then log your weight in <strong style={{color: '#a55eea'}}>Weight Tracker</strong>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Footer */}
            <div style={{
                marginTop: '30px',
                padding: '20px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '10px',
                fontSize: '0.85rem',
                color: '#888'
            }}>
                <p style={{ margin: '0 0 10px 0' }}>
                    <strong style={{ color: '#00f2ff' }}>Auto-Sync:</strong> Data automatically loads from Profile (height, age, gender) and Weight Tracker (current weight).
                </p>
                <p style={{ margin: '0 0 10px 0' }}>
                    <strong style={{ color: '#00f2ff' }}>BMR:</strong> Calculated using Mifflin-St Jeor equation based on your profile data.
                </p>
                <p style={{ margin: '0' }}>
                    <strong style={{ color: '#00f2ff' }}>TDEE:</strong> Your BMR multiplied by activity level - represents total daily calorie needs.
                </p>
            </div>
        </div>
    );
};

export default BmiBmr;