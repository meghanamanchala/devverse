
# 🌐 DevVerse

**DevVerse** is a MERN-based social platform for developers to connect, share posts, chat, and grow together.

## ✨ Features

- Clerk authentication (secure, modern auth)
- Create, like & comment on posts
- Follow/unfollow developers
- Real-time chat with Socket.io
- Cloudinary image uploads
- Responsive UI (Light/Dark mode)
- Notifications for likes, comments, follows, and messages

## 🛠 Tech Stack

**Frontend:** React, Redux Toolkit, TailwindCSS, Clerk
**Backend:** Node.js, Express, MongoDB, Socket.io

## 🚀 Getting Started

1. Clone the repo: `git clone https://github.com/meghanamanchala/devverse.git`
2. Install dependencies:
	- `cd backend && npm install`
	- `cd ../frontend && npm install`
3. Set up environment variables in `.env` (see `.env.example`)
4. Start backend: `npm run dev` (from `backend` folder)
5. Start frontend: `npm run dev` (from `frontend` folder)

## 📚 Usage

- Sign up/login with Clerk
- Create posts, like, comment, follow users
- Chat in real-time
- View notifications for all key activities

## 📝 Notes

- Settings page and related routes have been removed for simplicity.
- For notifications, actions like like, comment, follow, and message automatically trigger notifications for the relevant user.

---

📬 Connect: [GitHub](https://github.com/meghanamanchala/devverse.git)
