import jsPDF from "jspdf";

// Draw the header banner, footer, and page border on each page
const drawPageTemplate = (doc, title, pageNum) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // 1. Draw Page Border (Indigo Accent)
  doc.setDrawColor(99, 102, 241); 
  doc.setLineWidth(0.75);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16); 
  
  // 2. Draw Header Accent Bar
  doc.setFillColor(11, 15, 25); // Dark Slate Blue
  doc.rect(8, 8, pageWidth - 16, 14, "F");
  
  // Header Text Left
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("DEEPSHIELD AI SECURITY PLATFORM", 13, 17);
  
  // Header Text Right
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(156, 163, 175);
  doc.text(title.toUpperCase(), pageWidth - 13, 17, { align: "right" });
  
  // 3. Draw Footer Accent Bar
  doc.setFillColor(17, 24, 39); 
  doc.rect(8, pageHeight - 18, pageWidth - 16, 10, "F");
  
  // Footer text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(156, 163, 175);
  doc.text("CONFIDENTIAL - SYSTEM GENERATED DETAILED AUDIT", 13, pageHeight - 11.5);
  
  if (pageNum) {
    doc.text(`Page ${pageNum}`, pageWidth - 13, pageHeight - 11.5, { align: "right" });
  }
};

// Check if page height exceeds limit and add a new template page if necessary
const checkPageSpace = (doc, title, requiredHeight, state) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxContentY = pageHeight - 22; // Leave space for footer
  
  if (state.y + requiredHeight > maxContentY) {
    doc.addPage();
    state.pageNum += 1;
    drawPageTemplate(doc, title, state.pageNum);
    state.y = 30; // Start below header banner
    return true;
  }
  return false;
};

// Parse explanation text and draw cleanly to PDF, skipping raw markdown indicators
const renderExplanationToPDF = (doc, text, x, state, maxWidth, title) => {
  if (!text) return;
  
  const lines = text.split("\n");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(55, 65, 81); // Slate gray
  
  lines.forEach((line) => {
    let cleanLine = line.trim();
    if (cleanLine === "") {
      checkPageSpace(doc, title, 5, state);
      state.y += 3;
      return;
    }
    
    // Check for bullet list item
    const isBullet = cleanLine.startsWith("* ") || cleanLine.startsWith("- ") || cleanLine.startsWith("• ");
    if (isBullet) {
      cleanLine = cleanLine.replace(/^[\*\-\•]\s*/, "");
    }
    
    // Clean all raw asterisks from text
    cleanLine = cleanLine.replace(/\*/g, "");
    
    const requiredHeight = 8;
    checkPageSpace(doc, title, requiredHeight, state);
    
    if (isBullet) {
      // Draw bullet point dot
      doc.setFillColor(99, 102, 241); // Indigo bullet
      doc.circle(x + 2, state.y - 1.5, 0.75, "F");
      
      const splitText = doc.splitTextToSize(cleanLine, maxWidth - 6);
      doc.text(splitText, x + 6, state.y);
      state.y += splitText.length * 4.5 + 1.5;
    } else {
      const splitText = doc.splitTextToSize(cleanLine, maxWidth);
      doc.text(splitText, x, state.y);
      state.y += splitText.length * 4.5 + 1.5;
    }
  });
};

