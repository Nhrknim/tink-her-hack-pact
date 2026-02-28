import React from 'react';
import { auth, db } from './firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

export default function AdminMatch() {

  const triggerMatch = async () => {
    try {
      // 1. Fetch everyone from the waiting room
      const waitingRoomRef = collection(db, "waitingRoom");
      const snapshot = await getDocs(waitingRoomRef);

      if (snapshot.empty) {
        alert("The Waiting Room is empty. No users to match!");
        return;
      }

      let usersPool = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      // 2. Group them by their Domain (nourish, movement, etc.)
      const groups = usersPool.reduce((acc, user) => {
        if (!acc[user.habitCategory]) acc[user.habitCategory] = [];
        acc[user.habitCategory].push(user);
        return acc;
      }, {});

      const batch = writeBatch(db);

      // 3. The Matching Logic (Pairs and Trios)
      for (const category in groups) {
        let categoryUsers = groups[category];
        categoryUsers.sort(() => Math.random() - 0.5); // Shuffle

        while (categoryUsers.length > 0) {
          let currentGroup = [];

          if (categoryUsers.length === 3) {
            currentGroup = [categoryUsers.pop(), categoryUsers.pop(), categoryUsers.pop()];
          } else if (categoryUsers.length >= 2) {
            currentGroup = [categoryUsers.pop(), categoryUsers.pop()];
          } else {
            currentGroup = [categoryUsers.pop()];
          }

          const newPactRef = doc(collection(db, "pacts"));

          batch.set(newPactRef, {
            pactId: newPactRef.id,
            category: category,
            members: currentGroup.map(u => ({ 
              uid: u.id, 
              username: u.username, 
              goal: u.specificGoal, 
              avatar: u.avatar 
            })),
            createdAt: Date.now(),
            isActive: true
          });

          currentGroup.forEach(user => {
            const userRef = doc(db, "users", user.id);
            batch.update(userRef, { currentPactId: newPactRef.id });
            const waitingRef = doc(db, "waitingRoom", user.id);
            batch.delete(waitingRef);
          });
        }
      }

      await batch.commit();
      alert("🚀 SYNC SUCCESSFUL: All users have been paired into Chat Rooms!");

    } catch (error) {
      console.error("Error matching:", error);
      alert("Matching failed. Check console.");
    }
  };

  // UI FOR THE ACTUAL ADMIN PAGE
  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#0f172a', 
      color: 'white',
      fontFamily: 'system-ui, sans-serif',
      textAlign: 'center'
    }}>
      <div style={{ 
        padding: '40px', 
        backgroundColor: '#1e293b', 
        borderRadius: '20px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        border: '1px solid #334155'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⚡</div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 10px 0' }}>Admin Control</h1>
        <p style={{ color: '#94a3b8', marginBottom: '30px' }}>
          Authenticated as: <span style={{ color: '#38bdf8' }}>{auth.currentUser?.email}</span>
        </p>

        {/* THE BIG RED BUTTON */}
        <button
          onClick={triggerMatch}
          style={{ 
            padding: '18px 40px', 
            backgroundColor: '#ef4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px', 
            cursor: 'pointer', 
            fontSize: '1.2rem',
            fontWeight: 'bold',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          RUN SYNC ALGORITHM
        </button>

        <div style={{ marginTop: '30px' }}>
          <button 
            onClick={() => auth.signOut()}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#64748b', 
              textDecoration: 'underline', 
              cursor: 'pointer',
              fontSize: '0.9rem' 
            }}
          >
            Sign Out Admin
          </button>
        </div>
      </div>
    </div>
  );
}