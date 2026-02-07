import type { Message, TypingEvent } from '../types/chat';

const WS_URL = "ws://127.0.0.1:8000/ws/chat/";

type ChatEvent = Message | TypingEvent;

export const connectToChat = (
    onMessage: (data: ChatEvent) => void,
    onStatusChange: (status: 'connecting' | 'connected' | 'disconnected') => void
) => {
    let socket: WebSocket | null = null;
    let shouldReconnect = true;
    let reconnectTimeout: number | undefined;

    const connect = () => {
        onStatusChange('connecting');
        socket = new WebSocket(WS_URL);

        socket.onopen = () => {
            console.log("Connected to Chat");
            onStatusChange('connected');
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (e) {
                console.error("Failed to parse message", e);
            }
        };

        socket.onclose = () => {
            console.log("Disconnected from Chat");
            onStatusChange('disconnected');
            if (shouldReconnect) {
                console.log("Attempting to reconnect in 3s...");
                reconnectTimeout = window.setTimeout(connect, 3000);
            }
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            socket?.close();
        };
    };

    connect();

    return {
        send: (data: any) => {
            if (socket?.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(data));
            } else {
                console.warn("Socket not open, cannot send message");
            }
        },
        close: () => {
            shouldReconnect = false;
            clearTimeout(reconnectTimeout);
            socket?.close();
        }
    };
};