
# 📡 WebSocket API Documentation

This document describes all supported WebSocket events, their expected payloads, and the corresponding server responses in a single flat format.

---

**WebSocket URL:**
```
ws://localhost:<PORT>
```

Replace `<PORT>` with the actual port your server is listening on.

All events must be sent as JSON stringified objects through an open WebSocket connection.

---

### 1. Authenticate

Client → Server
```json
{
  "event": "authenticate",
  "token": "<JWT_TOKEN>"
}
```

Server → All Clients
```json
{
  "event": "userStatus",
  "data": {
    "userId": "<authenticated_user_id>",
    "isOnline": true
  }
}
```

---

### 2. Send Message

Client → Server
```json
{
  "event": "message",
  "receiverId": "<receiver_user_id>",
  "message": "Hello!",
  "images": []
}
```

Server → Receiver (if online) and Sender
```json
{
  "event": "message",
  "data": {
    "id": "<chat_id>",
    "senderId": "<sender_id>",
    "receiverId": "<receiver_id>",
    "roomId": "<room_id>",
    "message": "Hello!",
    "images": [],
    "createdAt": "<timestamp>",
    "isRead": false
  }
}
```

---

### 3. Fetch Chats

Client → Server
```json
{
  "event": "fetchChats",
  "receiverId": "<receiver_user_id>"
}
```

Server → Sender
```json
{
  "event": "fetchChats",
  "data": [
    {
      "id": "<chat_id>",
      "senderId": "<user_id>",
      "receiverId": "<user_id>",
      "roomId": "<room_id>",
      "message": "Hi there",
      "images": [],
      "createdAt": "<timestamp>",
      "isRead": true
    }
  ]
}
```

If room not found:
```json
{
  "event": "noRoomFound"
}
```

---

### 4. Fetch Unread Messages

Client → Server
```json
{
  "event": "unReadMessages",
  "receiverId": "<receiver_user_id>"
}
```

Server → Sender
```json
{
  "event": "unReadMessages",
  "data": {
    "messages": [
      {
        "id": "<chat_id>",
        "senderId": "<user_id>",
        "receiverId": "<user_id>",
        "roomId": "<room_id>",
        "message": "Unread message!",
        "images": [],
        "createdAt": "<timestamp>",
        "isRead": false
      }
    ],
    "count": 1
  }
}
```

If no unread or room not found:
```json
{
  "event": "noUnreadMessages",
  "data": []
}
```

---

### 5. Disconnection

When a user disconnects, all clients receive:
```json
{
  "event": "userStatus",
  "data": {
    "userId": "<disconnected_user_id>",
    "isOnline": false
  }
}
```

---

### 6. Unknown Event

If the event type is unknown:

Server logs:
```
⚠️ Unknown event: <event_name>
```
