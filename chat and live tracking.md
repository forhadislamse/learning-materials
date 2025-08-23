# WebSocket Test Cases - Live Location & Chat

This document contains ready-to-use **Postman** WebSocket test cases for:
- **User Authentication**
- **Live Location Tracking**
- **Live Chat Messaging**
- **Fetching Chats & Unread Messages**
- **Message List with Last Messages**

---

## ✅ 1. Connect & Authenticate

**Description:**  
Authenticate the WebSocket connection using JWT token.

**Postman Setup:**
- Open Postman → New → WebSocket Request  
- URL: `ws://localhost:PORT` (replace `PORT` with your backend port)  
- Method: `RAW` → `JSON`

**Payload:**
```json
{
  "event": "authenticate",
  "token": "YOUR_JWT_ACCESS_TOKEN"
}
```

---

## 📍 2. Send Live Location Update

**Description:**  
Send your **current latitude and longitude** to update location in DB & notify subscribers.

**Payload:**
```json
{
  "event": "locationUpdate",
  "lat": 23.8103,
  "lng": 90.4125
}
```

---

## 👀 3. Subscribe to Another User's Location

**Description:**  
Subscribe to real-time location updates of a specific user.

**Payload:**
```json
{
  "event": "subscribeToLocation",
  "targetUserId": "TARGET_USER_ID"
}
```

---

## 💬 4. Send Chat Message

**Description:**  
Send a message (with optional images) to another user.

**Payload:**
```json
{
  "event": "message",
  "receiverId": "RECEIVER_USER_ID",
  "message": "Hello, how are you?",
  "images": ["https://example.com/image1.jpg"]
}
```

---

## 📜 5. Fetch Chat History

**Description:**  
Retrieve chat messages between the authenticated user and another user.

**Payload:**
```json
{
  "event": "fetchChats",
  "receiverId": "RECEIVER_USER_ID"
}
```

---

## 📩 6. Fetch Unread Messages

**Description:**  
Retrieve all unread messages from a specific user.

**Payload:**
```json
{
  "event": "unReadMessages",
  "receiverId": "RECEIVER_USER_ID"
}
```

---

## 📋 7. Fetch Message List (Last Message per Room)

**Description:**  
Retrieve a list of users you have chatted with along with the last message.

**Payload:**
```json
{
  "event": "messageList"
}
```
