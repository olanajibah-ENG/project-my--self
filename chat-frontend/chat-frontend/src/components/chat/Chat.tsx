import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import type { Message, ChatType, ChatPayload } from '../../types/chat';
import { connectToChat } from '../../services/chatService';

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [chatMode, setChatMode] = useState<ChatType>('user_to_user');
    const [senderName] = useState(() => `User-${Math.floor(Math.random() * 1000)}`);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
    const [isAiTyping, setIsAiTyping] = useState(false);

    // Use a ref for the socket controller (which now has send() and close())
    const socketControllerRef = useRef<{ send: (data: any) => void; close: () => void } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const controller = connectToChat(
            (data: any) => {
                console.log("Received WebSocket data:", data); // DEBUG
                if (data.type === 'typing') {
                    console.log("Typing event received from:", data.sender, "Active:", data.active); // DEBUG
                    if (data.sender !== senderName) {
                        setIsAiTyping(data.active);
                    }
                } else {
                    // It's a message
                    const msg = data as Message;
                    // Ignore our own messages (we added them optimistically)
                    if (msg.sender !== senderName) {
                        setMessages(prev => [...prev, msg]);
                        // If we receive a message from AI, stop typing
                        if (msg.sender === 'Gemini AI') {
                            setIsAiTyping(false);
                        }
                    }
                }
            },
            (status) => {
                setConnectionStatus(status);
            }
        );

        socketControllerRef.current = controller;

        return () => controller.close();
    }, [senderName]);

    useEffect(() => {
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }, [messages, isAiTyping]);

    const handleSend = () => {
        if (!inputValue.trim() || !socketControllerRef.current) return;

        const payload: ChatPayload = {
            message: inputValue,
            type: chatMode,
            sender: senderName
        };

        // Optimistic update
        const optimisticMsg: Message = {
            message: inputValue,
            sender: senderName,
            msg_type: 'user_msg'
        };
        setMessages(prev => [...prev, optimisticMsg]);

        socketControllerRef.current.send(payload);
        setInputValue('');
    };

    return (
        <div className="chat-wrapper">
            <div className="chat-header">
                {chatMode === 'user_to_ai' ? 'AI Chat Room' : 'Chat with Users'}
                <div style={{ fontSize: '0.8rem', fontWeight: 'normal', marginTop: '5px', opacity: 0.8 }}>
                    Status: {connectionStatus}
                </div>
            </div>

            <div className="messages-list" ref={scrollRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`message-bubble ${msg.msg_type === 'ai_msg' ? 'ai-bubble' : (msg.sender === senderName ? 'my-bubble' : 'user-bubble')}`}>
                        <small style={{ display: 'block', fontSize: '10px', opacity: 0.7 }}>
                            {msg.msg_type === 'ai_msg' ? 'Gemini AI' : (msg.sender === senderName ? 'Me' : msg.sender)}
                        </small>
                        {msg.message}
                    </div>
                ))}

                {isAiTyping && (
                    <div className="message-bubble ai-bubble typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                    </div>
                )}
            </div>

            <div className="chat-input-area">
                <div className="controls">
                    <button
                        className={`mode-selector ${chatMode === 'user_to_user' ? 'active' : ''}`}
                        onClick={() => setChatMode('user_to_user')}
                    >
                        Chat with Users
                    </button>
                    <button
                        className={`mode-selector ${chatMode === 'user_to_ai' ? 'active' : ''}`}
                        onClick={() => setChatMode('user_to_ai')}
                    >
                        Ask AI
                    </button>
                </div>

                <div className="input-group">
                    <input
                        className="chat-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={chatMode === 'user_to_ai' ? "Ask AI something..." : "Type a message..."}
                        disabled={connectionStatus !== 'connected'}
                    />
                    <button
                        className="send-btn"
                        onClick={handleSend}
                        disabled={connectionStatus !== 'connected'}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;