from app.agents.state import AgentState
from app.services.groq_client import generate_explanation

def process_explanation(state: AgentState) -> AgentState:
    explanation = generate_explanation(
        label=state["label"],
        confidence=state["confidence"],
        signals=state.get("signals", []),
        heatmap_info=state.get("heatmap_info", "")
    )
    return {"explanation": explanation}
