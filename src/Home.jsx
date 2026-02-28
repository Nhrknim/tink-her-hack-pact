import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

// Define the domains and their specific micro-goals
const DOMAINS = {
  movement: { title: "💪 Movement", goals: ["Hit the Gym", "10k Steps", "30m Stretch"] },
  focus: { title: "🧠 Focus", goals: ["Code for 1hr", "Read 10 Pages", "Deep Work"] },
  zen: { title: "🧘‍♀️ Zen", goals: ["10m Meditation", "Journaling", "No Screens 1hr"] },
  nourish: { title: "💧 Nourish", goals: ["Drink 1L Water", "Drink 2L Water", "No Sugar Today"] }
};

// ⚠️ DEMO SETTINGS: Change these to a time 2 minutes from now to test the "Zero" trigger!
const MATCH_HOUR = 14; // 20 = 8:00 PM
const MATCH_MINUTE = 15;

export default function Home({ userProfile, onEnterChat }) {
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [isCountdownZero, setIsCountdownZero] = useState(false);

  // UI Flow States: 'domain' -> 'goal' -> 'waiting' -> 'matched'
  const [step, setStep] = useState('domain');
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [pactId, setPactId] = useState(null);

  // 1. Countdown Timer Logic (Triggers "Zero" state)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      let target = new Date();
      target.setHours(MATCH_HOUR, MATCH_MINUTE, 0, 0);

      // If the target time has passed by more than 1 minute, reset for tomorrow
      if (now > target && (now - target) > 60000) {
        target.setDate(target.getDate() + 1);
      }

      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        setIsCountdownZero(true);
      } else {
        setIsCountdownZero(false);
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
        const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
        const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
        setTimeLeft(`${h}:${m}:${s}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Real-time Firebase Listener for Match
  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(db, 'users', auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // If the algorithm assigns a pactId, trigger the match screen!
        if (data.currentPactId) {
          setPactId(data.currentPactId);
          setStep('matched');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. Write to Waiting Room in Firebase
  const joinPool = async (domainKey, specificGoal) => {
    if (!auth.currentUser) return;

    // Save to Firebase immediately
    await setDoc(doc(db, "waitingRoom", auth.currentUser.uid), {
      uid: auth.currentUser.uid,
      username: userProfile?.username || "Anonymous",
      avatar: userProfile?.avatar || "",
      habitCategory: domainKey,
      specificGoal: specificGoal,
      joinedAt: Date.now()
    });

    // Move to waiting state
    setStep('waiting');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', width: '100%', color: 'white' }}>

      {/* Header & Streak (Preserved from your code) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px' }}>Hey, {userProfile?.username || 'Member'}</h2>
          <p style={{ margin: 0, color: '#f59e0b', fontWeight: 'bold' }}>🔥 {userProfile?.streak || 0} Day Streak</p>
        </div>
        <button
          onClick={() => auth.signOut()}
          style={{ width: 'auto', padding: '8px 16px', background: 'transparent', border: '1px solid #334155', color: 'white', borderRadius: '4px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>

      {/* Mini Calendar UI (Preserved from your code) */}
      <div className="card" style={{ padding: '20px', background: '#1e293b', borderRadius: '8px', marginBottom: '30px', border: '1px solid #334155' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase' }}>Your Week</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>{day}</span>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: i === 5 ? '#2563eb' : '#334155',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
              }}>
                {i + 23}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ALWAYS SHOW COUNTDOWN UNLESS MATCHED */}
      {step !== 'matched' && (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <p style={{ color: '#94a3b8', marginBottom: '5px' }}>Match window opens in:</p>
          <h2 style={{ margin: 0, fontSize: '32px', color: isCountdownZero ? '#22c55e' : '#60a5fa', fontFamily: 'monospace' }}>
            {timeLeft}
          </h2>
        </div>
      )}

      {/* UI STEP 1: Select Domain */}
      {step === 'domain' && (
        <>
          <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>Today's Focus</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {Object.entries(DOMAINS).map(([key, data]) => (
              <button
                key={key}
                onClick={() => { setSelectedDomain(key); setStep('goal'); }}
                style={{ background: '#1e293b', border: '1px solid #334155', color: 'white', textAlign: 'left', padding: '20px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}
              >
                {data.title}
              </button>
            ))}
          </div>
        </>
      )}

      {/* UI STEP 2: Select Specific Goal */}
      {step === 'goal' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '20px', margin: 0 }}>Specific Goal</h3>
            <button onClick={() => setStep('domain')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              ← Back
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {DOMAINS[selectedDomain].goals.map((goal, idx) => (
              <button
                key={idx}
                onClick={() => joinPool(selectedDomain, goal)}
                style={{ background: '#1e293b', border: '1px solid #334155', color: 'white', textAlign: 'left', padding: '20px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}
              >
                {goal}
              </button>
            ))}
          </div>
        </>
      )}

      {/* UI STEP 3: Waiting in the Pool */}
      {step === 'waiting' && !isCountdownZero && (
        <div style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', textAlign: 'center', border: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#60a5fa' }}>You're in the pool!</h3>
          <p style={{ color: '#94a3b8', margin: 0 }}>Goal saved to database. Hold tight until the countdown hits zero.</p>
        </div>
      )}

      {/* UI STEP 4: Countdown is Zero (Matching Process) */}
      {step === 'waiting' && isCountdownZero && (
        <div style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', textAlign: 'center', border: '1px solid #334155' }}>
          <h2 style={{ margin: 0 }}>Matching...</h2>
          <p style={{ color: '#94a3b8' }}>Finding your accountability partner...</p>
          <div style={{ marginTop: '20px', padding: '20px', borderRadius: '50%', background: '#2563eb', width: '50px', height: '50px', margin: '20px auto', animation: 'pulse 1.5s infinite' }}></div>
          <style>{`@keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); } }`}</style>
        </div>
      )}

      {/* UI STEP 5: Match Found (Firebase triggers this) */}
      {step === 'matched' && (
        <div className="card" style={{ padding: '30px', borderRadius: '12px', marginTop: '20px', textAlign: 'center', border: '2px solid #22c55e', background: '#1e293b' }}>
          <h2 style={{ margin: 0, color: '#22c55e' }}>Match Found!</h2>
          <p style={{ color: '#94a3b8' }}>Your partner is ready.</p>
          <button
            style={{ width: '100%', padding: '15px', background: '#22c55e', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '20px' }}
            onClick={() => onEnterChat(pactId)}
          >
            Enter Chat Room →
          </button>
        </div>
      )}

    </div>
  );
}