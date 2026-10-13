"use client";
import { useEffect, useState } from "react";

type Detection = {
  class: string;
  confidence: number;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
};

// 🌟 ตารางแปลภาษา (วางไว้นอก Component ด้านบนสุด)
const birdTranslation: Record<string, string> = {
  bird: "นกพิราบ", // เปลี่ยนคำแปลจาก "นกทั่วไป" เป็น "นกพิราบ"

};

export function DetectionPanel() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedFile(file);
      setDetections([]);
      setHasAnalyzed(false);
      setError("");
    }
  }

  async function detectObjects() {
    if (!selectedFile) {
      setError("Please select an image");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Detection failed");
      }

      const data = await response.json();
      setDetections(data.detected_objects);
      setHasAnalyzed(true);
    } catch (error) {
      setError("Cannot detect objects");
    } finally {
      setLoading(false);
    }
  }

  // 1. กรองเฉพาะนกที่มี Confidence > 60%
  const birdIntruders = detections
    ? detections.filter(
        (item) => item.class.toLowerCase() === "bird" && item.confidence > 60
      )
    : [];

  // 2. ดึงชนิดนกที่ไม่ซ้ำกัน พร้อมแปลชื่อ
  const birdTypesList = Array.from(
    new Set(
      birdIntruders.map(
        (item) => birdTranslation[item.class.toLowerCase()] || item.class
      )
    )
  ).join(", ");

  return (
    <section className="ux-card ux-card-glow">
      <div className="ux-section-heading">
        <p className="ux-eyebrow">ภาพที่จับได้</p>
        <h2>อัปโหลดภาพในสวนของคุณ</h2>
        <p className="ux-muted">
          Upload an image to identify objects using the YOLO model.
        </p>
      </div>

      {/* Upload & Preview */}
      <div className="ux-upload">
        <label className="ux-file-button">
          <input
            className="ux-file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
          />
          <span>เลือกภาพ</span>
        </label>
        <span className="ux-file-name">
          {selectedFile ? selectedFile.name : "No image selected"}
        </span>
      </div>

      {previewUrl && (
        <div className="ux-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Selected image preview" />
        </div>
      )}

      <button
        type="button"
        className="ux-button"
        onClick={detectObjects}
        disabled={!selectedFile || loading}
      >
        {loading ? "กำลังค้นหา..." : "ค้นหา"}
      </button>

      {/* แจ้งเตือนข้อผิดพลาด */}
      {error && (
        <div className="ux-error" role="alert">
          ⚠️ {error}
        </div>
      )}

      {/* กล่องสรุปผลนกบุกรุก */}
      {hasAnalyzed && (
        birdIntruders.length > 0 ? (
          <div
            className="ux-summary-badge"
            style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🚨</span>
              <span>
                ตรวจพบผู้บุกรุกทั้งหมด <strong>{birdIntruders.length}</strong> ตัว
              </span>
            </div>
            <div style={{ fontSize: "13px", fontWeight: "normal", color: "#b91c1c", paddingLeft: "28px" }}>
              ชนิดนกที่พบ: <strong>{birdTypesList}</strong>
            </div>
          </div>
        ) : (
          <div className="ux-summary-badge ux-summary-clean">
            <span>✅</span>
            <span>ไม่พบผู้บุกรุก</span>
          </div>
        )
      )}

      {/* รายการแสดงวัตถุทั้งหมด */}
      <div className="ux-results">
        {detections.map((item, index) => (
          <article className="ux-result-item" key={index}>
            <strong>
              {birdTranslation[item.class.toLowerCase()] || item.class}
            </strong>
            <p>Confidence: {item.confidence}%</p>
            <div className="ux-confidence-track">
              <div
                className="ux-confidence-fill"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, item.confidence)
                  )}%`,
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}