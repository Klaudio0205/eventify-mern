import { CalendarDays, Eye, Heart, MapPin, Search, Star, Ticket, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import StatusMessage from "../components/StatusMessage.jsx";
import Toast from "../components/Toast.jsx";
import {
  useAddFavoriteMutation,
  useCreateBookingMutation,
  useCreateReviewMutation,
  useDeleteFavoriteMutation,
  useGetCategoriesQuery,
  useGetEventsPageQuery,
  useGetFavoritesQuery,
  useGetReviewsQuery,
  useGetVenuesQuery
} from "../features/api/apiSlice.js";

function money(value = 0) {
  return new Intl.NumberFormat("sq-AL").format(value);
}

const initialFilters = {
  search: "",
  category: "",
  city: "",
  dateFrom: "",
  dateTo: "",
  minPrice: "",
  maxPrice: "",
  sort: "date",
  page: 1
};

const seatRows = ["A", "B", "C"];
const seatNumbers = [1, 2, 3, 4, 5];

export default function EventsPage() {
  const user = useSelector((state) => state.auth.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedBookingId = searchParams.get("book");
  const requestedSearch = searchParams.get("search") || "";
  const [filters, setFilters] = useState({ ...initialFilters, search: requestedSearch });
  const params = useMemo(() => {
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });
    searchParams.set("status", "published");
    searchParams.set("limit", "6");
    return `?${searchParams.toString()}`;
  }, [filters]);

  const { data: pageData = { items: [], page: 1, pages: 1, total: 0 }, isLoading, isFetching } = useGetEventsPageQuery(params, {
    refetchOnMountOrArgChange: true
  });
  const events = pageData.items || [];
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: venues = [] } = useGetVenuesQuery();
  const { data: favorites = [] } = useGetFavoritesQuery(undefined, { skip: !user || !["user", "customer"].includes(user.role) });
  const [createBooking, bookingState] = useCreateBookingMutation();
  const [addFavorite] = useAddFavoriteMutation();
  const [deleteFavorite] = useDeleteFavoriteMutation();
  const [createReview, reviewState] = useCreateReviewMutation();
  const [selected, setSelected] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [confirmBooking, setConfirmBooking] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [attendees, setAttendees] = useState([""]);
  const [ticketType, setTicketType] = useState("Regular");
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [toast, setToast] = useState(null);
  const { data: reviews = [] } = useGetReviewsQuery(selected?._id, { skip: !selected });
  const favoriteIds = new Set(favorites.map((favorite) => favorite.event?._id || favorite.event));

  useEffect(() => {
    if (!requestedBookingId || selected || isLoading) return;
    const eventToBook = events.find((event) => event._id === requestedBookingId);
    if (!eventToBook) return;
    openBooking(eventToBook);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("book");
    setSearchParams(nextParams, { replace: true });
  }, [events, isLoading, requestedBookingId, searchParams, selected, setSearchParams]);

  function updateFilter(key, value) {
    setFilters({ ...filters, [key]: value, page: key === "page" ? value : 1 });
  }

  function openBooking(event) {
    setSelected(event);
    setBookingSuccess(null);
    setTicketType(event.ticketTypes?.[0]?.name || "Regular");
    setQuantity(1);
    setSelectedSeats([]);
    setAttendees([""]);
    setReview({ rating: 5, comment: "" });
  }

  async function book() {
    try {
      const booking = await createBooking({
        event: selected._id,
        quantity: effectiveQuantity,
        selectedSeats: isSeated ? selectedSeats : [],
        ticketType,
        attendees: attendees.slice(0, effectiveQuantity).map((fullName, index) => ({
          fullName: fullName.trim(),
          seat: isSeated ? selectedSeats[index] || "" : ""
        }))
      }).unwrap();
      setBookingSuccess(booking);
      setToast({ type: "success", message: "Bileta u rezervua me sukses." });
      setConfirmBooking(false);
    } catch (error) {
      setToast({ type: "error", message: error?.data?.message || error?.error || "Rezervimi dështoi." });
      setConfirmBooking(false);
    }
  }

  function requestBookingConfirmation() {
    if (!selected) return;
    if (!["user", "customer"].includes(user?.role)) {
      setToast({ type: "error", message: "Rezervimi lejohet vetëm për përdoruesit. Hyr me një llogari User." });
      return;
    }
    if (effectiveQuantity < 1) {
      setToast({
        type: "error",
        message: isSeated ? "Zgjidh të paktën një vend për të vazhduar." : "Zgjidh numrin e biletave."
      });
      return;
    }
    if (!hasAttendeeNames) {
      setToast({ type: "error", message: "Vendos emër dhe mbiemër për çdo biletë." });
      return;
    }
    setConfirmBooking(true);
  }

  async function submitReview(event) {
    event.preventDefault();
    if (!review.comment.trim()) {
      setToast({ type: "success", message: "Review është opsional dhe nuk u dërgua." });
      return;
    }
    await createReview({ event: selected._id, ...review }).unwrap();
    setToast({ type: "success", message: "Vlerësimi u dërgua." });
    setReview({ rating: 5, comment: "" });
  }

  async function toggleFavorite(eventId) {
    if (favoriteIds.has(eventId)) {
      await deleteFavorite(eventId).unwrap();
      setToast({ type: "success", message: "Eventi u hoq nga të preferuarat." });
    } else {
      await addFavorite(eventId).unwrap();
      setToast({ type: "success", message: "Eventi u shtua te të preferuarat." });
    }
  }

  const selectedTicket = selected?.ticketTypes?.find((type) => type.name === ticketType) || selected?.ticketTypes?.[0];
  const remainingForType = selectedTicket ? selectedTicket.capacity - selectedTicket.soldTickets : 0;
  const maxQuantity = selected ? Math.max(Math.min(selected.bookingLimit || 6, remainingForType), 1) : 1;
  const cities = [...new Set(venues.map((venue) => venue.city))].sort();
  const isSeated = selected?.seatingType === "seated";
  const occupiedSeats = useMemo(() => {
    if (!selected) return new Set();
    return new Set(selected.occupiedSeats || []);
  }, [selected]);
  const effectiveQuantity = isSeated ? selectedSeats.length : quantity;
  const subtotal = effectiveQuantity * (selectedTicket?.price || selected?.price || 0);
  const serviceFee = Math.round(subtotal * 0.06);
  const totalPrice = subtotal + serviceFee;
  const hasAttendeeNames = effectiveQuantity > 0 && attendees.slice(0, effectiveQuantity).every((name) => name.trim().length >= 3);

  useEffect(() => {
    const nextLength = Math.max(effectiveQuantity, 1);
    setAttendees((current) => Array.from({ length: nextLength }, (_, index) => current[index] || ""));
  }, [effectiveQuantity]);

  function toggleSeat(seat) {
    if (occupiedSeats.has(seat)) return;
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((item) => item !== seat));
      return;
    }
    if (selectedSeats.length >= maxQuantity) {
      setToast({ type: "error", message: `Mund të zgjedhësh maksimumi ${maxQuantity} vende.` });
      return;
    }
    setSelectedSeats([...selectedSeats, seat]);
  }

  function eventBadges(event, remainingSeats) {
    const badges = [];
    if (event.featured) badges.push({ className: "featured", label: "Featured" });
    if (remainingSeats <= 0 || event.status === "soldout") badges.push({ className: "soldout", label: "Sold Out" });
    else if (remainingSeats <= Math.ceil(event.totalTickets * 0.1)) badges.push({ className: "almost", label: "Almost Sold Out" });
    return badges;
  }

  return (
    <section className="events-page">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="page-heading">
        <div>
          <p className="eyebrow">Evente live</p>
          <h1>Evente live pranë teje</h1>
          <p className="page-subtitle">{pageData.total} evente aktive, nga koncertet tek konferencat dhe festivalet lokale.</p>
        </div>
        <div className="search-box">
          <Search size={18} />
          <input placeholder="Kërko sipas titullit ose lokacionit..." value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} />
        </div>
      </div>

      <div className="category-tabs">
        <button className={!filters.category ? "active" : ""} onClick={() => updateFilter("category", "")}>Të gjitha</button>
        {categories.map((category) => (
          <button className={filters.category === category.name ? "active" : ""} key={category._id} onClick={() => updateFilter("category", category.name)}>
            {category.name}
          </button>
        ))}
      </div>

      <div className="filters-panel">
        <label>Qyteti<select value={filters.city} onChange={(event) => updateFilter("city", event.target.value)}>
          <option value="">Të gjitha qytetet</option>
          {cities.map((city) => <option key={city} value={city}>{city}</option>)}
        </select></label>
        <label>Data nga<input type="date" value={filters.dateFrom} onChange={(event) => updateFilter("dateFrom", event.target.value)} /></label>
        <label>Data deri<input type="date" value={filters.dateTo} onChange={(event) => updateFilter("dateTo", event.target.value)} /></label>
        <label>Çmimi min<input type="number" value={filters.minPrice} onChange={(event) => updateFilter("minPrice", event.target.value)} /></label>
        <label>Çmimi max<input type="number" value={filters.maxPrice} onChange={(event) => updateFilter("maxPrice", event.target.value)} /></label>
        <label>Sortimi<select value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)}>
          <option value="date">Më të afërtat</option>
          <option value="newest">Më të rejat</option>
          <option value="price_asc">Çmimi më i ulët</option>
          <option value="price_desc">Çmimi më i lartë</option>
          <option value="popularity">Populariteti</option>
        </select></label>
      </div>

      {isLoading && <LoadingState label="Duke ngarkuar eventet..." rows={4} />}
      {!isLoading && events.length === 0 && (
        <EmptyState
          title="Nuk u gjet asnjë event"
          message="Ndrysho filtrat, çmimin ose kategorinë për të parë rezultate të tjera."
          action={<button className="button secondary" onClick={() => setFilters(initialFilters)}>Pastro filtrat</button>}
        />
      )}
      {isFetching && !isLoading && <p className="muted">Duke rifreskuar rezultatet...</p>}

      <div className="event-grid">
        {events.map((event) => {
          const remainingSeats = event.remainingSeats ?? event.totalTickets - event.soldTickets;
          const badges = eventBadges(event, remainingSeats);
          return (
            <article className="event-card" key={event._id}>
              <div className="event-media">
                <img src={event.bannerImage || event.image} alt={event.title} decoding="async" loading="lazy" />
                {badges.length > 0 && (
                  <div className="event-badges">
                    {badges.map((badge) => <span className={`event-badge ${badge.className}`} key={badge.label}>{badge.label}</span>)}
                  </div>
                )}
              </div>
              <div className="event-card-body">
                <span>{event.category}</span>
                <h2>{event.title}</h2>
                <p>{event.description}</p>
                <div className="event-meta">
                  <strong><MapPin size={16} /> {event.venue?.name}, {event.venue?.city}</strong>
                  <strong><CalendarDays size={16} /> {new Date(event.date).toLocaleDateString()}</strong>
                </div>
                <div className="event-meta">
                  <strong><Users size={16} /> {event.totalTickets} kapacitet</strong>
                  <strong>{remainingSeats} vende të lira</strong>
                </div>
                <div className="event-meta">
                  <strong><Star size={16} /> {event.averageRating || 0}/5 ({event.reviewCount || 0})</strong>
                  <strong>Limit {event.bookingLimit || 6} bileta</strong>
                </div>
                <div className="ticket-progress"><i style={{ width: `${Math.min((event.soldTickets / event.totalTickets) * 100, 100)}%` }} /></div>
                <div className="ticket-types-row">
                  {(event.ticketTypes || []).map((type) => <span key={type.name}>{type.name}: {money(type.price)} ALL</span>)}
                </div>
                <div className="event-footer">
                  <strong>nga {money(event.price)} ALL</strong>
                  {user && ["user", "customer"].includes(user.role) && (
                    <button className={`icon-button ${favoriteIds.has(event._id) ? "active" : ""}`} onClick={() => toggleFavorite(event._id)}><Heart size={17} /></button>
                  )}
                  <Link className="button secondary" to={`/events/${event._id}`}><Eye size={17} /> Detaje</Link>
                  {user && ["user", "customer"].includes(user.role) ? (
                    <button className="button" onClick={() => openBooking(event)} type="button">Rezervo</button>
                  ) : user ? (
                    <button className="button" onClick={() => setToast({ type: "error", message: "Për rezervim përdor një llogari User." })} type="button">Rezervo</button>
                  ) : (
                    <Link className="button" to="/login">Hyr</Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="pagination">
        <button className="button secondary" disabled={pageData.page <= 1} onClick={() => updateFilter("page", pageData.page - 1)}>Para</button>
        <span>Faqja {pageData.page} / {pageData.pages}</span>
        <button className="button secondary" disabled={pageData.page >= pageData.pages} onClick={() => updateFilter("page", pageData.page + 1)}>Pas</button>
      </div>

      {selected && (
        <div className="modal-backdrop">
          <div className="booking-modal">
            <img src={selected.image} alt={selected.title} />
            <div>
              {bookingSuccess ? (
                <div className="booking-success">
                  <span className="success-mark">OK</span>
                  <p className="eyebrow">Rezervimi u krye</p>
                  <h2>Bileta jote është gati</h2>
                  <p>{selected.title}</p>
                  <div className="success-summary">
                    <span>Kodi</span>
                    <strong>{bookingSuccess.ticketCode}</strong>
                    <span>Tipi</span>
                    <strong>{bookingSuccess.ticketType}</strong>
                    <span>{bookingSuccess.selectedSeats?.length ? "Vendet" : "Sasia"}</span>
                    <strong>{bookingSuccess.selectedSeats?.length ? bookingSuccess.selectedSeats.join(", ") : bookingSuccess.quantity}</strong>
                    <span>Emrat</span>
                    <strong>{bookingSuccess.attendees?.map((attendee) => attendee.fullName).join(", ")}</strong>
                    <span>Total</span>
                    <strong>{money(bookingSuccess.totalPrice || bookingSuccess.total)} ALL</strong>
                  </div>
                  <div className="modal-actions">
                    <button className="button secondary" onClick={() => {
                      setSelected(null);
                      setBookingSuccess(null);
                      setQuantity(1);
                      setSelectedSeats([]);
                      setAttendees([""]);
                    }}>Mbyll</button>
                    <Link className="button" to="/bookings">Shiko biletat</Link>
                  </div>
                </div>
              ) : (
              <>
              <p className="eyebrow">Rezervim bilete</p>
              <h2>{selected.title}</h2>
              <p>{selected.venue?.name} | {new Date(selected.date).toLocaleString()}</p>
              <div className="modal-summary">
                <span>{selected.category}</span>
                <span>{selected.remainingSeats} vende të lira</span>
                <span>Limit {selected.bookingLimit} bileta</span>
              </div>
              <label>Tipi i biletës
                <select value={ticketType} onChange={(event) => setTicketType(event.target.value)}>
                  {(selected.ticketTypes || []).map((type) => <option key={type.name} value={type.name}>{type.name} - {money(type.price)} ALL</option>)}
                </select>
              </label>
              {isSeated ? (
                <div className="seat-picker">
                  <div className="seat-picker-head">
                    <div>
                      <p className="eyebrow">Harta e vendeve</p>
                      <h3>Zgjidh vendet</h3>
                    </div>
                    <div className="seat-legend">
                      <span><i className="free" /> I lirë</span>
                      <span><i className="taken" /> I zënë</span>
                      <span><i className="selected" /> I zgjedhur</span>
                    </div>
                  </div>
                  <div className="seat-stage">Skena</div>
                  <div className="seat-map">
                    {seatRows.map((row) => (
                      <div className="seat-row" key={row}>
                        <strong>{row}</strong>
                        {seatNumbers.map((number) => {
                          const seat = `${row}${number}`;
                          const taken = occupiedSeats.has(seat);
                          const chosen = selectedSeats.includes(seat);
                          return (
                            <button
                              className={`seat ${taken ? "taken" : ""} ${chosen ? "selected" : ""}`}
                              disabled={taken}
                              key={seat}
                              onClick={() => toggleSeat(seat)}
                              type="button"
                            >
                              {seat}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="seat-summary">
                    <span>Vendet e zgjedhura</span>
                    <strong>{selectedSeats.length ? selectedSeats.join(", ") : "Asnjë vend i zgjedhur"}</strong>
                    <span>{selectedSeats.length} vende · Total {money(totalPrice)} ALL</span>
                  </div>
                </div>
              ) : (
                <label>Numri i biletave
                  <input type="number" min="1" max={maxQuantity} value={quantity} onChange={(event) => setQuantity(Math.min(Number(event.target.value), maxQuantity))} />
                </label>
              )}
              {effectiveQuantity > 0 && (
                <div className="attendee-form">
                  <div>
                    <p className="eyebrow">Emrat në biletë</p>
                    <h3>Vendos emër dhe mbiemër</h3>
                  </div>
                  <div className="attendee-fields">
                    {Array.from({ length: effectiveQuantity }, (_, index) => (
                      <label key={`${selected._id}-${index}`}>{isSeated ? `Bileta ${index + 1} - vendi ${selectedSeats[index]}` : `Bileta ${index + 1}`}
                        <input
                          placeholder="P.sh. Ardit Hoxha"
                          value={attendees[index] || ""}
                          onChange={(event) => {
                            const nextAttendees = [...attendees];
                            nextAttendees[index] = event.target.value;
                            setAttendees(nextAttendees);
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="booking-summary">
                <div className="booking-summary-head">
                  <p className="eyebrow">Booking Summary</p>
                  <h3>Konfirmo detajet</h3>
                </div>
                <div className="booking-summary-row">
                  <span>Event</span>
                  <strong>{selected.title}</strong>
                </div>
                <div className="booking-summary-row">
                  <span>Seats</span>
                  <strong>{isSeated ? selectedSeats.join(", ") || "Asnjë vend" : `${quantity} standing`}</strong>
                </div>
                <div className="booking-summary-row">
                  <span>Price</span>
                  <strong>{money(subtotal)} ALL</strong>
                </div>
                <div className="booking-summary-row">
                  <span>Fee</span>
                  <strong>{money(serviceFee)} ALL</strong>
                </div>
                <div className="booking-summary-row total">
                  <span>Total</span>
                  <strong>{money(totalPrice)} ALL</strong>
                </div>
              </div>
              <div className="reviews-box">
                <h3>Vlerësime</h3>
                {reviews.slice(0, 3).map((item) => (
                  <article key={item._id}><strong>{item.rating}/5 - {item.user?.name}</strong><p>{item.comment}</p></article>
                ))}
                {user && ["user", "customer"].includes(user.role) && (
                  <form onSubmit={submitReview}>
                    <select value={review.rating} onChange={(event) => setReview({ ...review, rating: Number(event.target.value) })}>
                      {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} yje</option>)}
                    </select>
                    <textarea rows="2" placeholder="Shkruaj vlerësimin (opsionale)..." value={review.comment} onChange={(event) => setReview({ ...review, comment: event.target.value })} />
                    <button className="button secondary" type="submit">Dërgo vlerësimin</button>
                  </form>
                )}
              </div>
              <div className="modal-actions">
                <button className="button secondary" onClick={() => setSelected(null)}>Mbyll</button>
                <button className="button" disabled={bookingState.isLoading} onClick={requestBookingConfirmation} type="button">
                  <Ticket size={17} /> {bookingState.isLoading ? "Duke rezervuar..." : "Confirm Booking"}
                </button>
              </div>
              <StatusMessage error={bookingState.error || reviewState.error} success={bookingState.isSuccess ? "Bileta u rezervua." : ""} />
              </>
              )}
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        title={confirmBooking ? "Konfirmo rezervimin" : ""}
        message={`Do të rezervosh ${effectiveQuantity} bileta ${ticketType}${selectedSeats.length ? ` (${selectedSeats.join(", ")})` : ""} për ${selected?.title || "eventin"}? Totali: ${money(totalPrice)} ALL.`}
        confirmLabel="Rezervo"
        onCancel={() => setConfirmBooking(false)}
        onConfirm={book}
      />
    </section>
  );
}
