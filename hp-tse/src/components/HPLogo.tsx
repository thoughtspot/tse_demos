import logoUrl from '../assets/hp-logo.png';

interface Props {
  className?: string;
  size?: number;
  wordmark?: boolean;
}

export default function HPLogo({ className, size = 26 }: Props) {
  return (
    <span
      className={`sl-logo ${className ?? ''}`}
      style={{ display: 'flex', alignItems: 'center', gap: 10 }}
      role="img"
      aria-label="HP Instant Insights"
    >
      <img src={logoUrl} style={{ height: size, width: 'auto' }} alt="HP" />
      <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: -0.3, color: 'var(--sl-evergreen)' }}>
        HP Instant Insights
      </span>
    </span>
  );
}
