import React from 'react';
import { auth, db, googleProvider } from './firebase';
// 1. We changed this to inMemoryPersistence
import { signInWithPopup, setPersistence, inMemoryPersistence } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function Login() {

  const handleGoogleLogin = async () => {
    try {
      // 2. This tells Firebase to wipe the login the moment you refresh
      await setPersistence(auth, inMemoryPersistence);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          username: user.displayName.split(' ')[0],
          avatar: user.photoURL,
          streak: 0,
          currentPactId: null
        });
      }
    } catch (error) {
      alert("Google Login Failed: " + error.message);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: '#0f172a', color: 'white'
    }}>
      <div style={{
        background: '#1e293b', padding: '3rem', borderRadius: '2rem',
        border: '1px solid #334155', textAlign: 'center', maxWidth: '400px', width: '100%'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: '0' }}>
          PACT<span style={{ color: '#3b82f6' }}>.</span>
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem', marginBottom: '2rem' }}>
          24 Hours. One Goal.
        </p>

        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%', padding: '1rem', borderRadius: '1rem', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            background: '#f8fafc', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer',
            fontSize: '1.1rem'
          }}
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '20px' }} />
          Continue with Google
        </button>
      </div>
    </div>
  );
}