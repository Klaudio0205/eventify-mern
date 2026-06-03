export default function EmptyState({ title = "Nuk ka të dhëna", message = "Provo të ndryshosh filtrat ose të shtosh një rekord të ri.", action }) {
  return (
    <div className="state-box empty">
      <strong>{title}</strong>
      <p>{message}</p>
      {action}
    </div>
  );
}
