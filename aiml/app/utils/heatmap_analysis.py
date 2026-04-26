import numpy as np

def analyze_heatmap(heatmap):
    if heatmap is None:
        return {}

    h, w = heatmap.shape[:2]  # Safe fallback for RGB heatmap shapes

    regions = {}

    center = heatmap[h//4:3*h//4, w//4:3*w//4]
    top = heatmap[:h//3, :]
    bottom = heatmap[2*h//3:, :]
    edges = np.concatenate([
        heatmap[:, :w//6],
        heatmap[:, -w//6:]
    ], axis=1)

    regions["center"] = float(np.mean(center))
    regions["top"] = float(np.mean(top))
    regions["bottom"] = float(np.mean(bottom))
    regions["edges"] = float(np.mean(edges))

    # Determine strongest regions
    sorted_regions = sorted(regions.items(), key=lambda x: x[1], reverse=True)

    description = []
    for name, val in sorted_regions[:2]:
        description.append(f"{name} region ({val:.2f})")

    return {
        "region_scores": regions,
        "focus": description
    }
