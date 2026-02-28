<p align="center">
  <img src="./img.png" alt="Project Banner" width="100%">
</p>

#PACT🎯

## Basic Details

### Team Name: adich keri vaa

### Team Members
- Member 1: Navya M J - College of Engineering, Trivandrum
- Member 2: Niharika S - College of Engineering, Trivandrum

### Hosted Project Link
https://tink-her-hack-pact-git-main-nhrknims-projects.vercel.app/

### Project Description
PACT is a social accountability platform designed to help people stick to their daily habits. Users choose a goal, enter a "Waiting Room" and are automatically paired with 1-2 strangers with similar objectives to form a 24-hour "Pact" supported by real-time chat.

### The Problem statement
Most people fail their habits not because of a lack of intent, but a lack of immediate accountability. Solo habit tracking feels lonely and easy to skip, while traditional social media is too broad for specific, short-term goal alignment.

### The Solution
We solve this by creating "Micro-Communities." By matching users in pairs or trios for a specific 24-hour window, we create a high-stakes, high-support environment. The "all-or-nothing" nature of the pact encourages users to finish their goals so the entire group can succeed together.

---

## Technical Details

### Technologies/Components Used

**For Software:**
- Languages used: JavaScript (ES6+), HTML5, CSS3
- Frameworks used:React.js (Vite)
- Database/Backend: Firebase Firestore (NoSQL)
- Authentication: Firebase Auth
- Libraries used: firebase
- Tools used:VS Code, Git, Firebase Console

## Features
Real-time Chat: Instant messaging using Firestore snapshots to coordinate with pact partners.

Smart Pairing Logic: An automated "Sync" system that handles odd numbers by creating "Trios" instead of leaving users alone.

Accountability Header: A persistent top bar in chat showing the specific goals of every member in the group.

Completion Celebration: Interactive confetti triggers once all members of a Pact mark their task as "Done."

---

## Implementation

### For Software:

#### Installation

```
# Clone the repository
git clone https://github.com/Nhrknim/tink-her-hack-pact.git
cd pact-app

# This command automatically installs Vite, Firebase, Tailwind, 
# and all other necessary libraries listed in package.json

npm install
```
#### Run
```
# Start the Vite development server
npm run dev
```
## Project Documentation

### For Software:

#### Screenshots (Add at least 3)


<img width="1719" height="905" alt="image" src="https://github.com/user-attachments/assets/6296426d-380e-4513-b5ed-bd6a3eb4df8b" />
*Login page*

<img width="1718" height="908" alt="image" src="https://github.com/user-attachments/assets/0e48928a-cb03-496b-b29d-d2eb19a26882" />
*Home page displaying streak,countdown till next matching, sample goals*

<img width="1727" height="908" alt="image" src="https://github.com/user-attachments/assets/a02abda7-b604-4fad-88aa-0a1db4f2fb0d" />
*Users added to a pool according to their interests, waiting to be matched.*

<img width="1720" height="907" alt="image" src="https://github.com/user-attachments/assets/c41ca688-a3ae-4d71-9650-3eeb365d1a1c" /> 
*Match found.Users can enter the chat*

<img width="1710" height="909" alt="image" src="https://github.com/user-attachments/assets/8abb249f-584a-41ce-9b79-b153749a6bd8" />
*Chat interface*

<img width="1718" height="912" alt="image" src="https://github.com/user-attachments/assets/db2bf806-1bbb-472e-9b07-ca9e42dd8f7d" />
*Goals met and pact completed. Users can return to home screen after this*


#### Diagrams

**System Architecture:**

![Architecture Diagram](docs/architecture.png)
*Explain your system architecture - components, data flow, tech stack interaction*

**Application Workflow:**

![Workflow](docs/workflow.png)
*Add caption explaining your workflow*

---


#### Build Photos

![Team](Add photo of your team here)

![Components](Add photo of your components here)
*List out all components shown*

![Build](Add photos of build process here)
*Explain the build steps*

![Final](Add photo of final product here)
*Explain the final build*

---


## Project Demo

### Video
[Add your demo video link here - YouTube, Google Drive, etc.]

*Explain what the video demonstrates - key features, user flow, technical highlights*

---

## AI Tools Used 

**Tool Used:** Google Gemini

**Purpose:** 
- UI components creation
- Debugging assistance for async functions
- Code review and optimization suggestions


**Human Contributions:**
- Architecture design and planning
- Custom business logic implementation
- Integration and testing


---

## Team Contributions

- Navya : Backend development,frontend development
- Niharika: Frontend development, Integration,testing
  

---

Made with ❤️ at TinkerHub
