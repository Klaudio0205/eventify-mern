import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CalendarCheck,
  MapPin,
  Music,
  Sparkles,
  TicketCheck,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { useGetEventsQuery } from "../features/api/apiSlice.js";

export default function LandingPage() {
  const { data: events = [] } = useGetEventsQuery("?status=published&limit=6");
  const featured = events.find((event) => event.featured) || events[0];
  const upcoming = events.slice(0, 3);

  return (
    <div className="landing">
      <section className="hero">
        <div>
          <p className="eyebrow">Zbulo evente live</p>
          <h1>Gjej eventin e radhës dhe rezervo biletën në pak sekonda.</h1>
          <p>
            Koncerte, festivale, konferenca, teatro dhe aktivitete sportive nga qytetet kryesore.
            Zgjidh datën, vendin dhe tipin e biletës pa humbur kohë.
          </p>
          <div className="actions">
            <Link className="button" to="/events">Shiko eventet <ArrowRight size={18} /></Link>
            <Link className="button secondary" to="/login">Hyr në sistem</Link>
          </div>
          <div className="trust-row">
            <span><BadgeCheck size={17} /> Bileta të verifikuara</span>
            <span><BadgeCheck size={17} /> Vende të përditësuara</span>
            <span><BadgeCheck size={17} /> Evente të kuruara</span>
          </div>
        </div>
        {featured && (
          <Link className="featured-card" to={`/events/${featured._id}`}>
            <img src={featured.image} alt={featured.title} decoding="async" />
            <div>
              <span>{featured.category}</span>
              <h2>{featured.title}</h2>
              <p>{featured.venue?.name} | {new Date(featured.date).toLocaleDateString()}</p>
              <span className="button secondary">Shiko detajet</span>
            </div>
          </Link>
        )}
      </section>

      <section className="feature-strip">
        <article><Music /><strong>Evente të zgjedhura</strong><span>Koncerte, konferenca, teatro dhe festivale</span></article>
        <article><CalendarCheck /><strong>Planifikim i lehtë</strong><span>Filtro sipas datës, kategorisë dhe çmimit</span></article>
        <article><TicketCheck /><strong>Biletë digjitale</strong><span>Kod unik për çdo rezervim</span></article>
        <article><Sparkles /><strong>Eksperienca lokale</strong><span>Evente nga Tirana, Durrësi, Vlora e më shumë</span></article>
      </section>

      <section className="landing-section">
        <div className="section-copy">
          <p className="eyebrow">Këtë javë</p>
          <h2>Evente që po marrin vëmendje tani.</h2>
        </div>
        <div className="mini-event-list">
          {upcoming.map((event) => (
            <Link to={`/events/${event._id}`} key={event._id}>
              <img src={event.image} alt={event.title} decoding="async" loading="lazy" />
              <div>
                <span>{event.category}</span>
                <h3>{event.title}</h3>
                <p><MapPin size={15} /> {event.venue?.name}</p>
              </div>
              <strong>{event.price} ALL</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="process-section">
        <article><span>1</span><h3>Zgjidh eventin</h3><p>Filtro sipas kategorisë dhe gjej eventin që të intereson.</p></article>
        <article><span>2</span><h3>Rezervo biletën</h3><p>Zgjidh numrin e biletave dhe shiko totalin live.</p></article>
        <article><span>3</span><h3>Merr kodin e biletës</h3><p>Bileta ruhet në profil dhe përdoret për check-in nga stafi.</p></article>
        <article><span>4</span><h3>Hyr në event</h3><p>Stafi ndryshon statusin në checked-in nga paneli.</p></article>
      </section>

      <section className="organizer-section">
        <div>
          <p className="eyebrow">Për organizatorët</p>
          <h2>Menaxho eventet, biletat dhe hyrjet në një panel.</h2>
          <p>Organizatorët krijojnë evente, ndjekin rezervimet, eksportojnë pjesëmarrësit dhe kryejnë check-in nga dashboard-i.</p>
        </div>
        <div className="organizer-card-grid">
          <article>
            <CalendarDays />
            <strong>Eventet e mia</strong>
            <span>Krijim, editim dhe kapacitet.</span>
          </article>
          <article>
            <TicketCheck />
            <strong>Rezervime</strong>
            <span>Bileta, vende dhe të ardhura.</span>
          </article>
          <article>
            <Users />
            <strong>Check-in</strong>
            <span>Lista pjesëmarrësish dhe CSV.</span>
          </article>
        </div>
      </section>

      <footer className="site-footer">
        <div>
          <strong>Eventify</strong>
          <p>Platformë për zbulim eventesh dhe rezervim biletash online.</p>
        </div>
        <Link to="/events">Evente</Link>
        <Link to="/login">Hyr</Link>
        <Link to="/register">Regjistrohu</Link>
      </footer>
    </div>
  );
}
