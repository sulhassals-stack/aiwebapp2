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


export function DetectionPanel() {
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
   const [detections, setDetections] = useState<Detection[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [hasAnalyzed, setHasAnalyzed] = useState (false);


   // B7.2 เพิ่ม useEffect สำหรับจัดการ Preview URL ก่อน handleFileChange()
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
           const formData = new FormData();//สร้างฟรอมเพื่อที่จะส่งไปยังflask
           formData.append("image", selectedFile);


           const response = await fetch("http://127.0.0.1:5000/predict", {
               method: "POST",
               body: formData,
           });


           if (!response.ok) {
               throw new Error("Detection failed");
           }


           const data = await response.json();
           setDetections(data.detected_objects);//เอาข้อมูลdetected_objectsมาใส่ในdatacแล้วเก็บไว้ในsetDetections
       } catch (error) {
           setError("Cannot detect objects");
       } finally {
           setLoading(false);
       }
   }


   return (
       <section className="ux-card ux-detection">
           <div className="ux-section-heading">
               <p className="ux-eyebrow">ภาพที่จับได้</p>
               <h2>อัปโหลดภาพในสวนของคุณ</h2>
               <p className="ux-muted">
                   Upload an image to identify objects using the YOLO model.
               </p>
           </div>


           {/* Upload, Preview and Result */}
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
                   <img src={previewUrl} alt="Selected image preview" /> {/*แสดงภาพ*/}
               </div>
           )}
           <button
               type="button"
               className="ux-button"
               onClick={detectObjects}
               disabled={!selectedFile || loading}
           >
               {loading
                   ? "กำลังค้นหา"
                   : "ค้นหา"}
           </button>
           {/* แจ้งเตือนกรณีเกิดข้อผิดพลาด */}
{error && (
  <div className="ux-error" role="alert">
    ⚠️ {error}
  </div>
)}

{/* 🌟 กล่องแสดงสรุปจำนวนนกบุกรุก (เพิ่มส่วนนี้) */}
{detections && detections.length > 0 ? (
  <div className="ux-summary-badge">
    <span>🚨</span>
    <span>
      ตรวจพบนกบุกรุกทั้งหมด <strong>{detections.length}</strong> ตัว
    </span>
  </div>
) : (
  selectedFile && !loading && detections.length === 0 && (
    <div className="ux-summary-badge ux-summary-clean">
      <span>✅</span>
      <span>ไม่พบนกบุกรุกในภาพนี้</span>
    </div>
  )
)}
           {error && (
               <div
                   className="ux-error"
                   role="alert"
               >
                   {error}
               </div>
           )}
           <div className="ux-results">
               {detections.map((item, index) => (
                   <article
                       className="ux-result-item"
                       key={index}
                   >
                       <strong>{item.class}</strong>
                       <p>
                           Confidence: {item.confidence}%
                       </p><div className="ux-confidence-track">
                           <div
                               className="ux-confidence-fill"
                               style={{
                                   width: `${Math.max(
                                       0,
                                       Math.min(
                                           100,
                                           item.confidence
                                       )
                                   )
                                       }%`,
                               }}
                           />
                       </div>
                   </article>
               ))}
           </div>
       </section>
   );
}

