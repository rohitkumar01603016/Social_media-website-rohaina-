# 🌐 Social Media Web Application (MERN Stack)

A full-stack Social Media Web Application built using the MERN stack (MongoDB, Express.js, React.js, Node.js) with real-time chat functionality and modern UI.

This platform allows users to connect, share posts, chat in real-time, and manage their profiles with advanced features similar to modern social media apps.

---

## 📁 Project Structure

```
Social-Media/
│
├── backend/        # Node.js + Express server
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── frontend/       # React frontend
│   ├── src/
│   └── public/
│
└── README.md
```

---

##  Features

### 👤 User Features

* Register & Login (JWT Authentication)
* Create, Edit, Delete Posts
* Upload images with posts
* Like & Comment on posts
* View user profiles
* Follow / Unfollow users

---

### 💬 Chat Features (Advanced 🔥)

* Real-time messaging using Socket.io
* Typing indicator (like WhatsApp)
* Last seen status
* Online / Offline status
* Delete message for everyone
* End-to-end encrypted messages (concept-based)
* Block / Unblock users
* Auto-block for abusive/bad content messages
* Search chats
* Notifications for new messages
* Dark / Light mode

---

### 👤 Profile Features

* Edit profile (name, email, password)
* Change profile picture
* Add bio
* View followers & following
* Delete account option

---

### 🔒 Security Features

* Password hashing with salt (bcrypt)
* JWT-based authentication
* Protected routes
* Secure API handling

---

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript
* CSS / Tailwind (if used)

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Atlas)

### Realtime

* Socket.io

---

## ⚙️ Environment Variables

⚠️ Create `.env` file inside **backend** folder:

```
NODE_ENV=production
PORT=4000

# MongoDB
MONGO_URI=

# Optional backup
# MONGO_URI=""

# JWT
JWT_SECRET=

# Cloudinary (if used)
CLOUDINARY_API_KEY=
CLOUDINARY_SECRET_KEY=
CLOUDINARY_NAME=
```

---

## ⚠️ Important Notes

* `.env` file is NOT included in GitHub (for security)
* `node_modules` are ignored
* Never share your secrets publicly

---

## 📦 Installation & Setup

### 1️⃣ Clone the repository

```
git clone https://github.com/rohitkumar01603016/Socail_media-website-rohaina-.git
cd social-media-app
```

---

### 2️⃣ Install Dependencies

#### Backend

```
cd backend
npm install
```

#### Frontend

```
cd frontend
npm install
```

---

## ▶️ Run the Project

### Start Backend

```
cd backend
npm run dev
```

OR

```
node server.js
```

---

### Start Frontend

```
cd frontend
npm start
```

---

## 🌐 Deployment (Future)

Frontend → Vercel / Netlify
Backend → Render / Railway
Database → MongoDB Atlas

---

## 🔮 Future Enhancements

* Stories feature (Instagram-like)
* Advanced privacy settings
* AI-based content moderation
* Push notifications
* Video calling feature
* Group chat system

---

## 📸 Screenshots

(Add your project screenshots here)

---

## 👨 Author

**Rohit Kumar**

---

## ⭐ Support

If you like this project, please ⭐ the repository and share it!

---
