import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import type { Message, ChatType, ChatPayload } from '../../types/chat';
import { createChatSocket } from '../../services/chatService';

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [chatMode, setChatMode] = useState<ChatType>('user_to_user');
    const socketRef = useRef<WebSocket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // إنشاء الاتصال عند تشغيل المكون
        socketRef.current = createChatSocket(
            (data: Message) => setMessages(prev => [...prev, data]),
            () => console.log("Connected to Chat"),
            () => console.log("Disconnected")
        );

        return () => socketRef.current?.close();
    }, []);

    useEffect(() => {
        // النزول لآخر رسالة تلقائياً
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim() || !socketRef.current) return;

        const payload: ChatPayload = {
            message: inputValue,
            type: chatMode,
            sender: "Me"
        };

        socketRef.current.send(JSON.stringify(payload));
        setInputValue('');
    };

    return (
        <div className="chat-wrapper">
            <div className="chat-header">
                {chatMode === 'user_to_ai' ? 'AI Chat Room' : 'Chat with Users'}
            </div>
            
            <div className="messages-list" ref={scrollRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`message-bubble ${msg.msg_type === 'ai_msg' ? 'ai-bubble' : 'user-bubble'}`}>
                        <small style={{display: 'block', fontSize: '10px', opacity: 0.7}}>{msg.sender}</small>
                        {msg.message}
                    </div>
                ))}
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
                    />
                    <button className="send-btn" onClick={handleSend}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default Chat;