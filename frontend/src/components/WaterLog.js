import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const formatDate = (d = new Date()) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function WaterLog({ user, onUpdate }) {
  const [total, setTotal] = useState(0);
  const [displayedTotal, setDisplayedTotal] = useState(0);
  const [goal, setGoal] = useState(2000);
  const [streak, setStreak] = useState(0);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remindersOn, setRemindersOn] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const [completed, setCompleted] = useState(false);
  // Custom manual input (ml)
  const [customAmount, setCustomAmount] = useState('');
  const reminderRef = useRef(null);

  const today = formatDate();

  const fetchData = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const [totalRes, goalRes, streakRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/water/total/${today}?email=${user.email}`),
        fetch(`${API_BASE_URL}/api/water/goal?email=${user.email}`),
        fetch(`${API_BASE_URL}/api/water/streaks?email=${user.email}`)
      ]);

      const totalData = await totalRes.json();
      const goalData = await goalRes.json();
      const streakData = await streakRes.json();

      setTotal(totalData.total || 0);
      setGoal(goalData.recommended_ml || 2000);
      // mark completed if already at/above goal
      setCompleted((totalData.total || 0) >= (goalData.recommended_ml || 2000));
      setStreak(streakData.streak || 0);
      setRecent(streakData.recent || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.email, today]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Animate displayedTotal smoothly towards actual total
  useEffect(() => {
    let interval = null;
    interval = setInterval(() => {
      setDisplayedTotal(prev => {
        const diff = total - prev;
        if (Math.abs(diff) < 1) {
          clearInterval(interval);
          return total;
        }
        return prev + Math.max(1, Math.abs(diff) * 0.2) * Math.sign(diff);
      });
    }, 40);
    return () => clearInterval(interval);
  }, [total]);

  // Watch for goal completion and show a short celebration + notification once
  useEffect(() => {
    if (!completed && displayedTotal >= goal) {
      setCompleted(true);

      // Browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('Hydration goal achieved! 🎉', { body: `You've reached ${Math.round(displayedTotal)} ml today.` });
        } catch (err) { console.warn('Notification failed', err); }
      }

      // Auto-hide message after 6s
      const t = setTimeout(() => setCompleted(false), 6000);
      return () => clearTimeout(t);
    }
  }, [displayedTotal, goal, completed]);

  const addWater = async (amount) => {
    if (!user?.email) return alert('Please login to log water');
    try {
      // Optimistic UI: show immediate fill and a little drop animation
      setDisplayedTotal(prev => prev + amount);
      setShowDrop(true);
      setTimeout(() => setShowDrop(false), 800);

      await fetch(`${API_BASE_URL}/api/water`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, date: today, user_email: user.email })
      });
      await fetchData();
      if (onUpdate) onUpdate();
    } catch (err) { console.error(err); }
  };

  const enableReminders = async () => {
    if (!('Notification' in window)) return alert('Notifications not supported by this browser');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return alert('Permission denied for notifications');

    scheduleReminders();
    setRemindersOn(true);
  };

  const scheduleReminders = () => {
    // Clear previous
    if (reminderRef.current) clearInterval(reminderRef.current);

    // Simple schedule: remind every 2 hours while user is likely awake (9 hours -> 12 hours). Use 2h default.
    const hours = 2; // frequency
    const ms = hours * 60 * 60 * 1000;

    reminderRef.current = setInterval(async () => {
      new Notification('Hydration reminder', { body: `Drink some water — your daily goal is ${Math.round(goal)} ml` });
    }, ms);
  };

  const disableReminders = () => {
    if (reminderRef.current) clearInterval(reminderRef.current);
    reminderRef.current = null;
    setRemindersOn(false);
  };

  const percent = Math.min(100, Math.round((displayedTotal / goal) * 100));

  return (
    <div className="fade-in">
      <h2>💧 Water Log</h2>
      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        {/* Bottle */}
        <div style={{ width: '140px', height: '360px', border: '3px solid rgba(255,255,255,0.12)', borderRadius: '20px', position: 'relative', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${percent}%`, background: 'linear-gradient(180deg, #00f2ff, #00aaff)', transition: 'height 500ms ease' }} />
          {showDrop && <div className="water-drop" />}
          {completed && <div className="goal-complete">🎉 Goal achieved — Nice job!</div>}
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', color: '#fff', fontWeight: 'bold' }}>{percent}%</div>
          <div style={{ position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)', color: '#fff', fontSize: '0.9rem' }}>{Math.round(displayedTotal)} / {goal} ml</div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
            {[500, 1000, 1500, 2000].map(v => (
              <button key={v} className="primary-btn" onClick={() => addWater(v)}>{v >= 1000 ? `${v/1000}L` : `${v}ml`}</button>
            ))}

            {/* Manual ml input */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '10px' }}>
              <input
                type="number"
                min="1"
                step="1"
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
                placeholder="ml"
                style={{ padding: '8px', width: '120px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#fff' }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const val = Number(customAmount);
                    if (!val || val <= 0) return alert('Enter a valid ml amount');
                    addWater(val);
                    setCustomAmount('');
                  }
                }}
              />
              <button className="primary-btn" onClick={() => {
                const val = Number(customAmount);
                if (!val || val <= 0) return alert('Enter a valid ml amount');
                addWater(val);
                setCustomAmount('');
              }}>Add</button>
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Hydration Goal:</strong> {goal} ml
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Current Streak:</strong> {streak} days
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {remindersOn ? <button className="danger-btn" onClick={disableReminders}>Disable Reminders</button> : <button className="primary-btn" onClick={enableReminders}>Enable Reminders</button>}
            <button className="secondary-btn" onClick={fetchData} title="Refresh">🔄</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h4>Recent (14 days)</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {recent.map(r => (
                <div key={r.date} style={{ width: '120px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#ccc' }}>{r.date}</div>
                  <div style={{ fontWeight: 'bold' }}>{r.total} ml</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading && <p>Loading...</p>}
    </div>
  );
}