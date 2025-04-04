"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 2000 });
let allSockets = [];
wss.on("connection", (socket) => {
    console.log("New client connected");
    socket.on("message", (message) => {
        try {
            const parsedMessage = JSON.parse(message.toString());
            // Handle "join" message
            if (parsedMessage.type === "join") {
                const roomId = parsedMessage.payload.roomId;
                console.log(`User joined room: ${roomId}`);
                allSockets.push({ socket, room: roomId });
            }
            // Handle "chat" message
            if (parsedMessage.type === "chat") {
                const chatMessage = parsedMessage.payload.message;
                console.log(`Broadcasting message: ${chatMessage}`);
                // Find the room of the current user
                const currentUser = allSockets.find((user) => user.socket === socket);
                if (currentUser) {
                    const currentRoom = currentUser.room;
                    // Broadcast the message to all users in the same room
                    allSockets.forEach((user) => {
                        if (user.room === currentRoom) {
                            user.socket.send(chatMessage);
                        }
                    });
                }
            }
        }
        catch (error) {
            console.error("Error parsing message:", error instanceof Error ? error.message : error);
        }
    });
    socket.on("close", () => {
        console.log("Client disconnected");
        // Remove the disconnected socket from the list
        allSockets = allSockets.filter((user) => user.socket !== socket);
    });
});
