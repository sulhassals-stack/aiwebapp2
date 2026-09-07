import { AppHeader }from "@/components/AppHeader";
import { FeatureCard }from "@/components/FeatureCard";
import { DetectionPanel } from "@/components/DetectionPanel";
import { ApiStatus } from "@/components/ ApiStatus";
export default function Home() {
  return (
    <main>
      <AppHeader />
      <br></br>
      <FeatureCard
        title="Object Detection"
        description="ตรวจจับวัตถุจากรูปภาพด้วย AI"
      />
      <br></br>
      <FeatureCard
        title="AI Chat"
        description="สนทนากับ genetive AI"
      />
      <br></br>
      
      <DetectionPanel />
      <br></br>
      <ApiStatus />


    </main>
  );
}
