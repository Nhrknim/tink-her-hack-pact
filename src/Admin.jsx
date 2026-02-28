import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Admin({ onBack }) {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', color: 'white' }}>

      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #ef4444' }}>
        <div>
          <h2 style={{ margin: 0, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px' }}>
            ⚙️ Admin Console
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>Logged in as Superuser</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onBack} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Open User App →
          </button>
          <button onClick={() => auth.signOut()} style={{ background: 'transparent', color: 'white', border: '1px solid #334155', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Users Database View */}
      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
        <h3 style={{ marginTop: 0, color: '#94a3b8' }}>Registered Database Users ({allUsers.length})</h3>

        {loading ? <p>Fetching live database...</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {allUsers.map((u) => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img src={u.avatar || "https://via.placeholder.com/40"} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{u.username}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{u.email}</div>
                  </div>
                </div>
                <div style={{ background: '#f59e0b', color: '#0f172a', padding: '5px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px' }}>
                  🔥 {u.streak} Streak
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}