"use client";

import { useEffect, useState, useCallback } from "react";
import io from "socket.io-client";

export default function DM({ params }) {
  const { userId } = params;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  const connectSocket = useCallback(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    newSocket.on("message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      console.log(data);
    });

    setSocket(newSocket);

    return newSocket;
  }, []);

  useEffect(() => {
    const newSocket = connectSocket();

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [connectSocket]);

  const sendMessage = useCallback(() => {
    if (message && socket) {
      socket.emit("message", {
        receivedUser: userId,
        message,
      });
      setMessage("");
    }
  }, [message, socket, userId]);

  return (
    <div>
      User: {userId}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
