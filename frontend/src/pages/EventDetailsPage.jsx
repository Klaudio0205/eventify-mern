import { ArrowLeft, CalendarDays, Clock, Image, MapPin, ShieldCheck, Star, Ticket, UserRound, Users } from "lucide-react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { useGetEventQuery, useGetReviewsQuery } from "../features/api/apiSlice.js";

function money(value = 0) {
  return new Intl.NumberFormat("sq-AL").format(value);
}

function countdownParts(date) {
  const target = date ? new Date(date).getTime() : 0;
  const diff = Math.max(target - Date.now(), 0);
  const day = 24 * 60 * 60 * 1000;
  const hour = 60 * 60 * 1000;
  const minute = 60 * 1000;
  return {
    days: Math.floor(diff / day),
    hours: Math.floor((diff % day) / hour),
    minutes: Math.floor((diff % hour) / minute)
  };
}

export default function EventDetailsPage() {
  const { id } = useParams();
  const user = useSelector((state) => state.auth.user);
  const { data: event, isLoading, error } = useGetEventQuery(id);
  const { data: reviews = [] } = useGetReviewsQuery(id);

  if (isLoading) return <LoadingState label="Duke hapur detajet e eventit..." />;
  if (error || !event) {
    return (
      <EmptyState
        title="Eventi nuk u gjet"
        message="Eventi mund të jetë fshirë ose linku nuk është i saktë."
        action={<Link className="button" to="/events">Kthehu te eventet</Link>}
      />
    );
  }

  const title = event.title || "Event";
  const date = event.date ? new Date(event.date) : null;
  const displayDate = date ? date.toLocaleDateString() : "Date TBD";
  const displayTime = event.time || (date ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Time TBD");
  const venueName = event.venue?.name || event.venueName || "Venue TBD";
  const city = event.city || event.venue?.city || "City TBD";
  const address = event.address || event.venue?.address || "Address TBD";
  const remainingSeats = event.remainingSeats ?? Math.max((event.totalTickets || 0) - (event.soldTickets || 0), 0);
  const rating = event.rating || event.averageRating || 0;
  const galleryImages = event.galleryImages?.length ? event.galleryImages : [event.bannerImage || event.image].filter(Boolean);
  const agenda = event.agenda?.length ? event.agenda : [];
  const rules = event.rules?.length ? event.rules : ["Paraqit biletën digjitale në hyrje.", "Respekto udhëzimet e stafit të eventit."];
  const countdown = countdownParts(event.date);
  const canBook = ["user", "customer"].includes(user?.role);
  const bookingLink = canBook ? `/events?book=${event._id}&search=${encodeURIComponent(title)}` : "/login";
  const bookingLabel = canBook ? "Rezervo Biletë" : "Hyr për të Rezervuar";
  const mapQuery = encodeURIComponent(`${venueName}, ${address}, ${city}, Albania`);

  return (
    <section className="event-details">
      <Link className="link-button back-link" to="/events"><ArrowLeft size={17} /> Kthehu te eventet</Link>

      <div className="details-banner">
        <img src={event.bannerImage || event.image} alt={title} decoding="async" />
        <div className="details-banner-overlay">
          <span>{event.category || "Event"}</span>
          <h1>{title}</h1>
          <p>{event.description || "Detajet e eventit do të publikohen së shpejti."}</p>
          <div className="details-actions">
            <Link className="button" to={bookingLink}><Ticket size={17} /> {bookingLabel}</Link>
            <strong>nga {money(event.priceFrom || event.price)} ALL</strong>
          </div>
        </div>
      </div>

      <div className="details-summary-grid">
        <article><CalendarDays /><span>Data</span><strong>{displayDate}</strong></article>
        <article><Clock /><span>Ora</span><strong>{displayTime}</strong></article>
        <article><MapPin /><span>Lokacioni</span><strong>{venueName}, {city}</strong></article>
        <article><Ticket /><span>Kategoria</span><strong>{event.category || "Event"}</strong></article>
        <article><Star /><span>Rating</span><strong>{rating}/5</strong></article>
      </div>

      <div className="countdown-card">
        <span>Eventi fillon pas</span>
        <div>
          <strong>{countdown.days}<small>dite</small></strong>
          <strong>{countdown.hours}<small>ore</small></strong>
          <strong>{countdown.minutes}<small>min</small></strong>
        </div>
      </div>

      <div className="details-content-grid">
        <main className="details-main">
          <section className="panel">
            <p className="eyebrow">Rreth eventit</p>
            <h2>Përshkrim i plotë</h2>
            <p className="long-copy">{event.longDescription || event.description || "Përshkrimi i plotë do të shtohet së shpejti."}</p>
            {event.tags?.length > 0 && (
              <div className="tag-row">
                {event.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            )}
          </section>

          <section className="panel">
            <p className="eyebrow">Agenda</p>
            <h2>Programi</h2>
            {agenda.length === 0 && <p className="muted">Agenda do të publikohet së shpejti.</p>}
            <div className="agenda-list">
              {agenda.map((item, index) => (
                <article key={`${item.time}-${item.title}-${index}`}>
                  <time>{item.time || "--:--"}</time>
                  <div>
                    <strong>{item.title || "Session"}</strong>
                    <p>{item.description || "Detaje të programit."}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <p className="eyebrow">Galeria</p>
            <h2>Foto nga atmosfera</h2>
            <div className="gallery-grid">
              {galleryImages.map((src, index) => (
                <img src={src} alt={`${title} gallery ${index + 1}`} decoding="async" key={`${src}-${index}`} loading="lazy" />
              ))}
              {galleryImages.length === 0 && <div className="gallery-empty"><Image /><span>Galeria do të shtohet së shpejti.</span></div>}
            </div>
          </section>

          <section className="panel">
            <p className="eyebrow">Vlerësime</p>
            <h2>Çfarë thonë pjesëmarrësit</h2>
            <div className="reviews-box">
              {reviews.length === 0 && <p className="muted">Ende nuk ka vlerësime për këtë event.</p>}
              {reviews.map((review) => (
                <article key={review._id}>
                  <strong>{review.rating}/5 - {review.user?.name || "Guest"}</strong>
                  <p>{review.comment}</p>
                </article>
              ))}
            </div>
          </section>
        </main>

        <aside className="details-aside">
          <section className="panel organizer-profile">
            <p className="eyebrow">Organizatori</p>
            <div>
              <UserRound />
              <strong>{event.organizer?.name || "Event organizer"}</strong>
              <span>Organizator i verifikuar</span>
            </div>
          </section>

          <section className="panel">
            <p className="eyebrow">Tipet e biletave</p>
            <h2>Biletat</h2>
            <div className="price-list">
              {(event.ticketTypes || []).map((type) => (
                <article key={type.name}>
                  <strong>{type.name}</strong>
                  <span>{money(type.price)} ALL</span>
                  <small>{Math.max((type.capacity || 0) - (type.soldTickets || 0), 0)} vende</small>
                </article>
              ))}
            </div>
            <Link className="button full" to={bookingLink}><Ticket size={17} /> {bookingLabel}</Link>
          </section>

          <section className="panel">
            <p className="eyebrow">Lokacioni</p>
            <h2>{venueName}</h2>
            <p className="muted">{address}, {city}</p>
            <div className="map-placeholder">
              <iframe
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                title={`Harta e ${venueName}`}
              />
            </div>
          </section>

          <section className="panel">
            <p className="eyebrow">Rules</p>
            <h2>Rregullat</h2>
            <ul className="rules-list">
              {rules.map((rule, index) => (
                <li key={`${rule}-${index}`}><ShieldCheck size={16} /> {rule}</li>
              ))}
            </ul>
          </section>

          <section className="panel seat-info">
            <Users />
            <div>
              <strong>{remainingSeats} vende të lira</strong>
              <span>{event.seatingType === "seated" ? "Event me ulëse" : "Event standing"}</span>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
