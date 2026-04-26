import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize the Groq client. Ensure GROQ_API_KEY is in your environment variables.
client = Groq(api_key=os.environ.get("GROQ_API_KEY", ""))

def generate_explanation(label: str, confidence: float, signals: list[str], heatmap_info: str) -> str:
    prompt = f"""
    You are an AI assistant explaining a deepfake detection model's prediction to a non-technical user.
    The model has predicted that the image/video is '{label}' with a confidence of {confidence:.2f}.
    
    Here are some signals detected during prediction: {', '.join(signals) if signals else 'None'}.
    Heatmap focus: {heatmap_info}
    
    Please provide a simple, concise, and non-technical explanation of what this means.
    """
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.1-8b-instant", 
            temperature=0.7,
            max_tokens=150,
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        return f"Explanation generation failed: {str(e)}"
