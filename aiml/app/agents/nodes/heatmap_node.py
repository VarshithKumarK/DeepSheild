from app.agents.state import AgentState
from app.utils.heatmap import interpret_heatmap

def process_heatmap(state: AgentState) -> AgentState:
    heatmap_info = interpret_heatmap()
    return {"heatmap_info": heatmap_info}
