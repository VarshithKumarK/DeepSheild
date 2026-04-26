import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.environ.get("GROQ_API_KEY", ""))

def build_prompt(label, confidence, signals, heatmap_info):
    return f"""
You are an expert AI system explaining deepfake detection results.

Use ONLY provided data. Do NOT hallucinate.

---

Prediction: {label}
Confidence: {confidence}

Signals:
{signals}

Heatmap Analysis:
{heatmap_info}

---

Generate a structured explanation:

1. Summary (what result means)
2. Key Evidence (signals + heatmap)
3. Quality Assessment (lighting, blur, noise)
4. Confidence Justification
5. Final Conclusion

Make it detailed, professional, and user-friendly.
Minimum 120 words.
"""

def generate_dynamic_explanation(label, confidence, signals, heatmap_info):
    prompt = build_prompt(label, confidence, signals, heatmap_info)
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.1-8b-instant", 
            temperature=0.3, # lower temp for more factual adherence
            max_tokens=400,
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        return f"Explanation generation failed: {str(e)}"
