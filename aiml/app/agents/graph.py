from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.nodes.signal_node import process_signals
from app.agents.nodes.heatmap_node import process_heatmap
from app.agents.nodes.explanation_node import process_explanation

# Initialize StateGraph
graph_builder = StateGraph(AgentState)

# Add nodes
graph_builder.add_node("signals", process_signals)
graph_builder.add_node("heatmap", process_heatmap)
graph_builder.add_node("explanation", process_explanation)

# Set edges
graph_builder.add_edge("signals", "heatmap")
graph_builder.add_edge("heatmap", "explanation")
graph_builder.add_edge("explanation", END)

# Set entry point
graph_builder.set_entry_point("signals")

# Compile graph
graph = graph_builder.compile()
