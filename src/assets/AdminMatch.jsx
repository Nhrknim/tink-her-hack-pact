import React from 'react';
import { db } from '../firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

export default function AdminMatch() {

  const triggerMatch = async () => {
    try {
      // 1. Fetch everyone from the waiting room
      const waitingRoomRef = collection(db, "waitingRoom");
      const snapshot = await getDocs(waitingRoomRef);

      if (snapshot.empty) {
        alert("Waiting room is empty!");
        return;
      }

      // Convert snapshot to a normal Javascript array
      let usersPool = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      // 2. Group them by their Domain (e.g., "nourish", "movement")
      const groups = usersPool.reduce((acc, user) => {
        if (!acc[user.habitCategory]) acc[user.habitCategory] = [];
        acc[user.habitCategory].push(user);
        return acc;
      }, {});

      // 3. Start a Firebase Batch (does all database updates at the exact same time)
      const batch = writeBatch(db);

      // 4. The Matching Math (Pairs and Trios)
      for (const category in groups) {
        let categoryUsers = groups[category];

        // Shuffle the users for randomness
        categoryUsers.sort(() => Math.random() - 0.5);

        while (categoryUsers.length > 0) {
          let currentGroup = [];

          if (categoryUsers.length === 3) {
            // TRIO: Exactly 3 left
            currentGroup = [categoryUsers.pop(), categoryUsers.pop(), categoryUsers.pop()];
          } else if (categoryUsers.length >= 2) {
            // PAIR: 2 or more left
            currentGroup = [categoryUsers.pop(), categoryUsers.pop()];
          } else {
            // SOLO: 1 person left (Edge case, but we must handle it)
            currentGroup = [categoryUsers.pop()];
          }

          // Create the new Pact Document
          const newPactRef = doc(collection(db, "pacts"));

          batch.set(newPactRef, {
            pactId: newPactRef.id,
            category: category,
            // Save the basic info of everyone in this chat
            members: currentGroup.map(u => ({ uid: u.id, username: u.username, goal: u.specificGoal, avatar: u.avatar })),
            createdAt: Date.now(),
            isActive: true
          });

          // Update each user's profile to trigger the "Match Found!" UI
          currentGroup.forEach(user => {
            const userRef = doc(db, "users", user.id);
            batch.update(userRef, { currentPactId: newPactRef.id });

            // Remove them from the waiting room
            const waitingRef = doc(db, "waitingRoom", user.id);
            batch.delete(waitingRef);
          });
        }
      }

      // 5. Commit all changes to the database at once!
      await batch.commit();
      alert("✅ Matching Complete! Check the other screens.");

    } catch (error) {
      console.error("Error matching:", error);
      alert("Matching failed check console.");
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '10px', right: '10px', zIndex: 999 }}>
      {/* A tiny, semi-transparent button you can click during the demo */}
      <button
        onClick={triggerMatch}
        style={{ padding: '5px 10px', background: 'rgba(255,0,0,0.2)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '10px' }}
      >
        Run Sync
      </button>
    </div>
  );
}