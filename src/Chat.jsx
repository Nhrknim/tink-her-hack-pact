import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

export default function Chat({ user, roomId, onLeave }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  // 1. Listen for new messages in real-time
  useEffect(() => {
    const q = query(collection(db, `chats/${roomId}/messages`), orderBy("createdAt", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    });

    return () => unsubscribe(); // Cleanup when leaving the room
  }, [roomId]);

  // Auto-scroll to bottom when a new message arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 2. Send a message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await addDoc(collection(db, `chats/${roomId}/messages`), {
      text: newMessage,
      uid: user.uid,
      username: user.displayName?.split(' ')[0] || "Member",
      avatar: user.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback",
      createdAt: serverTimestamp()
    });

    setNewMessage(""); // Clear input box
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '600px', margin: '0 auto', background: '#0f172a' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: '#1e293b', borderBottom: '1px solid #334155' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: 'white' }}>Pact Room</h2>
          <span style={{ fontSize: '12px', color: '#22c55e' }}>● Live</span>
        </div>
        <button onClick={onLeave} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
          Leave Pact
        </button>
      </div>

      {/* Chat Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {messages.map((msg) => {
          const isMe = msg.uid === user.uid;
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '10px' }}>
              <img src={msg.avatar} alt="avatar" style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#334155' }} />
              <div style={{ 
                background: isMe ? '#2563eb' : '#1e293b', 
                color: 'white', padding: '12px 16px', 
                borderRadius: '16px', 
                borderBottomRightRadius: isMe ? '4px' : '16px',
                borderBottomLeftRadius: !isMe ? '4px' : '16px',
                maxWidth: '70%'
              }}>
                {!isMe && <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>{msg.username}</div>}
                <div style={{ fontSize: '15px', lineHeight: '1.4' }}>{msg.text}</div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef}></div> {/* Invisible div to scroll to */}
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} style={{ padding: '20px', background: '#1e293b', borderTop: '1px solid #334155', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your progress..." 
          style={{ flex: 1, padding: '15px', borderRadius: '12px', border: 'none', background: '#0f172a', color: 'white', outline: 'none' }}
        />
        <button type="submit" style={{ padding: '0 25px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
          Send
        </button>
      </form>

    </div>
  );
}