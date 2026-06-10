def calculate_trust_score(
    deepfake_label: str,
    deepfake_confidence: float,
    liveness_score: float,
    is_static_spoof: bool,
    is_screen_share: bool = False
):
    """
    Calculate the overall trust score and risk level.
    
    Formula:
        deepfake_score = confidence if real else (1.0 - confidence)
        trust_score = deepfake_score if is_screen_share else (deepfake_score * 0.6) + (liveness_score * 0.4)
    """
    # Map deepfake prediction to authenticity (probability of being real)
    if deepfake_label == "real":
        deepfake_score = deepfake_confidence
    else:
        # If it is predicted fake, its realness/authenticity score is low
        deepfake_score = 1.0 - deepfake_confidence
        
    # Cap between 0 and 1
    deepfake_score = max(0.0, min(1.0, deepfake_score))
    
    # Calculate final trust score
    if is_screen_share:
        trust_score = deepfake_score
    else:
        trust_score = (deepfake_score * 0.6) + (liveness_score * 0.4)
    
    # Static spoof override (if static spoof is detected, crash the trust score)
    if is_static_spoof:
        trust_score = min(trust_score, 0.15)
        
    # Cap trust score
    trust_score = max(0.0, min(1.0, trust_score))
    
    # Categorize trust level and risk indicator
    if trust_score >= 0.75:
        trust_level = "HIGH TRUST"
        risk_indicator = "LOW RISK"
    elif trust_score >= 0.45:
        trust_level = "MEDIUM TRUST"
        risk_indicator = "MEDIUM RISK"
    else:
        trust_level = "LOW TRUST"
        risk_indicator = "HIGH RISK"
        
    return {
        "deepfake_score": float(deepfake_score),
        "liveness_score": float(liveness_score),
        "trust_score": float(trust_score),
        "trust_level": trust_level,
        "risk_indicator": risk_indicator
    }
