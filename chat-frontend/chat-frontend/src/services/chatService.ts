const WS_URL = "ws://127.0.0.1:8000/ws/chat/";

export const createChatSocket = (
    onMessage: (data: any) => void,
    onOpen: () => void,
    onClose: () => void
) => {
    const socket = new WebSocket(WS_URL);

    socket.onopen = onOpen;
    socket.onclose = onClose;
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
    };

    return socket;
};