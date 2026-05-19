import jsPDF from "jspdf";

export const generateImagePDF = async (data) => {
  console.log("PDF DATA:", data);
  const doc = new jsPDF();

  let y = 10;

  doc.setFontSize(18);
  doc.text("Deepfake Image Report", 10, y);
  y += 10;

  doc.setFontSize(12);
  doc.text(`File: ${data.fileName}`, 10, y);
  y += 8;

  doc.text(`Label: ${data.label}`, 10, y);
  y += 8;

  doc.text(`Confidence: ${data.confidence}`, 10, y);
  y += 10;

  // Explanation
  if (data.explanation) {
    doc.text("Explanation:", 10, y);
    y += 8;

    const splitText = doc.splitTextToSize(data.explanation, 180);
    doc.text(splitText, 10, y);
    y += splitText.length * 6;
  }

  // Heatmap
  if (data.heatmap) {
    if (y > 180) {
      doc.addPage();
      y = 20;
    } else {
      y += 10;
    }
    doc.text("Heatmap:", 10, y);
    y += 5;

    const base64Img = `data:image/jpeg;base64,${data.heatmap}`;
    doc.addImage(base64Img, "JPEG", 10, y, 100, 100);
    y += 110;
  }

  doc.save("image_report.pdf");
};

export const generateVideoPDF = (data, options) => {
  console.log("PDF DATA:", data);
  const doc = new jsPDF();

  let y = 10;

  doc.setFontSize(18);
  doc.text("Deepfake Video Report", 10, y);
  y += 10;

  doc.setFontSize(12);
  doc.text(`File: ${data.fileName}`, 10, y);
  y += 8;

  doc.text(`Final Label: ${data.label}`, 10, y);
  y += 8;

  doc.text(`Confidence: ${data.confidence}`, 10, y);
  y += 10;

  doc.text("Summary:", 10, y);
  y += 8;

  doc.text(`Total Frames: ${data.summary?.total_frames}`, 10, y);
  y += 6;

  doc.text(`Fake Frames: ${data.summary?.fake_frames}`, 10, y);
  y += 6;

  doc.text(`Real Frames: ${data.summary?.real_frames}`, 10, y);
  y += 10;

  const frames = data.frames || [];
  console.log("Frames:", frames);

  if (frames.length === 0) {
    doc.text("No frame analysis available", 10, y);
  } else {
    doc.text("Frame Analysis:", 10, y);
    y += 10;

    frames.forEach((frame, index) => {
      console.log("Rendering frame:", frame);

      if (y > 250) {
        doc.addPage();
        y = 10;
      }

      doc.text(`Frame ${frame.frame_id}`, 10, y);
      y += 6;

      doc.text(`Label: ${frame.label}`, 10, y);
      y += 6;

      doc.text(`Confidence: ${frame.confidence}`, 10, y);
      y += 10;

      if (frame.explanation) {
        const splitText = doc.splitTextToSize(frame.explanation, 180);
        doc.text(splitText, 10, y);
        y += splitText.length * 6;
      } else {
        doc.text("No explanation available", 10, y);
        y += 6;
      }

      if (frame.heatmap) {
        if (y > 200) {
          doc.addPage();
          y = 10;
        }
        const base64Img = `data:image/jpeg;base64,${frame.heatmap}`;
        doc.addImage(base64Img, "JPEG", 10, y, 80, 80);
        y += 85;
      } else {
        doc.text("No heatmap available", 10, y);
        y += 6;
      }

      y += 10; // Padding before next frame
    });
  }

  doc.save("video_report.pdf");
};
