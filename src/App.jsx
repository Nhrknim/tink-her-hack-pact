import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Login from './Login';
import Home from './Home';
import Chat from './Chat';
import Admin from './Admin';

// 🔴 SET YOUR EXACT GOOGLE EMAIL HERE 🔴
const ADMIN_EMAIL = "nihar@example.com";

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentView, setCurrentView] = useState('');
  const [activeChatId, setActiveChatId] = useState(null);

  // 1. NAVIGATION HELPER (Enables the Back Button)
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
        // Fallback if history is lost: Route by email again
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

        // 🌟 THE MAGIC ROUTING RULE 🌟
        // If it's the Admin, go to 'admin'. Otherwise, go to 'home'.
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
  if (currentView === 'admin') {
    return <Admin onBack={() => navigateTo('home')} />;
  }

  if (currentView === 'chat' && activeChatId) {
    return <Chat user={user} roomId={activeChatId} onLeave={() => navigateTo('home')} />;
  }

  return (
    <Home
      userProfile={profile}
      onEnterChat={(roomId) => navigateTo('chat', roomId)}
      onOpenAdmin={() => navigateTo('admin')}
      isAdmin={user.email === ADMIN_EMAIL} // Tells Home if we should show the Admin button
    />
  );
}

export default App;