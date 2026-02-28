import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Login from './Login';
import Home from './Home';
import Chat from './Chat';
import AdminMatch from './AdminMatch'; // Changed from Admin to AdminMatch

// 🔴 MUST MATCH THE EMAIL IN ADMINMATCH.JSX 🔴
const ADMIN_EMAIL = "navyamj111@gmail.com";

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentView, setCurrentView] = useState('');
  const [activeChatId, setActiveChatId] = useState(null);

  // 1. NAVIGATION HELPER
  const navigateTo = (view, chatId = null) => {
    setCurrentView(view);
    setActiveChatId(chatId);
    window.history.pushState({ view, chatId }, "");
  };

  // 2. BACK BUTTON LISTENER
  useEffect(() => {
    const handleBackButton = (event) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
        setActiveChatId(event.state.chatId);
      } else if (user) {
        setCurrentView(user.email === ADMIN_EMAIL ? 'admin' : 'home');
        setActiveChatId(null);
      }
    };
    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [user]);

  // 3. AUTHENTICATION & AUTO-ROUTING
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) setProfile(userDoc.data());
          else setProfile({ username: currentUser.displayName?.split(' ')[0] || "Member", streak: 0, email: currentUser.email });
        } catch (err) {
          setProfile({ username: "Guest", streak: 0, email: currentUser.email });
        }

        // 🌟 ROUTING LOGIC 🌟
        const initialView = currentUser.email === ADMIN_EMAIL ? 'admin' : 'home';
        setCurrentView(initialView);
        window.history.replaceState({ view: initialView, chatId: null }, "");

      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Syncing App...</div>;
  if (!user) return <Login />;

  // 4. VIEW RENDERER

  // A. If view is 'admin', show the matching component
  // Note: We wrap it in a div so you can still have a "Back" button if you want
  if (currentView === 'admin') {
    return (
      <div className="admin-page-container">
        <AdminMatch />
        {/* Optional: Add a logout or back button here since AdminMatch is just a button */}
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <h1 style={{ color: 'white' }}>Admin Control Center</h1>
          <p style={{ color: '#64748b' }}>The sync button is in the bottom right corner.</p>
          <button
            onClick={() => auth.signOut()}
            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }
  if (user && user.email === ADMIN_EMAIL) {
    return <AdminMatch />;
  }

  // B. If view is 'chat'
  if (currentView === 'chat' && activeChatId) {
    return <Chat user={user} pactId={activeChatId} onLeaveChat={() => navigateTo('home')} />;
  }


  // C. Default: Home
  return (
    <Home
      userProfile={profile}
      onEnterChat={(pactId) => navigateTo('chat', pactId)}
      onOpenAdmin={() => navigateTo('admin')}
      isAdmin={user.email === ADMIN_EMAIL}
    />
  );
}

export default App;