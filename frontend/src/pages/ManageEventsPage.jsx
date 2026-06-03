import { CalendarDays, Star, Trash2, Users } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import StatusMessage from "../components/StatusMessage.jsx";
import Toast from "../components/Toast.jsx";
import { useCreateEventMutation, useDeleteEventMutation, useGetEventsQuery, useGetVenuesQuery, useUpdateEventMutation } from "../features/api/apiSlice.js";

const initial = {
  title: "",
  category: "Concert",
  description: "",
  image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
  date: "",
  venue: "",
  price: 1000,
  totalTickets: 100,
  ticketTypes: [
    { name: "Regular", price: 1000, capacity: 70, soldTickets: 0 },
    { name: "VIP", price: 2000, capacity: 20, soldTickets: 0 },
    { name: "Student", price: 700, capacity: 10, soldTickets: 0 }
  ],
  bookingLimit: 6,
  status: "published",
  featured: false
};

export default function ManageEventsPage() {
  const [form, setForm] = useState(initial);
  const [editingId, setEditingId] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const { data: events = [] } = useGetEventsQuery();
  const { data: venues = [] } = useGetVenuesQuery();
  const [createEvent, createState] = useCreateEventMutation();
  const [updateEvent, updateState] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const published = events.filter((event) => event.status === "published").length;
  const totalTickets = events.reduce((sum, event) => sum + (event.soldTickets || 0), 0);

  function updateField(event) {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.type === "number" ? Number(event.target.value) : event.target.value;
    setForm({ ...form, [event.target.name]: value });
  }

  function edit(event) {
    setEditingId(event._id);
    setForm({ ...event, venue: event.venue?._id, date: event.date?.slice(0, 16), ticketTypes: event.ticketTypes?.length ? event.ticketTypes : initial.ticketTypes });
  }

  function updateTicketType(index, field, value) {
    const ticketTypes = form.ticketTypes.map((type, currentIndex) => (
      currentIndex === index ? { ...type, [field]: Number(value) } : type
    ));
    const regular = ticketTypes.find((type) => type.name === "Regular");
    setForm({
      ...form,
      ticketTypes,
      price: regular?.price || form.price,
      totalTickets: ticketTypes.reduce((sum, type) => sum + Number(type.capacity || 0), 0)
    });
  }

  async function submit(event) {
    event.preventDefault();
    const payload = {
      ...form,
      price: form.ticketTypes.find((type) => type.name === "Regular")?.price || form.price,
      totalTickets: form.ticketTypes.reduce((sum, type) => sum + Number(type.capacity || 0), 0)
    };
    try {
      if (editingId) await updateEvent({ id: editingId, ...payload }).unwrap();
      else await createEvent(payload).unwrap();
      setToast({ type: "success", message: editingId ? "Eventi u përditësua me sukses." : "Eventi u publikua me sukses." });
      setForm(initial);
      setEditingId("");
    } catch (error) {
      setToast({ type: "error", message: error?.data?.message || "Ruajtja e eventit dështoi." });
    }
  }

  return (
    <section className="studio-page">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="page-heading">
        <div>
          <p className="eyebrow">Studio e organizatorit</p>
          <h1>Menaxhim profesional i eventeve</h1>
          <p className="page-subtitle">Krijo evente, ndrysho publikimin, kontrollo kapacitetin dhe listo performancën në një tabelë operative.</p>
        </div>
      </div>
      <div className="studio-metrics">
        <article><CalendarDays /><span>Evente aktive</span><strong>{published}</strong></article>
        <article><Users /><span>Bileta të shitura</span><strong>{totalTickets}</strong></article>
        <article><Star /><span>Featured</span><strong>{events.filter((event) => event.featured).length}</strong></article>
      </div>
      <div className="manage-grid">
      <form className="panel form-panel" onSubmit={submit}>
        <p className="eyebrow">Event studio</p>
        <h2>{editingId ? "Ndrysho event" : "Krijo event"}</h2>
        <label>Titulli<input name="title" value={form.title} onChange={updateField} required /></label>
        <label>Kategoria<input name="category" value={form.category} onChange={updateField} required /></label>
        <label>Përshkrimi<textarea name="description" rows="3" value={form.description} onChange={updateField} required /></label>
        <label>URL e fotos<input name="image" value={form.image} onChange={updateField} required /></label>
        <label>Data<input name="date" type="datetime-local" value={form.date} onChange={updateField} required /></label>
        <label>Lokacioni<select name="venue" value={form.venue} onChange={updateField} required><option value="">Zgjidh lokacionin</option>{venues.map((venue) => <option key={venue._id} value={venue._id}>{venue.name}</option>)}</select></label>
        <div className="ticket-type-editor">
          {form.ticketTypes.map((type, index) => (
            <article key={type.name}>
              <strong>{type.name}</strong>
              <label>Çmimi<input type="number" value={type.price} onChange={(event) => updateTicketType(index, "price", event.target.value)} /></label>
              <label>Kapaciteti<input type="number" value={type.capacity} onChange={(event) => updateTicketType(index, "capacity", event.target.value)} /></label>
            </article>
          ))}
        </div>
        <label>Limiti i rezervimit<input name="bookingLimit" type="number" min="1" max="20" value={form.bookingLimit} onChange={updateField} /></label>
        <label>Status<select name="status" value={form.status} onChange={updateField}><option value="published">published</option><option value="draft">draft</option><option value="cancelled">cancelled</option></select></label>
        <label className="check-row"><input name="featured" type="checkbox" checked={form.featured} onChange={updateField} /> Shfaq si event kryesor</label>
        <button className="button">{editingId ? "Ruaj" : "Publiko event"}</button>
        <StatusMessage error={createState.error || updateState.error} />
      </form>
      <div className="panel">
        <p className="eyebrow">Inventory</p>
        <h2>Eventet</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Eventi</th><th>Kategoria</th><th>Status</th><th>Bileta</th><th></th></tr></thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id}>
                  <td><button className="link-button" onClick={() => edit(event)}>{event.title}</button></td>
                  <td>{event.category}</td>
                  <td>{event.status}</td>
                  <td>{event.soldTickets}/{event.totalTickets}</td>
                  <td><button className="icon-button danger" onClick={() => setPendingDelete(event)}><Trash2 size={17} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
      <ConfirmDialog
        title={pendingDelete ? "Fshi eventin" : ""}
        message={`Je i sigurt që do të fshish "${pendingDelete?.title}"?`}
        confirmLabel="Fshi"
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          try {
            await deleteEvent(pendingDelete._id).unwrap();
            setToast({ type: "success", message: "Eventi u fshi me sukses." });
            setPendingDelete(null);
          } catch (error) {
            setToast({ type: "error", message: error?.data?.message || "Fshirja e eventit dështoi." });
          }
        }}
      />
    </section>
  );
}
