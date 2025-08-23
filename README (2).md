# 🐾 WebSocket Chat Server

This server enables **real-time one-to-one chat**, **user online/offline tracking**, and **unread message management** using **native WebSocket**, **JWT authentication**, and **Prisma**.

---

## 📌 Features
- **JWT authentication** for secure WebSocket connections
- **Online/Offline status broadcasting**
- **One-to-one chat** (text + images)
- **Automatic room creation** if not found
- **Unread message count retrieval**
- **Fetch chat history**
- **MongoDB (via Prisma)** for data persistence

---

## 📂 Project Structure
```
src/
 ├── ws/                # WebSocket server setup
 ├── helpers/           # JWT verification helpers
 ├── shared/            # Prisma client instance
 └── app/config/        # Configuration files
```

---

## ⚙️ Setup & Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm run dev
```

### 3. Environment Variables
Make sure to set:
```env
DATABASE_URL=mongodb+srv://...
JWT_SECRET=your_secret_key
```

---

## 🔑 WebSocket Events

### 1️⃣ Authenticate
Authenticate user after connection.
```json
{
  "event": "authenticate",
  "token": "<JWT_TOKEN>"
}
```
**Response (to all clients):**
```json
{
  "event": "userStatus",
  "data": { "userId": "<USER_ID>", "isOnline": true }
}
```

---

### 2️⃣ Send Message
Send a message to another user.
```json
{
  "event": "message",
  "receiverId": "<OTHER_USER_ID>",
  "message": "Hello!",
  "images": []
}
```
**Response:**
```json
{
  "event": "message",
  "data": { "id": "...", "senderId": "...", "receiverId": "...", "message": "Hello!", "images": [], "createdAt": "..." }
}
```

---

### 3️⃣ Fetch Chat History
```json
{
  "event": "fetchChats",
  "receiverId": "<OTHER_USER_ID>"
}
```
**Response (if room exists):**
```json
{
  "event": "fetchChats",
  "data": [ { "id": "...", "message": "Hello", "isRead": true } ]
}
```
**Response (if no room exists):**
```json
{ "event": "noRoomFound" }
```

---

### 4️⃣ Fetch Unread Messages
```json
{
  "event": "unReadMessages",
  "receiverId": "<OTHER_USER_ID>"
}
```
**Response:**
```json
{
  "event": "unReadMessages",
  "data": { "messages": [ { "id": "...", "message": "..." } ], "count": 1 }
}
```
**If none:**
```json
{ "event": "noUnreadMessages", "data": [] }
```

---

### 5️⃣ Disconnect
When a user disconnects, all clients receive:
```json
{
  "event": "userStatus",
  "data": { "userId": "<USER_ID>", "isOnline": false }
}
```

---

## 🧪 Testing with Postman
You can test this WebSocket API with Postman:
1. Create a **WebSocket Request** with `ws://localhost:<PORT>`.
2. Send the events shown above in **raw JSON** format.
3. Verify responses match the examples.
