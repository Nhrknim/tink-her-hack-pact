import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from './firebase';
import { doc, onSnapshot, getDoc, collection, query, orderBy, addDoc, serverTimestamp, updateDoc, increment, arrayUnion, deleteDoc } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import './Chat.css';

export default function Chat({ pactId, onLeaveChat }) {
  const [pactData, setPactData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!pactId) return;
    const unsub = onSnapshot(doc(db, "pacts", pactId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPactData(data);
        if (data.finishedUsers?.length === data.members?.length) {
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
      } else { onLeaveChat(); }
    });
    return () => unsub();
  }, [pactId]);

  useEffect(() => {
    if (!pactId) return;
    const q = query(collection(db, `pacts/${pactId}/messages`), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsub();
  }, [pactId]);

  const handleSendMessage = async (e, customText = null) => {
    if (e) e.preventDefault();
    const textToSend = customText || newMessage;
    if (!textToSend.trim()) return;

    await addDoc(collection(db, `pacts/${pactId}/messages`), {
      text: textToSend,
      senderId: currentUser.uid,
      senderName: currentUser.email.split('@')[0],
      timestamp: serverTimestamp()
    });
    setNewMessage("");
  };

  const markFinished = async () => {
    await updateDoc(doc(db, "pacts", pactId), {
      finishedUsers: arrayUnion(currentUser.uid)
    });
    handleSendMessage(null, " I have officially finished my goal for today!");
  };

  const endChallenge = async () => {
    try {
      // 1. Check if we have member data
      if (!pactData || !pactData.members) return;

      // 2. Loop through all members to update their streaks and reset status
      // We use a Promise.all to make sure all updates finish before we delete the pact
      await Promise.all(pactData.members.map(async (member) => {
        const userRef = doc(db, "users", member.uid);
        return updateDoc(userRef, {
          currentPactId: null,      // This triggers the redirect to Home
          streak: increment(1)      // This safely adds 1 to the streak
        });
      }));

      // 3. Delete the pact document from the database
      await deleteDoc(doc(db, "pacts", pactId));

      // 4. Move the user back to the Home view
      onLeaveChat();

      console.log("Streak updated and Pact closed!");
    } catch (error) {
      console.error("Error ending challenge:", error);
      alert("Error: " + error.message);
    }
  };

  if (!pactData) return <div className="chat-page-wrapper" style={{ justifyContent: 'center', alignItems: 'center' }}>Syncing Workspace...</div>;

  return (
    <div className="chat-page-wrapper">

      {/* SIDEBAR */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Pact Workspace</h2>
          <div className="sidebar-category">{pactData.category} Group</div>
        </div>

        <div className="sidebar-content">
          <p className="action-label">TEAM MEMBERS</p>
          {pactData.members.map((m, idx) => (
            <div key={idx} className="member-card" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <img src={m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.username}`} style={{ width: '32px', height: '32px', borderRadius: '6px' }} alt="" />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: '700', margin: 0 }}>{m.username}</p>
                <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>{m.goal}</p>
              </div>
              {pactData.finishedUsers?.includes(m.uid) && <span style={{ color: '#10b981' }}>✓</span>}
            </div>
          ))}

          <div className="action-section">
            <p className="action-label">QUICK ACTIONS</p>
            <button className="action-button" onClick={() => handleSendMessage(null, " I'm making progress on my goal right now!")}> Share Progress</button>
            <button className="action-button" onClick={() => handleSendMessage(null, " Hey team, a friendly reminder to stay on track!")}> Send Reminder</button>
          </div>
        </div>

        <button onClick={onLeaveChat} style={{ padding: '20px', background: '#0b0e14', border: 'none', color: '#64748b', cursor: 'pointer', borderTop: '1px solid #1e293b' }}>← Exit Session</button>
      </aside>

      {/* CHAT WINDOW */}
      <div className="chat-window">
        {/* NAV AT TOP */}
        <nav className="chat-nav">
          <h1 style={{ fontSize: '1rem', fontWeight: '800' }}># {pactData.category}-discussion</h1>
          {!pactData.finishedUsers?.includes(currentUser.uid) && (
            <button onClick={markFinished} style={{ padding: '8px 16px', background: '#10b981', color: 'white', borderRadius: '6px', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem' }}>COMPLETE GOAL</button>
          )}
        </nav>

        {/* MESSAGES IN MIDDLE */}
        <div className="message-container">
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser.uid;
            return (
              <div key={msg.id} className={`msg-row ${isMe ? 'is-me' : ''}`}>
                {!isMe && <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderName}`} style={{ width: '36px', height: '36px', borderRadius: '8px' }} alt="" />}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {!isMe && <span className="sender-name-label" style={{ fontSize: '12px', color: '#818cf8', fontWeight: 'bold' }}>{msg.senderName}</span>}
                  <div className="msg-bubble">
                    <p style={{ margin: 0 }}>{msg.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* BIG TEXTAREA AT THE BOTTOM */}
        <footer className="chat-input-area">
          {pactData.finishedUsers?.length === pactData.members?.length ? (
            <div style={{ background: '#4f46e5', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ fontWeight: '800', color: 'white', margin: 0 }}> ALL GOALS MET. PACT COMPLETE.</p>
              <button onClick={endChallenge} style={{ marginTop: '10px', padding: '8px 20px', borderRadius: '6px', border: 'none', fontWeight: '800', cursor: 'pointer', background: '#fff', color: '#4f46e5' }}>CLOSE CHAT</button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="input-box-container">
              <textarea
                className="chat-text-input"
                placeholder={`Type a message to the group...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <div className="input-footer-actions">
                <button type="submit" className="send-btn-small">SEND MESSAGE</button>
              </div>
            </form>
          )}
        </footer>
      </div>
    </div>
  );
}