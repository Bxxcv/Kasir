import './Skeleton.css';

export default function Skeleton({ width = '100%', height = '14px', radius = 'var(--r-sm)', style }) {
  return (
    <span
      className="skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}
