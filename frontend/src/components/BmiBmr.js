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

    const activityLevels = {
        'Sedentary': { multiplier: 1.2, description: 'Little or no exercise' },
        'Lightly Active': { multiplier: 1.375, description: 'Light exercise 1-3 days/week' },
        'Moderately Active': { multiplier: 1.55, description: 'Moderate exercise 3-5 days/week' },
        'Very Active': { multiplier: 1.725, description: 'Hard exercise 6-7 days/week' },
        'Extremely Active': { multiplier: 1.9, description: 'Very hard exercise & physical job' }
    };

    const calculateResults = () => {
        const { weight, height, age, gender, activityLevel } = formData;

        // Validation
        if (!weight || !height || !age) {
            return;
        }

        const w = parseFloat(weight);
        const h = parseFloat(height);
        const a = parseFloat(age);

        // BMI Calculation (kg/m²)
        const heightInMeters = h / 100;
        const bmi = (w / (heightInMeters * heightInMeters)).toFixed(1);

        // BMI Category and Color
        let category = '';
        let color = '';

        if (bmi < 18.5) {
            category = 'Underweight';
            color = '#FFA500'; // Orange
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Normal Weight';
            color = '#00ff88'; // Green
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Overweight';
            color = '#ff9100'; // Light Orange
        } else {
            category = 'Obese';
            color = '#ff4444'; // Red
        }

        // BMR Calculation (Mifflin-St Jeor Equation)
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
        
        // Map BMI to percentage (scale 15-40)
        const minBMI = 15;
        const maxBMI = 40;
        const percentage = ((results.bmi - minBMI) / (maxBMI - minBMI)) * 100;
        return Math.min(Math.max(percentage, 0), 100);
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'rgba(255,255,255,0.1)',
        color: 'white',
        fontSize: '1rem'
    };

    return (
        <div className="glass-panel fade-in">
            <h2 style={{ color: '#00f2ff', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📊 BMI & BMR Calculator
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                
                {/* LEFT: Input Form */}
                <div>
                    <h3 style={{ color: '#00f2ff', marginBottom: '20px', fontSize: '1.1rem' }}>
                        Enter Your Details
                    </h3>

                    {/* Weight Input */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '0.9rem' }}>
                            Weight (kg)
                        </label>
                        <input
                            type="number"
                            placeholder="e.g., 70"
                            value={formData.weight}
                            onChange={(e) => handleInputChange('weight', e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    {/* Height Input */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '0.9rem' }}>
                            Height (cm)
                        </label>
                        <input
                            type="number"
                            placeholder="e.g., 170"
                            value={formData.height}
                            onChange={(e) => handleInputChange('height', e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    {/* Age Input */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '0.9rem' }}>
                            Age (years)
                        </label>
                        <input
                            type="number"
                            placeholder="e.g., 25"
                            value={formData.age}
                            onChange={(e) => handleInputChange('age', e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    {/* Gender Select */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '0.9rem' }}>
                            Gender
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

                    {/* Activity Level Select */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '0.9rem' }}>
                            Activity Level
                        </label>
                        <select
                            value={formData.activityLevel}
                            onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                            style={inputStyle}
                        >
                            {Object.keys(activityLevels).map(level => (
                                <option key={level} value={level}>
                                    {level} - {activityLevels[level].description}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* RIGHT: Results Display */}
                <div>
                    <h3 style={{ color: '#00f2ff', marginBottom: '20px', fontSize: '1.1rem' }}>
                        Your Results
                    </h3>

                    {/* BMI Result Card */}
                    {results.bmi && (
                        <>
                            <div style={{
                                background: 'rgba(0,0,0,0.3)',
                                padding: '30px',
                                borderRadius: '15px',
                                textAlign: 'center',
                                borderTop: `4px solid ${results.bmiColor}`,
                                marginBottom: '20px'
                            }}>
                                <h4 style={{ color: '#aaa', margin: '0 0 15px 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                                    Body Mass Index (BMI)
                                </h4>
                                <div style={{
                                    fontSize: '4rem',
                                    fontWeight: 'bold',
                                    color: results.bmiColor,
                                    margin: '15px 0'
                                }}>
                                    {results.bmi}
                                </div>
                                <div style={{
                                    color: results.bmiColor,
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px',
                                    fontSize: '1.1rem'
                                }}>
                                    {results.bmiCategory}
                                </div>

                                {/* BMI Scale Indicator */}
                                <div style={{ marginTop: '25px' }}>
                                    <div style={{
                                        height: '12px',
                                        background: 'linear-gradient(to right, #FFA500 0%, #00ff88 25%, #00ff88 50%, #ff9100 75%, #ff4444 100%)',
                                        borderRadius: '6px',
                                        position: 'relative',
                                        marginBottom: '10px'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            left: `${getBMIIndicatorPosition()}%`,
                                            top: '-8px',
                                            transform: 'translateX(-50%)',
                                            width: '0',
                                            height: '0',
                                            borderLeft: '10px solid transparent',
                                            borderRight: '10px solid transparent',
                                            borderTop: `15px solid ${results.bmiColor}`,
                                        }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#777' }}>
                                        <span>15</span>
                                        <span>18.5</span>
                                        <span>25</span>
                                        <span>30</span>
                                        <span>40</span>
                                    </div>
                                </div>
                            </div>

                            {/* BMR Result Card */}
                            <div style={{
                                background: 'rgba(0,0,0,0.3)',
                                padding: '25px',
                                borderRadius: '15px',
                                borderTop: '4px solid #00f2ff',
                                marginBottom: '20px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ color: '#aaa', margin: '0 0 5px 0', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                            Basal Metabolic Rate
                                        </h4>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00f2ff' }}>
                                            {results.bmr}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#777' }}>calories/day</div>
                                    </div>
                                    <div style={{ fontSize: '3rem' }}>🔥</div>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '15px', marginBottom: '0' }}>
                                    Calories your body burns at rest
                                </p>
                            </div>

                            {/* TDEE Result Card */}
                            <div style={{
                                background: 'rgba(0,0,0,0.3)',
                                padding: '25px',
                                borderRadius: '15px',
                                borderTop: '4px solid #ff9100',
                                marginBottom: '20px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ color: '#aaa', margin: '0 0 5px 0', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                            Total Daily Energy Expenditure
                                        </h4>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ff9100' }}>
                                            {results.tdee}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#777' }}>calories/day</div>
                                    </div>
                                    <div style={{ fontSize: '3rem' }}>⚡</div>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '15px', marginBottom: '0' }}>
                                    Total calories needed based on your activity level
                                </p>
                            </div>

                            {/* Recommendations */}
                            <div style={{
                                background: 'rgba(0, 242, 255, 0.1)',
                                padding: '20px',
                                borderRadius: '10px',
                                borderLeft: '4px solid #00f2ff'
                            }}>
                                <h4 style={{ color: '#00f2ff', marginTop: 0, fontSize: '1rem' }}>💡 Recommendations</h4>
                                <ul style={{ color: '#ccc', margin: 0, paddingLeft: '20px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                    {results.bmiCategory === 'Normal Weight' && (
                                        <>
                                            <li>Maintain current weight with balanced diet</li>
                                            <li>Aim for {results.tdee} calories daily</li>
                                            <li>Continue regular exercise routine</li>
                                        </>
                                    )}
                                    {results.bmiCategory === 'Underweight' && (
                                        <>
                                            <li>Consider increasing calorie intake by 300-500</li>
                                            <li>Focus on nutrient-dense foods</li>
                                            <li>Strength training to build muscle mass</li>
                                        </>
                                    )}
                                    {results.bmiCategory === 'Overweight' && (
                                        <>
                                            <li>Create a 500 calorie deficit ({results.tdee - 500} calories/day)</li>
                                            <li>Increase physical activity gradually</li>
                                            <li>Focus on whole foods and portion control</li>
                                        </>
                                    )}
                                    {results.bmiCategory === 'Obese' && (
                                        <>
                                            <li>Consult healthcare professional for personalized plan</li>
                                            <li>Start with 500-750 calorie deficit</li>
                                            <li>Begin with low-impact exercises</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </>
                    )}

                    {/* Empty State */}
                    {!results.bmi && (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            color: '#777'
                        }}>
                            <div style={{ fontSize: '5rem', marginBottom: '20px', opacity: 0.3 }}>📊</div>
                            <h3 style={{ color: '#999' }}>Enter your details</h3>
                            <p style={{ color: '#666' }}>Fill in the form to see your BMI, BMR, and TDEE calculations</p>
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
                    <strong style={{ color: '#00f2ff' }}>BMI</strong> (Body Mass Index) is a measure of body fat based on height and weight.
                </p>
                <p style={{ margin: '0 0 10px 0' }}>
                    <strong style={{ color: '#00f2ff' }}>BMR</strong> (Basal Metabolic Rate) is the number of calories your body needs at rest.
                </p>
                <p style={{ margin: '0' }}>
                    <strong style={{ color: '#00f2ff' }}>TDEE</strong> (Total Daily Energy Expenditure) includes your activity level.
                </p>
            </div>
        </div>
    );
};

export default BmiBmr;