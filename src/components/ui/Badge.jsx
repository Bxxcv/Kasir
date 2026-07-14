import './Badge.css';

// tone: neutral | success | danger | warning | info
export default function Badge({ children, tone = 'neutral', stamp = false }) {
  return (
    <span className={`badge badge--${tone} ${stamp ? 'badge--stamp' : ''}`}>
      {children}
    </span>
  );
}
