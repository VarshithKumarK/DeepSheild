import torch
import torch.nn as nn
import timm

class XceptionSwinHybrid(nn.Module):
    def __init__(self, num_classes=1, pretrained=True):
        """
        Hybrid deep learning architecture combining Xception and Swin Transformer.
        
        - Xception: Local feature maps extractor (shapes, blending borders, edge artifacts).
        - Swin Transformer: Hierarchical shifted window attention for global contextual relationships (eye symmetry, posture).
        """
        super(XceptionSwinHybrid, self).__init__()
        
        # 1. Load Xception backbone for spatial feature mapping
        self.xception = timm.create_model('xception', pretrained=pretrained, features_only=True)
        
        in_channels = 2048 # High-level feature channels from Xception block
        embed_dim = 768    # Target embedding size for Swin Transformer Stage 3 (7x7 resolution)
        
        # 2. Project CNN feature maps to Swin block channel dimensions
        self.proj = nn.Conv2d(in_channels, embed_dim, kernel_size=1)
        
        # 3. Import Swin Transformer blocks (using Swin-Tiny Stage 3 layout)
        swin_base = timm.create_model('swin_tiny_patch4_window7_224', pretrained=pretrained)
        self.swin_blocks = swin_base.layers[3].blocks
        self.norm = nn.LayerNorm(embed_dim)
        
        # 4. Dense Classifier Output
        self.pool = nn.AdaptiveAvgPool1d(1)
        self.fc = nn.Linear(embed_dim, num_classes)

    def forward(self, x):
        # Input shape: (B, 3, 224, 224)
        
        # 1. Spatial feature map extraction
        features = self.xception(x)
        x_cnn = features[-1] # Shape: (B, 2048, 7, 7)
        
        # 2. Projection to Swin channels
        x_proj = self.proj(x_cnn) # Shape: (B, 192, 7, 7)
        
        # 3. Permute to (B, H, W, C) matching Swin block expectations
        B, C, H, W = x_proj.shape
        x_trans = x_proj.permute(0, 2, 3, 1) # Shape: (B, 7, 7, 192)
        
        # 4. Self-attention encoding
        for block in self.swin_blocks:
            x_trans = block(x_trans)
            
        x_trans = self.norm(x_trans) # Shape: (B, 7, 7, 192)
        
        # 5. Pooling and final classification mapping
        # Flatten spatial grid back to (B, H*W, C) -> (B, 49, 192) -> Transpose to (B, 192, 49)
        x_flat = x_trans.view(B, H * W, C).transpose(1, 2) # Shape: (B, 192, 49)
        x_pooled = self.pool(x_flat).squeeze(-1) # Shape: (B, 192)
        
        out = self.fc(x_pooled) # Logit shape: (B, 1)
        return out