export const generateImagePDF = async (data) => {
  console.log("PDF DATA:", data);
  const doc = new jsPDF();
  const state = { y: 30, pageNum: 1 };
  const title = "Image Threat Report";
  
  // Set initial page layout
  drawPageTemplate(doc, title, state.pageNum);
  
  // 1. Report Main Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text("Deepfake Image Classification Report", 13, state.y);
  state.y += 8;
  
  // 2. Verdict Banner
  const isFake = data.label && data.label.toLowerCase() === 'fake';
  const labelColor = isFake ? [239, 68, 68] : [16, 185, 129];
  const labelText = isFake ? "CLASSIFICATION: SUSPECTED DEEPFAKE / MANIPULATED" : "CLASSIFICATION: VERIFIED AUTHENTIC / ORIGINAL";
  
  doc.setFillColor(...labelColor);
  doc.rect(13, state.y, 184, 11, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(labelText, 13 + 92, state.y + 7.5, { align: "center" });
  state.y += 18;
  
  // 3. Metadata Grid
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(99, 102, 241);
  doc.text("Analysis Metadata", 13, state.y);
  doc.setDrawColor(229, 231, 235);
  doc.line(13, state.y + 2, 197, state.y + 2);
  state.y += 9;
  
  // Row 1
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  doc.text("File Name:", 13, state.y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(17, 24, 39);
  doc.text(data.fileName, 45, state.y);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(75, 85, 99);
  doc.text("Confidence Score:", 120, state.y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(17, 24, 39);
  
  const formattedConf = typeof data.confidence === "number"
    ? (data.confidence <= 1 ? `${(data.confidence * 100).toFixed(1)}%` : `${data.confidence.toFixed(1)}%`)
    : data.confidence;
  doc.text(formattedConf, 155, state.y);
  state.y += 7;
  
  // Row 2
  doc.setFont("helvetica", "bold");
  doc.setTextColor(75, 85, 99);
  doc.text("Scan Timestamp:", 13, state.y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(17, 24, 39);
  doc.text(new Date().toLocaleString(), 45, state.y);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(75, 85, 99);
  doc.text("Verdict Type:", 120, state.y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...labelColor);
  doc.text(data.label.toUpperCase(), 155, state.y);
  state.y += 14;
  
  // 4. AI Explanation
  if (data.explanation) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(99, 102, 241);
    doc.text("AI Diagnostic Audit", 13, state.y);
    doc.setDrawColor(229, 231, 235);
    doc.line(13, state.y + 2, 197, state.y + 2);
    state.y += 9;
    
    renderExplanationToPDF(doc, data.explanation, 13, state, 184, title);
    state.y += 8;
  }
  
  // 5. Heatmap Visual
  if (data.heatmap) {
    checkPageSpace(doc, title, 105, state);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(99, 102, 241);
    doc.text("AI Attention Heatmap (Grad-CAM)", 13, state.y);
    doc.setDrawColor(229, 231, 235);
    doc.line(13, state.y + 2, 197, state.y + 2);
    state.y += 8;
    
    const base64Img = `data:image/jpeg;base64,${data.heatmap}`;
    const imgWidth = 80;
    const imgHeight = 80;
    const imgX = 13 + (184 - imgWidth) / 2; // centered
    
    doc.addImage(base64Img, "JPEG", imgX, state.y, imgWidth, imgHeight);
    state.y += imgHeight + 10;
  }
  
  doc.save(`${data.fileName.replace(/\.[^/.]+$/, "")}_report.pdf`);
};

export const generateVideoPDF = (data, options) => {
  console.log("PDF DATA:", data);
  const doc = new jsPDF();
  const state = { y: 30, pageNum: 1 };
  const title = "Video Threat Report";
  
  // Set initial page layout
  drawPageTemplate(doc, title, state.pageNum);
  
  // 1. Report Main Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text("Deepfake Video Classification Report", 13, state.y);
  state.y += 8;
  
  // 2. Verdict Banner
  const isFake = data.label && data.label.toLowerCase() === 'fake';
  const labelColor = isFake ? [239, 68, 68] : [16, 185, 129];
  const labelText = isFake ? "CLASSIFICATION: SUSPECTED DEEPFAKE / MANIPULATED" : "CLASSIFICATION: VERIFIED AUTHENTIC / ORIGINAL";
  
  doc.setFillColor(...labelColor);
  doc.rect(13, state.y, 184, 11, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(labelText, 13 + 92, state.y + 7.5, { align: "center" });
  state.y += 18;
  
  // 3. Metadata Grid
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(99, 102, 241);
  doc.text("Analysis Summary", 13, state.y);
  doc.setDrawColor(229, 231, 235);
  doc.line(13, state.y + 2, 197, state.y + 2);
  state.y += 9;
  
  // Row 1
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  doc.text("File Name:", 13, state.y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(17, 24, 39);
  doc.text(data.fileName, 45, state.y);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(75, 85, 99);
  doc.text("Avg Confidence Score:", 120, state.y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(17, 24, 39);
  
  const formattedConf = typeof data.confidence === "number"
    ? (data.confidence <= 1 ? `${(data.confidence * 100).toFixed(1)}%` : `${data.confidence.toFixed(1)}%`)
    : data.confidence;
  doc.text(formattedConf, 160, state.y);
  state.y += 7;
  
  // Row 2
  doc.setFont("helvetica", "bold");
  doc.setTextColor(75, 85, 99);
  doc.text("Scan Timestamp:", 13, state.y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(17, 24, 39);
  doc.text(new Date().toLocaleString(), 45, state.y);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(75, 85, 99);
  doc.text("Final Verdict:", 120, state.y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...labelColor);
  doc.text(data.label.toUpperCase(), 160, state.y);
  state.y += 10;
  
  // 4. Frame Breakdown details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(17, 24, 39);
  
  doc.text(`Total Keyframes Checked: ${data.summary?.total_frames || 0}`, 13, state.y);
  doc.text(`Fake Detections: ${data.summary?.fake_frames || 0}`, 75, state.y);
  doc.text(`Real Detections: ${data.summary?.real_frames || 0}`, 135, state.y);
  state.y += 12;
  
  // 5. Frame List
  const frames = data.frames || [];
  if (frames.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(99, 102, 241);
    doc.text("Keyframe Breakdown", 13, state.y);
    doc.setDrawColor(229, 231, 235);
    doc.line(13, state.y + 2, 197, state.y + 2);
    state.y += 8;
    
    frames.forEach((frame) => {
      let textOffset = 18;
      let textWidth = 174;
      
      if (frame.heatmap) {
        textOffset = 57;
        textWidth = 135;
      }
      
      const cleanExpl = frame.explanation 
        ? frame.explanation.replace(/\*/g, "") 
        : "No diagnostic explanation provided for this frame.";
      const splitText = doc.splitTextToSize(cleanExpl, textWidth - 5);
      
      // Calculate card height dynamically based on explanation lines
      const requiredTextHeight = 17 + (splitText.length * 3.8); // 3.8mm per line of text
      const cardHeight = Math.max(40, requiredTextHeight);
      
      checkPageSpace(doc, title, cardHeight, state);
      
      // Draw Card Outline Border
      doc.setDrawColor(229, 231, 235); 
      doc.setFillColor(249, 250, 251); 
      doc.rect(13, state.y, 184, cardHeight - 4, "FD");
      
      // Draw frame heatmap on the left if present
      if (frame.heatmap) {
        const base64Img = `data:image/jpeg;base64,${frame.heatmap}`;
        doc.addImage(base64Img, "JPEG", 17, state.y + 3, 34, 34);
      }
      
      // Render text parameters
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(17, 24, 39);
      doc.text(`Frame #${frame.frame_id}`, textOffset, state.y + 7.5);
      
      const frameConf = typeof frame.confidence === "number"
        ? (frame.confidence <= 1 ? `${(frame.confidence * 100).toFixed(1)}%` : `${frame.confidence.toFixed(1)}%`)
        : frame.confidence;
        
      const fLabel = frame.label.toUpperCase();
      const isF = frame.label.toLowerCase() === "fake";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      const fColor = isF ? [220, 38, 38] : [5, 150, 105];
      doc.setTextColor(fColor[0], fColor[1], fColor[2]);
      doc.text(`${fLabel} (${frameConf} Confidence)`, textOffset, state.y + 12);
      
      // Explanation description on the card
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(75, 85, 99);
      const explY = state.y + 16.5;
      
      doc.text(splitText, textOffset, explY);
      
      state.y += cardHeight;
    });
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text("No frame breakdowns were generated for this scan.", 13, state.y);
  }
  
  doc.save(`${data.fileName.replace(/\.[^/.]+$/, "")}_report.pdf`);
};
