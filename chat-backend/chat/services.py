import os
import json
import re
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage

load_dotenv()

class LangChainService:
    # قاموس لتخزين تاريخ المحادثة لكل مستخدم (Memory)
    _sessions_history = {}

    def __init__(self):
        api_key = os.getenv("OPENROUTER_API_KEY")
        model_name = os.getenv("AI_MODEL", "google/gemini-2.0-flash-exp:free")
        
        # إعداد اتصال LangChain مع OpenRouter
        self.llm = ChatOpenAI(
            model=model_name,
            openai_api_key=api_key,
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.7
        )

    def get_ai_response(self, user_id, message):
        try:
            # إدارة ذاكرة المحادثة
            if user_id not in self._sessions_history:
                self._sessions_history[user_id] = []
            
            history = self._sessions_history[user_id]

            # إعداد الـ Prompt مع طلب JSON
            prompt = ChatPromptTemplate.from_messages([
                ("system", """أنت مساعد ذكي تجيب باللغة العربية وتستخدم Markdown لتنسيق النصوص.

يجب أن يكون ردك بصيغة JSON فقط بهذا الشكل:
{{
  "answer": "الرد النصي بتنسيق Markdown",
  "suggested_questions": ["سؤال 1", "سؤال 2", "سؤال 3"]
}}

لا تكتب أي شيء قبل أو بعد الـ JSON."""),
                MessagesPlaceholder(variable_name="chat_history"),
                ("user", "{input}")
            ])

            # تشغيل الـ Chain
            chain = prompt | self.llm
            
            # استدعاء النموذج
            result = chain.invoke({
                "input": message,
                "chat_history": history
            })

            # استخراج النص من الرد
            response_text = result.content
            
            # محاولة استخراج JSON من الرد
            try:
                # البحث عن JSON في النص (قد يكون محاط بـ ```json```)
                json_match = re.search(r'```json\s*(\{.*?\})\s*```', response_text, re.DOTALL)
                if json_match:
                    response_text = json_match.group(1)
                
                # تحويل النص إلى JSON
                parsed_response = json.loads(response_text)
                answer = parsed_response.get("answer", response_text)
                suggested_questions = parsed_response.get("suggested_questions", [])
            except:
                # إذا فشل التحليل، نستخدم الرد كما هو
                answer = response_text
                suggested_questions = []

            # تحديث الذاكرة بالرسائل الجديدة
            history.append(HumanMessage(content=message))
            history.append(AIMessage(content=answer))
            
            # تقليص الذاكرة لآخر 10 رسائل فقط
            self._sessions_history[user_id] = history[-10:]

            return {
                "answer": answer,
                "suggested_questions": suggested_questions
            }
        except Exception as e:
            return {"answer": f"Error: {str(e)}", "suggested_questions": []}