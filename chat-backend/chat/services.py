import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

class OpenRouterService:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.model = os.getenv("AI_MODEL", "meta-llama/llama-3.2-3b-instruct:free")
        self.url = "https://openrouter.ai/api/v1/chat/completions"

    def get_ai_response(self, message):
        if not self.api_key:
            return "Error: API Key not found in .env"

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "Django Chat App"
        }
        
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": message}]
        }

        try:
            print(f"Sending request to OpenRouter with model: {self.model}")
            response = requests.post(self.url, headers=headers, data=json.dumps(payload))
            print(f"Response status: {response.status_code}")
            print(f"Response body: {response.text}")
            response.raise_for_status()
            data = response.json()
            return data['choices'][0]['message']['content']
        except requests.exceptions.HTTPError as e:
            return f"Error: {str(e)} - Response: {response.text}"
        except Exception as e:
            return f"Error: {str(e)}"