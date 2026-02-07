export interface Message {
    message: string;
    sender: string;
    msg_type: 'user_msg' | 'ai_msg'; // كما حددناها في Django
}

export type ChatType = 'user_to_user' | 'user_to_ai';

export interface ChatPayload {
    message: string;
    type: ChatType;
    sender: string;
}