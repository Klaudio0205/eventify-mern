import { CalendarDays, CircleDollarSign, Download, MapPin, Search, TicketCheck, UserCheck, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import Toast from "../components/Toast.jsx";
import { useGetBookingsQuery, useUpdateBookingMutation } from "../features/api/apiSlice.js";

function money(value = 0) {
  return new Intl.NumberFormat("sq-AL").format(value);
}

function eventDateTime(booking) {
  if (!booking.event?.date) return "Data për t'u konfirmuar";
  const date = new Date(booking.event.date);
  return `${date.toLocaleDateString("sq-AL")} | ${date.toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" })}`;
}

function attendeeNames(booking) {
  if (booking.attendees?.length) return booking.attendees.map((attendee) => attendee.fullName).filter(Boolean);
  if (booking.user?.name) return [booking.user.name];
  return ["Pjesëmarrës"];
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

export default function BookingsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [toast, setToast] = useState(null);
  const [pendingCancel, setPendingCancel] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const { data: bookings = [], isLoading } = useGetBookingsQuery();
  const [updateBooking] = useUpdateBookingMutation();
  const canManage = ["admin", "organizer", "staff"].includes(user?.role);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const haystack = `${booking.event?.title || ""} ${booking.event?.venue?.name || ""} ${booking.user?.name || ""}`.toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());
      const matchesStatus = status === "all" || booking.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [bookings, query, status]);

  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.total || 0), 0);
  const checkedIn = bookings.filter((booking) => booking.status === "checked-in").length;
  const activeBookings = bookings.filter((booking) => booking.status !== "cancelled");

  async function cancelBooking() {
    try {
      await updateBooking({ id: pendingCancel._id, status: "cancelled" }).unwrap();
      setToast({ type: "success", message: "Rezervimi u anulua me sukses." });
      setPendingCancel(null);
    } catch (error) {
      setToast({ type: "error", message: error?.data?.message || "Anulimi dështoi." });
    }
  }

  function printTicket(booking) {
    const printWindow = window.open("", "_blank", "width=860,height=960");
    if (!printWindow) {
      setToast({ type: "error", message: "Lejo pop-ups në browser për të printuar biletën." });
      return;
    }

    const names = attendeeNames(booking);
    const seats = booking.selectedSeats?.length ? booking.selectedSeats.join(", ") : "-";
    const venue = booking.event?.venue?.name || "Lokacioni TBD";
    const city = booking.event?.venue?.city || booking.event?.city || "";

    printWindow.document.write(`<!doctype html>
      <html>
        <head>
          <title>Biletë Eventify - ${escapeHtml(booking.ticketCode)}</title>
          <style>
            * { box-sizing: border-box; }
            body { background: #eef6f4; color: #13201f; font-family: Arial, sans-serif; margin: 0; padding: 28px; }
            .ticket { background: #fff; border: 1px solid #d9e6e1; border-radius: 14px; margin: 0 auto; max-width: 760px; overflow: hidden; }
            .head { background: #102624; color: #fff; padding: 24px; }
            .head span { color: #f7c948; font-size: 13px; font-weight: 800; text-transform: uppercase; }
            h1 { font-size: 30px; margin: 8px 0 0; }
            .body { display: grid; gap: 18px; padding: 24px; }
            .grid { display: grid; gap: 12px; grid-template-columns: 1fr 1fr; }
            .field { background: #f4f8f7; border: 1px solid #d9e6e1; border-radius: 10px; padding: 12px; }
            .field span { color: #60706d; display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; }
            .field strong { display: block; margin-top: 5px; }
            .names { margin: 0; padding-left: 18px; }
            .code { font-family: Consolas, monospace; overflow-wrap: anywhere; }
            @media print {
              body { background: #fff; padding: 0; }
              .ticket { border-radius: 0; max-width: none; }
            }
          </style>
        </head>
        <body>
          <main class="ticket">
            <section class="head">
              <span>Eventify Digital Ticket</span>
              <h1>${escapeHtml(booking.event?.title || "Event")}</h1>
            </section>
            <section class="body">
              <div>
                <div class="grid">
                  <div class="field"><span>Data / ora</span><strong>${escapeHtml(eventDateTime(booking))}</strong></div>
                  <div class="field"><span>Venue</span><strong>${escapeHtml(`${venue}${city ? `, ${city}` : ""}`)}</strong></div>
                  <div class="field"><span>Tipi</span><strong>${escapeHtml(booking.ticketType)}</strong></div>
                  <div class="field"><span>Sasia</span><strong>${escapeHtml(booking.quantity)}</strong></div>
                  <div class="field"><span>Vendet</span><strong>${escapeHtml(seats)}</strong></div>
                  <div class="field"><span>Total</span><strong>${escapeHtml(`${money(booking.totalPrice || booking.total)} ALL`)}</strong></div>
                </div>
                <div class="field" style="margin-top:12px">
                  <span>Emrat në biletë</span>
                  <ol class="names">${names.map((name) => `<li>${escapeHtml(name)}</li>`).join("")}</ol>
                </div>
                <div class="field" style="margin-top:12px">
                  <span>Kodi i biletës</span>
                  <strong class="code">${escapeHtml(booking.ticketCode)}</strong>
                </div>
              </div>
            </section>
          </main>
          <script>
            window.addEventListener("load", function () {
              setTimeout(function () { window.print(); }, 450);
            });
          </script>
        </body>
      </html>`);
    printWindow.document.close();
    printWindow.focus();
  }

  return (
    <section className="tickets-page">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="page-heading">
        <div>
          <p className="eyebrow">{canManage ? "Menaxhim hyrjesh" : "Biletat e mia"}</p>
          <h1>{canManage ? "Rezervime dhe check-in" : "Biletat e mia aktive"}</h1>
          <p className="page-subtitle">
            {canManage
              ? "Kontrollo rezervimet, pagesat dhe hyrjet nga një panel i vetëm me filtra dhe ndryshim statusi."
              : "Ruaj kodin e biletës, kontrollo vendet dhe menaxho rezervimet aktive."}
          </p>
        </div>
      </div>

      <div className="ticket-toolbar">
        <div className="ticket-metrics">
          <article><TicketCheck /><span>{canManage ? "Rezervime" : "Aktive"}</span><strong>{canManage ? bookings.length : activeBookings.length}</strong></article>
          <article><UserCheck /><span>Check-in</span><strong>{checkedIn}</strong></article>
          <article><CircleDollarSign /><span>Totali</span><strong>{money(totalRevenue)} ALL</strong></article>
        </div>
        <div className="filters-row">
          <label className="search-box"><Search size={18} /><input placeholder="Kërko event, klient ose lokacion" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">Të gjitha statuset</option>
            <option value="reserved">reserved</option>
            <option value="paid">paid</option>
            <option value="checked-in">checked-in</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
      </div>

      {isLoading && <LoadingState label="Duke ngarkuar biletat..." rows={3} />}
      {!isLoading && filteredBookings.length === 0 && (
        <EmptyState title="Nuk ke bileta aktive" message="Kur të rezervosh një event, bileta do të shfaqet këtu me kodin dhe detajet e hyrjes." />
      )}

      <div className="ticket-grid">
        {filteredBookings.map((booking) => (
          <article className="ticket-card" key={booking._id}>
            <div className="ticket-main">
              <span className={`status ${booking.status}`}>{booking.status}</span>
              <h2>{booking.event?.title}</h2>
              <p><MapPin size={15} /> {booking.event?.venue?.name || "Lokacioni TBD"}</p>
              <p><CalendarDays size={15} /> {new Date(booking.event?.date).toLocaleDateString()} | {new Date(booking.event?.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
              <div className="ticket-details">
                <span>{booking.ticketType}</span>
                {booking.selectedSeats?.length > 0 && <span>{booking.selectedSeats.join(", ")}</span>}
                <span>{booking.quantity} bileta</span>
                <span>{money(booking.totalPrice || booking.total)} ALL</span>
              </div>
              <div className="ticket-attendees">
                <span>Emrat në biletë</span>
                <div>
                  {attendeeNames(booking).map((name, index) => (
                    <strong key={`${booking._id}-${name}-${index}`}>{booking.selectedSeats?.[index] ? `${name} - ${booking.selectedSeats[index]}` : name}</strong>
                  ))}
                </div>
              </div>
              <div className="ticket-code-line">
                <span>Kodi i biletës</span>
                <strong>{booking.ticketCode}</strong>
              </div>
              {canManage && <p>Klienti: {booking.user?.name}</p>}
              {!canManage && (
                <div className="ticket-actions">
                  <button className="button secondary" onClick={() => printTicket(booking)} type="button"><Download size={17} /> Shkarko / printo biletën</button>
                  {booking.status !== "cancelled" && (
                    <button className="button danger" onClick={() => setPendingCancel(booking)} type="button"><XCircle size={17} /> Anulo rezervimin</button>
                  )}
                </div>
              )}
            </div>
            <div className="ticket-side">
              <span>Kodi i biletës</span>
              <strong>{booking.ticketCode}</strong>
              {canManage && (
                <select value={booking.status} onChange={(event) => updateBooking({ id: booking._id, status: event.target.value })}>
                  <option value="reserved">reserved</option>
                  <option value="paid">paid</option>
                  <option value="checked-in">checked-in</option>
                  <option value="cancelled">cancelled</option>
                </select>
              )}
            </div>
          </article>
        ))}
      </div>
      <ConfirmDialog
        title={pendingCancel ? "Anulo rezervimin" : ""}
        message={`Je i sigurt që do të anulosh biletën për "${pendingCancel?.event?.title}"?`}
        confirmLabel="Anulo"
        onCancel={() => setPendingCancel(null)}
        onConfirm={cancelBooking}
      />
    </section>
  );
}
