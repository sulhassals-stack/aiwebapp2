interface FeatureCardProps {
  title: string;
  status: string;
  isGlow?: boolean;
}

export default function FeatureCard({ title, status, isGlow }: FeatureCardProps) {
  return (
    <div className={`ux-card ${isGlow ? "ux-card-glow" : ""}`}>
      <span className="ux-eyebrow">{title}</span>
      <h2>{status}</h2>
    </div>
  );
}