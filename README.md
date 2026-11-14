# ⚔️ Solo Leveling — Personal Growth System

A Solo Leveling-inspired personal development application designed to turn everyday goals into quests, track progress, and build consistent habits.

The project aims to combine gamification and AI-powered quest generation to make personal growth more engaging.

## ✨ Project Overview

Solo Leveling is a personal productivity and self-improvement app inspired by the progression system in the *Solo Leveling* universe.

Users can build a profile, work toward personal goals, complete daily quests, and track their development through an RPG-style progression experience.

## 🚀 Planned Features

- **User Authentication:** Secure sign-up and login using Firebase Authentication.
- **Player Profile:** Store personal details, goals, interests, and preferences.
- **Daily Quests:** Organize personal goals into manageable daily tasks.
- **AI Quest Master:** Generate personalized quests based on the user's profile and progress.
- **Progress Tracking:** Monitor completed quests and personal development.
- **Gamification:** Use XP, levels, and ranks to make progress more engaging.

> Feature status: This project is under active development. The list above includes planned functionality; only features that are implemented and tested should be marked as complete.

## 🛠️ Tech Stack

| Technology               | Purpose                              |
| ------------------------ | ------------------------------------ |
| React                    | Frontend user interface              |
| TypeScript               | Type-safe development                |
| Vite                     | Development server and build tooling |
| Firebase Authentication  | User authentication                  |
| Cloud Firestore          | Database                             |
| Firebase Cloud Functions | Backend logic                        |
| OpenAI API               | AI-powered quest generation          |

*Update this list if your actual implementation changes.*

## 📁 Project Structure

```text
solo_leveling/
├── web/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── functions/
│   └── ...
├── .gitignore
└── README.md
```

*The structure above is illustrative. Adjust it to match the actual folders in your repository.*

## ⚙️ Getting Started

### Prerequisites

- Node.js and npm
- Git
- A Firebase project
- OpenAI API access (if using AI quest generation)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/solo-leveling.git
cd solo-leveling
```

### 2. Install frontend dependencies

```bash
cd web
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `web/` directory and add the Firebase configuration variables required by your application.

Example:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Use the exact variable names expected by your Firebase configuration code.

**Security:** Never put your OpenAI API key or Firebase service-account credentials in frontend environment variables. Keep private backend secrets in Firebase Secret Manager.

### 4. Run the application

```bash
npm run dev
```

Open the local URL printed in your terminal, usually:

```text
http://localhost:5173
```

## 🔐 Security

- Do not commit `.env` files or private API keys.
- Keep AI API calls on the backend.
- Validate quest completion and XP updates on the server.
- Configure Firestore security rules to protect user data.

## 🗺️ Roadmap

- [ ] Complete user authentication
- [ ] Build the player profile system
- [ ] Implement daily quest management
- [ ] Integrate the AI Quest Master
- [ ] Add XP and level progression
- [ ] Improve UI and mobile responsiveness
- [ ] Add testing and deployment

## 📸 Screenshots

Screenshots will be added as the interface develops.

\<!-- Add screenshots here when available. -->

## 👨‍💻 Author

**Athish D**

- GitHub: [@Athish-D-6677](https://github.com/Athish-D-6677)
- LinkedIn: [Athish D](https://linkedin.com/in/athish-d-0b71b2330)

## 📄 License

This project is currently a personal development project. A license can be added when you decide how you want others to use the source code.https://solo-leveling-proj.web.app
