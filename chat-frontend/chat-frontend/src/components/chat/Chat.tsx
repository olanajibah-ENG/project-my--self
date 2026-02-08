import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown'; // مكتبة المعالجة
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

    const socketControllerRef = useRef<{ send: (data: any) => void; close: () => void } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const controller = connectToChat(
            (data: any) => {
                if (data.type === 'typing') {
                    if (data.sender !== senderName) {
                        setIsAiTyping(data.active);
                    }
                } else {
                    const msg = data as Message;
                    if (msg.sender !== senderName) {
                        setMessages(prev => [...prev, msg]);
                        if (msg.sender === 'Gemini AI') {
                            setIsAiTyping(false);
                        }
                    }
                }
            },
            (status) => setConnectionStatus(status)
        );
        socketControllerRef.current = controller;
        return () => controller.close();
    }, [senderName]);

    useEffect(() => {
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }, [messages, isAiTyping]);

    // دالة الإرسال العامة (تستخدم للرسائل اليدوية والمقترحة)
    const handleSend = (text?: string) => {
        const messageToSend = text || inputValue;
        if (!messageToSend.trim() || !socketControllerRef.current) return;

        const payload: ChatPayload = {
            message: messageToSend,
            type: chatMode,
            sender: senderName
        };

        const optimisticMsg: Message = {
            message: messageToSend,
            sender: senderName,
            msg_type: 'user_msg'
        };

        setMessages(prev => [...prev, optimisticMsg]);
        socketControllerRef.current.send(payload);
        if (!text) setInputValue(''); // مسح الحقل فقط إذا كان إرسالاً يدوياً
    };

    return (
        <div className="chat-wrapper">
            <div className="chat-header">
                {chatMode === 'user_to_ai' ? 'AI Intelligence Lab' : 'Public Chat'}
                <div style={{ fontSize: '0.8rem', fontWeight: 'normal', marginTop: '5px', opacity: 0.8 }}>
                    Status: {connectionStatus}
                </div>
            </div>

            <div className="messages-list" ref={scrollRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`message-bubble ${msg.msg_type === 'ai_msg' ? 'ai-bubble' : (msg.sender === senderName ? 'my-bubble' : 'user-bubble')}`}>
                        <small style={{ display: 'block', fontSize: '10px', opacity: 0.7, marginBottom: '4px' }}>
                            {msg.msg_type === 'ai_msg' ? 'Gemini AI' : (msg.sender === senderName ? 'Me' : msg.sender)}
                        </small>
                        
                        {/* عرض الرسالة كـ Markdown للـ AI ونص عادي للمستخدمين */}
                        {msg.msg_type === 'ai_msg' ? (
                            <ReactMarkdown>{msg.message}</ReactMarkdown>
                        ) : (
                            msg.message
                        )}

                        {/* عرض الأسئلة المقترحة إن وجدت */}
                        {msg.msg_type === 'ai_msg' && msg.suggested_questions && msg.suggested_questions.length > 0 && (
                            <div className="suggestions-container">
                                {msg.suggested_questions.map((q, i) => (
                                    <button 
                                        key={i} 
                                        className="suggestion-btn"
                                        onClick={() => handleSend(q)}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}
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
                    <button className={`mode-selector ${chatMode === 'user_to_user' ? 'active' : ''}`} onClick={() => setChatMode('user_to_user')}>Community</button>
                    <button className={`mode-selector ${chatMode === 'user_to_ai' ? 'active' : ''}`} onClick={() => setChatMode('user_to_ai')}>Ask AI</button>
                </div>

                <div className="input-group">
                    <input
                        className="chat-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={chatMode === 'user_to_ai' ? "Ask me anything..." : "Write a message..."}
                        disabled={connectionStatus !== 'connected'}
                    />
                    <button className="send-btn" onClick={() => handleSend()} disabled={connectionStatus !== 'connected'}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default Chat;