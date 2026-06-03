export default function Toast({ message, type = "success", onClose }) {
  if (!message) return null;

  return (
    <div className={`toast ${type}`} role="status">
      <span>{message}</span>
      <button aria-label="Mbyll njoftimin" onClick={onClose}>×</button>
    </div>
  );
}
