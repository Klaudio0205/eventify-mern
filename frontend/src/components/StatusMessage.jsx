export default function StatusMessage({ error, success }) {
  if (!error && !success) return null;
  return <p className={error ? "alert error" : "alert success"}>{error?.data?.message || error?.error || success}</p>;
}
