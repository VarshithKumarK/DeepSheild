from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from app.model.model import get_model
from app.live.webcam_predict import process_live_frame, reset_session

router = APIRouter()

# Schema for the live prediction request
class PredictLiveRequest(BaseModel):
    frame: str
    session_id: str
    action: str
    is_meeting_app: bool = False
    is_screen_share: bool = False

@router.post("/predict-live")
async def predict_live(payload: PredictLiveRequest):
    """
    FastAPI Live Verification Endpoint.
    
    Accepts:
        frame: base64 encoded image
        session_id: unique verification session identifier
        action: action target (e.g. blink, turn_left, turn_right)
        
    Decodes frame, checks face mesh landmarks, verifies action liveness,
    runs Xception + Swin Transformer deepfake detection, and computes overall trust score.
    """
    try:
        print('Predict live called................')
        model = get_model("xception_swin")
        print('model loaded')
        result = process_live_frame(
            model=model,
            frame_base64=payload.frame,
            session_id=payload.session_id,
            action=payload.action,
            is_meeting_app=payload.is_meeting_app,
            is_screen_share=payload.is_screen_share
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Live prediction pipeline error: {str(e)}")

@router.post("/predict-live/reset")
async def reset_live_session(payload: dict):
    """Reset a liveness tracking session."""
    session_id = payload.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id in payload")
    reset_session(session_id)
    return {"status": "success", "message": f"Session {session_id} has been reset"}
