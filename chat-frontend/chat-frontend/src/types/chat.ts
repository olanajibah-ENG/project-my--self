export interface Message {
    message: string;
    sender: string;
    msg_type: 'user_msg' | 'ai_msg';
    // إضافة الحقل الجديد ليكون اختيارياً (فقط لرسائل الـ AI)
    suggested_questions?: string[]; 
}

export interface TypingEvent {
    type: 'typing';
    sender: string;
    active: boolean;
}

export type ChatType = 'user_to_user' | 'user_to_ai';

export interface ChatPayload {
    message: string;
    type: ChatType;
    sender: string;
}