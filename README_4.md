# Parcel Chat WebSocket Documentation

## Connection URLs
- Local: ws://10.0.30.91:5001
- Production: ws://patrkamh.onrender.com

## Authentication

First authenticate with WebSocket server:

json
{
  "event": "authenticate",
  "token": "your-jwt-token"
}


### Success Response
json
{
  "event": "authenticated",
  "data": {
    "userId": "user-id",
    "role": "user-role",
    "success": true
  }
}


## Chat Events

### 1. Join Parcel Chat

Join a chat room for a specific parcel. Only sender and courier of the parcel can join.

#### Request
json
{
  "event": "joinParcelChat",
  "parcelId": "parcel-id"
}


#### Success Response
json
{
  "event": "joinedParcelChat",
  "data": {
    "chatId": "chat-id",
    "parcelId": "parcel-id",
    "participants": {
      "sender": {
        "id": "sender-id",
        "fullName": "Sender Name",
        "email": "sender@email.com",
        "profileImage": "image-url"
      },
      "courier": {
        "id": "courier-id",
        "fullName": "Courier Name",
        "email": "courier@email.com",
        "profileImage": "image-url"
      }
    },
    "messages": [
      {
        "id": "message-id",
        "message": "message content",
        "images": ["image-urls"],
        "senderId": "sender-id",
        "isRead": false,
        "createdAt": "timestamp",
        "sender": {
          "id": "user-id",
          "fullName": "User Name",
          "email": "user@email.com",
          "profileImage": "image-url"
        }
      }
    ]
  }
}


### 2. Send Message

Send a message in the parcel chat.

#### Request
json
{
  "event": "parcelMessage",
  "parcelId": "parcel-id",
  "message": "message content",
  "images": ["image-urls"] // Optional
}


#### Success Response (To Sender)
json
{
  "event": "messageSent",
  "data": {
    "id": "message-id",
    "message": "message content",
    "images": ["image-urls"],
    "senderId": "sender-id",
    "isRead": false,
    "createdAt": "timestamp",
    "sender": {
      "id": "user-id",
      "fullName": "User Name",
      "email": "user@email.com",
      "profileImage": "image-url"
    }
  }
}


#### Real-time Update (To Recipient)
json
{
  "event": "newMessage",
  "data": {
    "id": "message-id",
    "message": "message content",
    "images": ["image-urls"],
    "senderId": "sender-id",
    "isRead": false,
    "createdAt": "timestamp",
    "sender": {
      "id": "user-id",
      "fullName": "User Name",
      "email": "user@email.com",
      "profileImage": "image-url"
    }
  }
}


### 3. Mark Messages as Read

Mark all unread messages in a chat as read.

#### Request
json
{
  "event": "markMessagesAsRead",
  "parcelId": "parcel-id"
}


#### Success Response
json
{
  "event": "messagesMarkedAsRead",
  "data": {
    "parcelId": "parcel-id",
    "success": true
  }
}


### 4. Fetch Messages

Get all messages for a parcel chat.

#### Request
json
{
  "event": "fetchParcelMessages",
  "parcelId": "parcel-id"
}


#### Success Response
json
{
  "event": "parcelMessages",
  "data": {
    "parcelId": "parcel-id",
    "participants": {
      "sender": {
        "id": "sender-id",
        "fullName": "Sender Name",
        "email": "sender@email.com",
        "profileImage": "image-url"
      },
      "courier": {
        "id": "courier-id",
        "fullName": "Courier Name",
        "email": "courier@email.com",
        "profileImage": "image-url"
      }
    },
    "messages": [
      {
        "id": "message-id",
        "message": "message content",
        "images": ["image-urls"],
        "senderId": "sender-id",
        "isRead": false,
        "createdAt": "timestamp",
        "isSender": true,
        "sender": {
          "id": "user-id",
          "fullName": "User Name",
          "email": "user@email.com",
          "profileImage": "image-url"
        }
      }
    ]
  }
}


## Error Handling

### Error Response Format
json
{
  "event": "error",
  "message": "Error description"
}
