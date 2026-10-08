import { AppHeader } from "@/components/AppHeader";
import { DetectionPanel } from "@/components/DetectionPanel";
import { ApiStatus } from "@/components/ ApiStatus";
import Link from "next/link";
export default function Home() {
  return (
    <main className="ux-shell">
      {/* ส่วนหัวแสดงชื่อระบบและสถานะหลัก */}
      <AppHeader />

    <div className="ux-status-grid">
      {/* การ์ดสถานะการสแกน */}
      <div className="ux-card">
        <span className="ux-eyebrow">SCAN STATUS</span>
        <h2>เริ่มตรวจจับ...</h2>
      </div>

      {/* การ์ดสถานะการทำงาน ( Active / Glow ) */}
      <div className="ux-card ux-card-glow">
        <span className="ux-eyebrow">OPERATION MODE</span>
        <h2>เปิดใช้งาน (Active)</h2>
      </div>
    </div>
  

      <section className="ux-detection">
        <DetectionPanel />
      </section>

      {/* การ์ดทางลัดไปหน้าประวัติบันทึกการบุกรุก */}
      <section className="sp-home-card">
        <div>
          <p className="sp-home-eyebrow">INTRUSION LOGS</p>
          <h2>บันทึกและประวัติการตรวจพบนก</h2>
          <p>ดูรายการนกที่บุกรุกย้อนหลัง พร้อมจัดการข้อมูลการแจ้งเตือน</p>
        </div>
        <Link href="/saved-prompts" className="sp-home-link">
          ดูประวัติทั้งหมด →
        </Link>
      </section>

      {/* ส่วนตรวจสอบสถานะการเชื่อมต่อกับ Server/Backend */}
      <div className="ux-status">
        <ApiStatus />
        
      </div>
    </main>
  );
}