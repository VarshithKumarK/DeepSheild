from app.agents.state import AgentState
from app.utils.signals import extract_signals

def process_signals(state: AgentState) -> AgentState:
    signals = extract_signals(
        label=state["label"], 
        confidence=state["confidence"], 
        metadata=state["metadata"]
    )
    return {"signals": signals}
