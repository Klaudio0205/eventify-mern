import { useState } from "react";
import StatusMessage from "../components/StatusMessage.jsx";
import Toast from "../components/Toast.jsx";
import { useCreateVenueMutation, useGetVenuesQuery } from "../features/api/apiSlice.js";

const initial = { name: "", city: "Tiranë", address: "", capacity: 100, type: "Hall" };

export default function VenuesPage() {
  const [form, setForm] = useState(initial);
  const [toast, setToast] = useState(null);
  const { data: venues = [] } = useGetVenuesQuery();
  const [createVenue, state] = useCreateVenueMutation();

  function updateField(event) {
    const value = event.target.type === "number" ? Number(event.target.value) : event.target.value;
    setForm({ ...form, [event.target.name]: value });
  }

  async function submit(event) {
    event.preventDefault();
    try {
      await createVenue(form).unwrap();
      setForm(initial);
      setToast({ type: "success", message: "Lokacioni u shtua me sukses." });
    } catch (error) {
      setToast({ type: "error", message: error?.data?.message || "Lokacioni nuk u shtua." });
    }
  }

  return (
    <section className="manage-grid">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <form className="panel form-panel" onSubmit={submit}>
        <p className="eyebrow">Lokacione</p>
        <h2>Shto lokacion</h2>
        <label>Emri<input name="name" value={form.name} onChange={updateField} required /></label>
        <label>Qyteti<input name="city" value={form.city} onChange={updateField} required /></label>
        <label>Adresa<input name="address" value={form.address} onChange={updateField} required /></label>
        <label>Kapaciteti<input name="capacity" type="number" value={form.capacity} onChange={updateField} required /></label>
        <label>Tipi<input name="type" value={form.type} onChange={updateField} /></label>
        <button className="button">Shto lokacion</button>
        <StatusMessage error={state.error} />
      </form>
      <div className="venue-grid">
        {venues.map((venue) => (
          <article className="panel" key={venue._id}>
            <h2>{venue.name}</h2>
            <p>{venue.address}, {venue.city}</p>
            <strong>{venue.capacity} vende</strong>
            <span>{venue.type}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
