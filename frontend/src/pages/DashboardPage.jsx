import { BarChart3, CalendarDays, CircleDollarSign, Crown, Download, Flame, Layers, Ticket, UserCheck, Users } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import Toast from "../components/Toast.jsx";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useGetDashboardQuery,
  useGetEventAttendeesQuery,
  useGetEventsQuery,
  useGetUsersQuery,
  useUpdateCategoryMutation,
  useUpdateBookingMutation,
  useUpdateEventMutation,
  useUpdateUserMutation
} from "../features/api/apiSlice.js";

function money(value = 0) {
  return new Intl.NumberFormat("sq-AL").format(value);
}

function percent(value = 0, total = 1) {
  return Math.min(Math.round((value / Math.max(total, 1)) * 100), 100);
}

function downloadCsv(rows, filename) {
  const header = ["Name", "Email", "Attendee Names", "Event", "Ticket Type", "Selected Seats", "Quantity", "Status", "Ticket Code"];
  const body = rows.map((row) => [
    row.name,
    row.email,
    (row.attendees || []).map((attendee) => attendee.fullName).join(" | "),
    row.event,
    row.ticketType,
    (row.selectedSeats || []).join(" "),
    row.quantity,
    row.status,
    row.ticketCode
  ]);
  const csv = [header, ...body]
    .map((line) => line.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function DashboardPage() {
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === "admin";
  const { data: dashboard = {}, isLoading } = useGetDashboardQuery();
  const { data: users = [] } = useGetUsersQuery(undefined, { skip: !isAdmin });
  const { data: events = [] } = useGetEventsQuery("?limit=100");
  const { data: categories = [] } = useGetCategoriesQuery();
  const [updateUser] = useUpdateUserMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [updateBooking, { isLoading: isCheckingIn }] = useUpdateBookingMutation();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "", description: "" });
  const [pendingCategory, setPendingCategory] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [toast, setToast] = useState(null);

  const dashboardEvents = isAdmin ? events : dashboard.myEvents || [];
  const activeEventId = selectedEventId || dashboardEvents[0]?._id || "";
  const activeEvent = dashboardEvents.find((event) => event._id === activeEventId);
  const {
    data: eventAttendeesData = { attendees: [] },
    isFetching: isLoadingAttendees
  } = useGetEventAttendeesQuery(activeEventId, { skip: !activeEventId || (!isAdmin && user?.role !== "organizer") });
  const bookings = dashboard.bookings || [];
  const attendees = dashboard.attendees || [];
  const eventAttendees = eventAttendeesData.attendees || [];
  const bookingsByEvent = bookings.reduce((map, booking) => {
    const eventId = booking.event?._id || booking.event;
    if (!eventId) return map;
    map.set(String(eventId), (map.get(String(eventId)) || 0) + 1);
    return map;
  }, new Map());
  const activeEventBookings = bookingsByEvent.get(String(activeEventId)) || 0;
  const paid = bookings.filter((booking) => booking.status === "paid").length;
  const reserved = bookings.filter((booking) => booking.status === "reserved").length;
  const checkedIn = bookings.filter((booking) => booking.status === "checked-in").length;
  const popularCategories = dashboard.popularCategories || [];
  const topOrganizers = dashboard.topOrganizers || [];
  const recentBookings = dashboard.recentBookings || [];
  const maxCategoryTickets = Math.max(...popularCategories.map((category) => category.soldTickets || 0), 1);
  const maxOrganizerRevenue = Math.max(...topOrganizers.map((organizer) => organizer.revenue || 0), 1);

  if (isLoading) return <LoadingState label="Duke ngarkuar dashboard-in..." rows={4} />;

  async function saveCategory(event) {
    event.preventDefault();
    try {
      await createCategory({
        ...categoryForm,
        slug: categoryForm.slug || categoryForm.name.toLowerCase().replaceAll(" ", "-")
      }).unwrap();
      setCategoryForm({ name: "", slug: "", description: "" });
      setToast({ type: "success", message: "Kategoria u shtua me sukses." });
    } catch (error) {
      setToast({ type: "error", message: error?.data?.message || "Kategoria nuk u shtua." });
    }
  }

  async function checkInAttendee(bookingId) {
    try {
      await updateBooking({ id: bookingId, status: "checked-in" }).unwrap();
      setToast({ type: "success", message: "Check-in u regjistrua me sukses." });
    } catch (error) {
      setToast({ type: "error", message: error?.data?.message || "Check-in dështoi." });
    }
  }

  const csvName = `${(activeEvent?.title || "eventify-event").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "eventify-event"}-attendees.csv`;

  return (
    <section className="dashboard">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="dashboard-hero panel">
        <div>
          <p className="eyebrow">{isAdmin ? "Paneli i adminit" : "Paneli i organizatorit"}</p>
          <h1>{isAdmin ? "Menaxhim global i platformës Eventify." : "Eventet e mia, rezervimet dhe pjesëmarrësit në një panel."}</h1>
        </div>
        <div className="hero-kpi">
          <span>Të ardhura</span>
          <strong>{money(dashboard.revenue)} ALL</strong>
        </div>
      </div>

      <div className="stats-grid">
        {isAdmin && <article><Users /><span>Total Users</span><strong>{dashboard.users || users.length}</strong></article>}
        <article><CalendarDays /><span>Total Events</span><strong>{dashboard.events || dashboardEvents.length}</strong></article>
        <article><Ticket /><span>Total Bookings</span><strong>{dashboard.totalBookings || 0}</strong></article>
        <article><CircleDollarSign /><span>Revenue</span><strong>{money(dashboard.revenue)} ALL</strong></article>
        {isAdmin && <article><Flame /><span>Sold Out Events</span><strong>{dashboard.soldOutEvents || 0}</strong></article>}
        {!isAdmin && <article><UserCheck /><span>Bileta të shitura</span><strong>{dashboard.tickets || 0}</strong></article>}
      </div>

      {isAdmin && (
        <div className="admin-analytics-grid">
          <div className="panel admin-chart-card">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Popular Categories</p>
                <h2>Kategoritë me shitje më të larta</h2>
              </div>
              <BarChart3 />
            </div>
            <div className="chart-list">
              {popularCategories.length === 0 && <EmptyState title="Nuk ka kategori popullore" message="Kur të ketë evente dhe shitje, grafiku do të plotësohet këtu." />}
              {popularCategories.map((category) => (
                <article key={category.name}>
                  <div>
                    <strong>{category.name || "Pa kategori"}</strong>
                    <span>{category.soldTickets || 0} bileta nga {category.events || 0} evente</span>
                  </div>
                  <div className="bar-track">
                    <i style={{ width: `${percent(category.soldTickets, maxCategoryTickets)}%` }} />
                  </div>
                  <b>{percent(category.soldTickets, maxCategoryTickets)}%</b>
                </article>
              ))}
            </div>
          </div>

          <div className="panel admin-chart-card">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Top Organizers</p>
                <h2>Organizatorët me performancën më të mirë</h2>
              </div>
              <Crown />
            </div>
            <div className="leaderboard-list">
              {topOrganizers.length === 0 && <EmptyState title="Nuk ka organizator aktiv" message="Rezervimet do të krijojnë renditje automatikisht." />}
              {topOrganizers.map((organizer, index) => (
                <article key={organizer.organizerId || organizer.email}>
                  <span className="rank-badge">{index + 1}</span>
                  <div>
                    <strong>{organizer.name}</strong>
                    <small>{organizer.email}</small>
                    <div className="bar-track compact">
                      <i style={{ width: `${percent(organizer.revenue, maxOrganizerRevenue)}%` }} />
                    </div>
                  </div>
                  <div className="leaderboard-metric">
                    <strong>{money(organizer.revenue)} ALL</strong>
                    <span>{organizer.tickets} bileta</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="panel admin-recent-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Rezervimet e fundit</p>
                <h2>Rezervimet e fundit në platformë</h2>
              </div>
              <BarChart3 />
            </div>
            <div className="table-wrap">
              {recentBookings.length === 0 && <EmptyState title="Nuk ka rezervime" message="Rezervimet e fundit do të shfaqen në këtë tabelë." />}
              <table>
                <thead><tr><th>Klienti</th><th>Eventi</th><th>Tipi</th><th>Sasia</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>
                        <strong>{booking.customer}</strong>
                        <span className="muted-cell">{booking.email}</span>
                      </td>
                      <td>{booking.event}</td>
                      <td>{booking.ticketType}</td>
                      <td>{booking.quantity}</td>
                      <td>{money(booking.total)} ALL</td>
                      <td><span className={`status ${booking.status}`}>{booking.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      <div className="analytics-grid">
        <div className="panel">
          <p className="eyebrow">Statuset</p>
          <h2>Konvertimi i biletave</h2>
          <div className="donut-wrap">
            <div className="donut-chart" />
            <div className="legend">
              <span><i className="paid" /> Paguar: {paid}</span>
              <span><i className="reserved" /> Reserved: {reserved}</span>
              <span><i className="checked" /> Checked-in: {checkedIn}</span>
            </div>
          </div>
        </div>
        <div className="panel">
          <p className="eyebrow">{isAdmin ? "Eventet e platformës" : "Eventet e mia"}</p>
          <h2>Kapaciteti dhe shitjet</h2>
          <div className="capacity-list">
            {dashboardEvents.slice(0, 5).map((event) => (
              <article key={event._id}>
                <strong>{event.title}</strong>
                <span>{event.soldTickets}/{event.totalTickets} bileta</span>
                <div><i style={{ width: `${Math.min((event.soldTickets / event.totalTickets) * 100, 100)}%` }} /></div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="panel organizer-event-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Akses organizatori</p>
            <h2>Pjesëmarrës sipas eventit</h2>
          </div>
          <button
            className="button secondary"
            disabled={!eventAttendees.length}
            onClick={() => downloadCsv(eventAttendees, csvName)}
          >
            <Download size={17} /> Eksporto CSV
          </button>
        </div>

        {dashboardEvents.length === 0 ? (
          <EmptyState title="Nuk ka evente" message="Organizatori nuk ka krijuar ende evente për të menaxhuar pjesëmarrësit." />
        ) : (
          <>
            <div className="event-switcher" aria-label="Zgjidh eventin">
              {dashboardEvents.map((event) => (
                <button
                  className={event._id === activeEventId ? "active" : ""}
                  key={event._id}
                  onClick={() => setSelectedEventId(event._id)}
                  type="button"
                >
                  <strong>{event.title}</strong>
                  <span>{bookingsByEvent.get(String(event._id)) || 0} rezervime · {event.soldTickets || 0}/{event.totalTickets || event.capacity || 0} bileta</span>
                </button>
              ))}
            </div>

            <div className="attendee-summary">
              <article>
                <span>Eventi aktiv</span>
                <strong>{activeEvent?.title}</strong>
              </article>
              <article>
                <span>Rezervime</span>
                <strong>{activeEventBookings}</strong>
              </article>
              <article>
                <span>Pjesëmarrës</span>
                <strong>{eventAttendees.length}</strong>
              </article>
              <article>
                <span>Checked-in</span>
                <strong>{eventAttendees.filter((attendee) => attendee.status === "checked-in").length}</strong>
              </article>
            </div>

            {isLoadingAttendees ? (
              <LoadingState label="Duke ngarkuar pjesëmarrësit..." />
            ) : (
              <div className="table-wrap">
                {eventAttendees.length === 0 && <EmptyState title="Nuk ka pjesëmarrës për këtë event" message="Rezervimet e reja do të shfaqen automatikisht këtu." />}
                <table>
                  <thead>
                    <tr>
                      <th>Pjesëmarrësi</th>
                      <th>Emrat në biletë</th>
                      <th>Email</th>
                      <th>Tipi i biletës</th>
                      <th>Vendet</th>
                      <th>Kodi i biletës</th>
                      <th>Status</th>
                      <th>Check-in</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventAttendees.map((attendee) => (
                      <tr key={attendee._id}>
                        <td>{attendee.name}</td>
                        <td>{attendee.attendees?.length ? attendee.attendees.map((person) => person.fullName).join(", ") : "-"}</td>
                        <td>{attendee.email}</td>
                        <td>{attendee.ticketType}</td>
                        <td>
                          {attendee.selectedSeats?.length ? (
                            <span className="seat-list">{attendee.selectedSeats.join(", ")}</span>
                          ) : (
                            `${attendee.quantity} standing`
                          )}
                        </td>
                        <td className="ticket-code-cell">{attendee.ticketCode}</td>
                        <td><span className={`status ${attendee.status}`}>{attendee.status}</span></td>
                        <td>
                          <button
                            className="button secondary small"
                            disabled={isCheckingIn || attendee.status === "checked-in" || attendee.status === "cancelled"}
                            onClick={() => checkInAttendee(attendee.bookingId)}
                            type="button"
                          >
                            <UserCheck size={16} /> Check-in
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{isAdmin ? "Të gjitha rezervimet" : "Rezervimet për eventet e mia"}</p>
            <h2>Lista e pjesëmarrësve</h2>
          </div>
          <button className="button secondary" onClick={() => downloadCsv(attendees, "eventify-attendees.csv")}><Download size={17} /> Eksporto CSV</button>
        </div>
        <div className="table-wrap">
          {attendees.length === 0 && <EmptyState title="Nuk ka pjesëmarrës ende" message="Kur përdoruesit rezervojnë bileta, lista do të shfaqet këtu." />}
          <table>
            <thead><tr><th>Klienti</th><th>Emrat në biletë</th><th>Email</th><th>Eventi</th><th>Tipi</th><th>Vendet</th><th>Sasia</th><th>Status</th><th>Kodi</th></tr></thead>
            <tbody>
              {attendees.map((attendee) => (
                <tr key={attendee._id}>
                  <td>{attendee.name}</td>
                  <td>{attendee.attendees?.length ? attendee.attendees.map((person) => person.fullName).join(", ") : "-"}</td>
                  <td>{attendee.email}</td>
                  <td>{attendee.event}</td>
                  <td>{attendee.ticketType}</td>
                  <td>{attendee.selectedSeats?.length ? attendee.selectedSeats.join(", ") : "-"}</td>
                  <td>{attendee.quantity}</td>
                  <td><span className={`status ${attendee.status}`}>{attendee.status}</span></td>
                  <td>{attendee.ticketCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdmin && (
        <>
          <div className="admin-grid">
            <div className="panel">
              <p className="eyebrow">Menaxho përdoruesit</p>
              <h2>Ndrysho rolin e përdoruesit</h2>
              <div className="table-wrap">
                {users.length === 0 && <EmptyState title="Nuk ka përdorues" message="Pasi të regjistrohen përdoruesit, do të shfaqen në këtë tabelë." />}
                <table>
                  <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
                  <tbody>
                    {users.map((item) => (
                      <tr key={item._id}>
                        <td>{item.name}</td>
                        <td>{item.email}</td>
                        <td>
                          <select value={item.role} onChange={(event) => updateUser({ id: item._id, role: event.target.value })}>
                            <option value="user">user</option>
                            <option value="organizer">organizer</option>
                            <option value="staff">staff</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td>
                          <select value={String(item.isActive !== false)} onChange={(event) => updateUser({ id: item._id, isActive: event.target.value === "true" })}>
                            <option value="true">active</option>
                            <option value="false">inactive</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel">
              <p className="eyebrow">Menaxho kategoritë</p>
              <h2>Kategoritë e eventeve</h2>
              <form className="compact-form" onSubmit={saveCategory}>
                <label>Emri i kategorisë
                  <input placeholder="P.sh. Festival" value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} required />
                </label>
                <button className="button">Shto</button>
              </form>
              <div className="category-admin-list">
                {categories.map((category) => (
                  <article key={category._id}>
                    <Layers size={17} />
                    <div>
                      <input value={category.name} onChange={(event) => updateCategory({ id: category._id, name: event.target.value })} />
                    </div>
                    <button className="icon-button danger" onClick={() => setPendingCategory(category)} type="button">x</button>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="panel">
            <p className="eyebrow">Menaxho eventet</p>
            <h2>Aktivizo ose çaktivizo evente</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Eventi</th><th>Organizer</th><th>Kategoria</th><th>Status</th><th>Bileta</th></tr></thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event._id}>
                      <td>{event.title}</td>
                      <td>{event.organizer?.name}</td>
                      <td>{event.category}</td>
                      <td>
                        <select value={event.status} onChange={(input) => updateEvent({ id: event._id, status: input.target.value })}>
                          <option value="published">published</option>
                          <option value="draft">draft</option>
                          <option value="cancelled">cancelled</option>
                          <option value="soldout">soldout</option>
                        </select>
                      </td>
                      <td>{event.soldTickets}/{event.totalTickets}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <ConfirmDialog
            title={pendingCategory ? "Fshi kategorinë" : ""}
            message={`Je i sigurt që do të fshish kategorinë "${pendingCategory?.name}"?`}
            confirmLabel="Fshi"
            onCancel={() => setPendingCategory(null)}
            onConfirm={async () => {
              try {
                await deleteCategory(pendingCategory._id).unwrap();
                setToast({ type: "success", message: "Kategoria u fshi me sukses." });
                setPendingCategory(null);
              } catch (error) {
                setToast({ type: "error", message: error?.data?.message || "Kategoria nuk u fshi." });
              }
            }}
          />
        </>
      )}
    </section>
  );
}
