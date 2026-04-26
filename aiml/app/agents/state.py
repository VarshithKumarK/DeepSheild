from typing import TypedDict, Optional

class AgentState(TypedDict):
    label: str
    confidence: float
    metadata: dict
    signals: list[str]
    heatmap_info: str
    explanation: Optional[str]
