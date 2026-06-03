export default function ConfirmDialog({ confirmLabel = "Konfirmo", message, onCancel, onConfirm, title }) {
  if (!title) return null;

  return (
    <div className="modal-backdrop">
      <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="button secondary" onClick={onCancel} type="button">Anulo</button>
          <button className="button danger" onClick={onConfirm} type="button">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
