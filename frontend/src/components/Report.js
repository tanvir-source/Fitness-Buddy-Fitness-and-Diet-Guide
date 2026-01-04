import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Report = ({ user }) => {
    const [period, setPeriod] = useState('Weekly');
    const [generating, setGenerating] = useState(false);
    const [stats, setStats] = useState({
        foodLogs: [],
        activities: [],
        weights: []
    });

    const getStartDate = () => {
        const date = new Date();
        if (period === 'Weekly') date.setDate(date.getDate() - 7);
        if (period === 'Monthly') date.setMonth(date.getMonth() - 1);
        if (period === 'All Time') date.setFullYear(date.getFullYear() - 10);
        return date.toISOString().split('T')[0];
    };

    const fetchData = async () => {
        if (!user?.email) return;
        const startDateStr = getStartDate();
        
        try {
            const [foodRes, actRes, weightRes] = await Promise.all([
                fetch(`http://localhost:5000/api/food?email=${user.email}`).catch(() => ({ ok: false })),
                fetch(`http://localhost:5000/api/activity?email=${user.email}`).catch(() => ({ ok: false })),
                fetch(`http://localhost:5000/api/weight?email=${user.email}`).catch(() => ({ ok: false }))
            ]);

            const foodData = foodRes.ok ? await foodRes.json() : [];
            const actData = actRes.ok ? await actRes.json() : [];
            const weightData = weightRes.ok ? await weightRes.json() : [];

            const startDate = new Date(startDateStr);
            
            const filteredFood = Array.isArray(foodData) ? foodData.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= startDate;
            }) : [];

            const filteredAct = Array.isArray(actData) ? actData.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= startDate;
            }) : [];

            const filteredWeight = Array.isArray(weightData) ? weightData.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= startDate;
            }) : [];

            setStats({
                foodLogs: filteredFood,
                activities: filteredAct,
                weights: filteredWeight
            });
        } catch (err) { 
            console.error('Fetch error:', err);
            setStats({ foodLogs: [], activities: [], weights: [] });
        }
    };

    useEffect(() => { 
        fetchData(); 
    }, [user, period]);

    const generatePDF = () => {
        setGenerating(true);
        
        try {
            // ✅ CORRECT FOR jsPDF v3.x
            const doc = new jsPDF();

            // Header
            doc.setFillColor(0, 242, 255); 
            doc.rect(0, 0, 210, 20, 'F');
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(22);
            doc.text("FITNESS BUDDY REPORT", 105, 13, null, null, 'center');

            // User Details
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.text(`User: ${user.name || user.email}`, 14, 30);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);
            doc.text(`Period: ${period}`, 14, 42);

            // Calculate Stats
            const totalCals = stats.foodLogs.reduce((acc, i) => acc + (Number(i.calories) || 0), 0);
            const totalProtein = stats.foodLogs.reduce((acc, i) => acc + (Number(i.protein) || 0), 0);
            const totalCarbs = stats.foodLogs.reduce((acc, i) => acc + (Number(i.carbs) || 0), 0);
            const totalFat = stats.foodLogs.reduce((acc, i) => acc + (Number(i.fat) || 0), 0);
            const totalBurn = stats.activities.reduce((acc, i) => acc + (Number(i.calories) || 0), 0);
            const totalWorkoutTime = stats.activities.reduce((acc, i) => acc + (Number(i.duration) || 0), 0);
            
            const latestWeight = stats.weights.length > 0 ? stats.weights[stats.weights.length - 1].weight : 'N/A';
            const startWeight = stats.weights.length > 0 ? stats.weights[0].weight : 'N/A';
            const weightChange = (latestWeight !== 'N/A' && startWeight !== 'N/A') 
                ? (latestWeight - startWeight).toFixed(1) 
                : 'N/A';

            // ✅ CORRECT SYNTAX FOR autoTable v5.x
            autoTable(doc, {
                startY: 50,
                head: [['Metric', 'Value']],
                body: [
                    ['Total Calories Consumed', `${totalCals} kcal`],
                    ['Total Protein', `${totalProtein.toFixed(0)} g`],
                    ['Total Carbs', `${totalCarbs.toFixed(0)} g`],
                    ['Total Fat', `${totalFat.toFixed(0)} g`],
                    ['Total Calories Burned', `${totalBurn} kcal`],
                    ['Total Workout Time', `${totalWorkoutTime} mins`],
                    ['Workouts Logged', `${stats.activities.length}`],
                    ['Meals Logged', `${stats.foodLogs.length}`],
                    ['Start Weight', `${startWeight} kg`],
                    ['Current Weight', `${latestWeight} kg`],
                    ['Weight Change', `${weightChange} kg`],
                ],
                theme: 'grid',
                headStyles: { fillColor: [0, 242, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            });

            // Food Logs
            if (stats.foodLogs.length > 0) {
                doc.addPage();
                doc.setFillColor(255, 165, 2);
                doc.rect(0, 0, 210, 15, 'F');
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(16);
                doc.text("FOOD LOGS", 105, 10, null, null, 'center');

                const foodData = stats.foodLogs.slice(0, 20).map(item => [
                    item.foodName || 'Unknown',
                    new Date(item.date).toLocaleDateString(),
                    item.mealType || 'Snack',
                    `${item.calories || 0}`,
                    `${item.protein || 0}g`,
                    `${item.carbs || 0}g`,
                    `${item.fat || 0}g`
                ]);

                autoTable(doc, {
                    startY: 20,
                    head: [['Food', 'Date', 'Meal', 'Cals', 'Prot', 'Carbs', 'Fat']],
                    body: foodData,
                    theme: 'striped',
                    headStyles: { fillColor: [255, 165, 2], textColor: [0, 0, 0] },
                    styles: { fontSize: 9 }
                });
            }

            // Workouts
            if (stats.activities.length > 0) {
                doc.addPage();
                doc.setFillColor(255, 68, 68);
                doc.rect(0, 0, 210, 15, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(16);
                doc.text("WORKOUT LOGS", 105, 10, null, null, 'center');

                const actData = stats.activities.slice(0, 20).map(item => [
                    item.type || 'Unknown',
                    new Date(item.date).toLocaleDateString(),
                    `${item.duration || 0} mins`,
                    `${item.calories || 0} kcal`
                ]);

                autoTable(doc, {
                    startY: 20,
                    head: [['Activity', 'Date', 'Duration', 'Calories']],
                    body: actData,
                    theme: 'striped',
                    headStyles: { fillColor: [255, 68, 68], textColor: [255, 255, 255] },
                    styles: { fontSize: 10 }
                });
            }

            // Weight Progress
            if (stats.weights.length > 1) {
                doc.addPage();
                doc.setFillColor(165, 94, 234);
                doc.rect(0, 0, 210, 15, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(16);
                doc.text("WEIGHT PROGRESS", 105, 10, null, null, 'center');

                const weightData = stats.weights.map(item => [
                    new Date(item.date).toLocaleDateString(),
                    `${item.weight} kg`,
                    item.waist ? `${item.waist} cm` : 'N/A',
                    item.chest ? `${item.chest} cm` : 'N/A'
                ]);

                autoTable(doc, {
                    startY: 20,
                    head: [['Date', 'Weight', 'Waist', 'Chest']],
                    body: weightData,
                    theme: 'grid',
                    headStyles: { fillColor: [165, 94, 234], textColor: [255, 255, 255] }
                });
            }

            // Save PDF
            const fileName = `FitnessBuddy_${period}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            alert(`✅ PDF Downloaded Successfully!\n\nFile: ${fileName}`);
            
        } catch (err) {
            console.error("PDF Generation Error:", err);
            alert(`❌ Error: ${err.message}\n\nCheck browser console (F12) for details.`);
        } finally {
            setGenerating(false);
        }
    };

    const displayTotalCals = stats.foodLogs.reduce((a, b) => a + (Number(b.calories) || 0), 0);
    const displayWorkouts = stats.activities.length;
    const displayMeals = stats.foodLogs.length;

    return (
        <div className="glass-panel fade-in">
            <h2 style={{ color: '#00f2ff', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'Apple Color Emoji, "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", sans-serif' }}>📝</span>{' '}Auto-Report Generator
            </h2>
            <p style={{ color: '#ccc', marginBottom: '30px' }}>
                Generate a comprehensive PDF report of your fitness journey
            </p>

            <div style={{ marginBottom: '30px' }}>
                <label style={{ color: '#aaa', display: 'block', marginBottom: '10px', fontSize: '0.9rem' }}>
                    Select Time Period
                </label>
                <select 
                    value={period} 
                    onChange={e => setPeriod(e.target.value)}
                    style={{ 
                        width: '100%', 
                        padding: '15px', 
                        borderRadius: '10px', 
                        border: 'none', 
                        background: 'rgba(255,255,255,0.1)', 
                        color: 'white', 
                        fontSize: '1.1rem',
                        cursor: 'pointer'
                    }}
                >
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>All Time</option>
                </select>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '15px', 
                marginBottom: '30px' 
            }}>
                <StatPreview title="Total Calories" value={displayTotalCals} color="#00f2ff" />
                <StatPreview title="Workouts" value={displayWorkouts} color="#ff4444" />
                <StatPreview title="Meals Logged" value={displayMeals} color="#ffa502" />
                <StatPreview title="Weight Entries" value={stats.weights.length} color="#a55eea" />
            </div>

            <button 
                onClick={generatePDF} 
                disabled={generating}
                className="primary-btn" 
                style={{ 
                    width: '100%', 
                    padding: '18px',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px', 
                    fontSize: '1.2rem', 
                    opacity: generating ? 0.7 : 1,
                    cursor: generating ? 'not-allowed' : 'pointer',
                    background: generating 
                        ? 'linear-gradient(45deg, #555, #777)' 
                        : 'linear-gradient(45deg, #00f2ff, #00aaff)'
                }}
            >
                <span style={{ fontFamily: 'Apple Color Emoji, "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", sans-serif' }}>{generating ? '⏳ Generating...' : '📝 Download PDF Report'}</span>
            </button>

            {(displayTotalCals === 0 && displayWorkouts === 0) && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    background: 'rgba(255,165,2,0.1)', 
                    borderRadius: '8px',
                    borderLeft: '4px solid #ffa502',
                    color: '#ffa502'
                }}>
                    ℹ️ No data for this period. Log meals and workouts first!
                </div>
            )}
        </div>
    );
};

const StatPreview = ({ title, value, color = '#00f2ff' }) => (
    <div style={{ 
        background: 'rgba(255,255,255,0.05)', 
        padding: '20px', 
        borderRadius: '10px', 
        textAlign: 'center', 
        borderTop: `3px solid ${color}` 
    }}>
        <div style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '5px' }}>
            {title.toUpperCase()}
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: color }}>
            {value}
        </div>
    </div>
);

export default Report;