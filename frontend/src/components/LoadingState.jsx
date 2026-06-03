export default function LoadingState({ label = "Duke u ngarkuar...", rows = 3, variant = "cards" }) {
  return (
    <div className="state-box">
      <div className={`skeleton-stack ${variant}`}>
        {Array.from({ length: rows }, (_, index) => (
          <span className="skeleton-line" key={index} />
        ))}
      </div>
      <strong>{label}</strong>
    </div>
  );
}
