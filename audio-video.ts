import { Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { Secret } from "jsonwebtoken";
import prisma from "./prisma";
import config from "../config";
import { UserRole } from "@prisma/client";
import { jwtHelpers } from "../helpars/jwtHelpers";

// Extended WebSocket type to track user info
interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  userRole?: string;
  userName?: string;
  isAlive?: boolean;
  path?: string;
}

export const onlineUsers = new Map<
  string,
  { socket: ExtendedWebSocket; path: string }
>();
const onlineCouriers = new Map<string, ExtendedWebSocket>();

// Set up WebSocket server
export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({
    server,
    perMessageDeflate: false,
    handleProtocols: (protocols: string[] | Set<string>) => {
      const protocolArray = Array.isArray(protocols)
        ? protocols
        : Array.from(protocols);
      return protocolArray.length === 0 ? "" : protocolArray[0];
    },
  });

  // Keep clients alive
  function heartbeat(ws: ExtendedWebSocket) {
    ws.isAlive = true;
  }

  // Check every 30 seconds for alive connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws: ExtendedWebSocket) => {
      if (ws.isAlive === false) {
        if (ws.userId) {
          onlineUsers.delete(ws.userId);
          if (ws.userRole === UserRole.Client) {
            onlineCouriers.delete(ws.userId);
          }
        }
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  // Handle WebSocket connections
  wss.on("connection", (ws: ExtendedWebSocket, req) => {
    ws.isAlive = true;
    ws.path = req.url;
    console.log("New WebSocket connection established on path:", ws.path);

    // Send message when connected
    ws.send(
      JSON.stringify({
        event: "info",
        message: "Connected to server. Please authenticate.",
      })
    );

    ws.on("pong", () => heartbeat(ws));

    // Handle incoming WebSocket messages
    ws.on("message", async (data: string) => {
      try {
        const parsedData = JSON.parse(data);
        console.log("Received event:", parsedData.event, "on path:", ws.path);

        if (!ws.userId && parsedData.event !== "authenticate") {
          ws.send(
            JSON.stringify({
              event: "error",
              message: "Please authenticate first",
            })
          );
          return;
        }

        if (parsedData.event === "authenticate") {
          const token = parsedData.token;
          if (!token) {
            ws.send(
              JSON.stringify({
                event: "error",
                message: "Token is required for authentication",
              })
            );
            return;
          }

          try {
            const user = jwtHelpers.verifyToken(
              token,
              config.jwt.jwt_secret as Secret
            );
            const { id, role, email } = user;

            // Remove existing connection for this user
            const existingConnection = onlineUsers.get(id);
            if (existingConnection && existingConnection.path === ws.path) {
              existingConnection.socket.close();
              onlineUsers.delete(id);
              if (role === UserRole.Client) {
                onlineCouriers.delete(id);
              }
            }

            ws.userId = id;
            ws.userRole = role;
            ws.userName = email;
            onlineUsers.set(id, { socket: ws, path: ws.path! });

            if (role === UserRole.Client) {
              onlineCouriers.set(id, ws);
            }

            ws.send(
              JSON.stringify({
                event: "authenticated",
                data: { userId: id, role, success: true },
              })
            );
          } catch (error) {
            ws.send(
              JSON.stringify({
                event: "error",
                message: "Invalid token",
              })
            );
          }
          return;
        }

        if (ws.path === "/driver-location") {
          console.log("Handling driver location update");
        } else {
          await handleParcelChatMessage(ws, parsedData);
        }
      } catch (error) {
        ws.send(
          JSON.stringify({
            event: "error",
            message: "Invalid message format",
          })
        );
      }
    });

    // Close connection cleanup
    ws.on("close", () => {
      if (ws.userId) {
        onlineUsers.delete(ws.userId);
        if (ws.userRole === UserRole.Client) {
          onlineCouriers.delete(ws.userId);
        }
      }
    });
  });

  return wss;
}

async function handleParcelChatMessage(ws: ExtendedWebSocket, parsedData: any) {
  switch (parsedData.event) {
    case "callUser": {
      const { toUserId, offer, callType } = parsedData;

       console.log([callUser] From: ${ws.userId} To: ${toUserId} Type: ${callType});

      if (ws.userRole !== UserRole.Client) {
        ws.send(
          JSON.stringify({
            event: "error",
            message: "Only Client can initiate a call.",
          })
        );
        return;
      }

      if (!callType || !["audio", "video"].includes(callType)) {
        ws.send(
          JSON.stringify({
            event: "error",
            message: "Invalid or missing callType. Must be 'audio' or 'video'.",
          })
        );
        return;
      }

      const receiverConnection = onlineUsers.get(toUserId);
      if (
        receiverConnection?.socket.readyState === WebSocket.OPEN &&
        receiverConnection.socket.userRole === UserRole.Host
      ) {
        receiverConnection.socket.send(
          JSON.stringify({
            event: "incomingCall",
            data: {
              fromUserId: ws.userId,
              offer,
              callType,
            },
          })
        );
        console.log(event ✅ Success: Call delivered to ${toUserId});
      } else {
        console.log(event ❌ Failed: Host not available);
        ws.send(
          JSON.stringify({
            event: "error",
            message: "Host not available or invalid recipient.",
          })
        );
      }
      break;
    }

    case "answerCall": {
      const { toUserId, answer } = parsedData;

       console.log([answerCall] From: ${ws.userId} To: ${toUserId});

      const callerConnection = onlineUsers.get(toUserId);
      if (callerConnection?.socket.readyState === WebSocket.OPEN) {
        callerConnection.socket.send(
          JSON.stringify({
            event: "callAnswered",
            data: {
              fromUserId: ws.userId,
              answer,
            },
          })
        );
        console.log(event ✅ Success: Answer sent to ${toUserId});
      }else {
        console.log(event ❌ Failed: Caller not available);
      }
      break;
    }

    case "iceCandidate": {
      const { toUserId, candidate } = parsedData;

       console.log([iceCandidate] From: ${ws.userId} To: ${toUserId});

      const peerConnection = onlineUsers.get(toUserId);
      if (peerConnection?.socket.readyState === WebSocket.OPEN) {
        peerConnection.socket.send(
          JSON.stringify({
            event: "iceCandidate",
            data: {
              fromUserId: ws.userId,
              candidate,
            },
          })
        );
         console.log(event ✅ Success: ICE candidate sent to ${toUserId});
      }else {
        console.log(event ❌ Failed: Peer not available);
      }
      break;
    }

    case "disconnectCall": {
      const { toUserId } = parsedData;
      console.log([disconnectCall] From: ${ws.userId} To: ${toUserId});

      const peerConnection = onlineUsers.get(toUserId);
      if (peerConnection?.socket.readyState === WebSocket.OPEN) {
        peerConnection.socket.send(
          JSON.stringify({
            event: "callDisconnected",
            data: {
              fromUserId: ws.userId,
              message: "Call has been disconnected.",
            },
          })
        );
        console.log(event ✅ Success: Call disconnect sent to ${toUserId});
      }else {
        console.log(event ❌ Failed: Peer not available);
      }
      break;
    }

    default:
      ws.send(
        JSON.stringify({
          event: "error",
          message: "Unknown event type",
        })
      );
  }
}
