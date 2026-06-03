import { BarChart3, CalendarDays, LayoutDashboard, LogOut, Moon, Settings, Sun, Ticket, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { logout } from "./features/auth/authSlice.js";
import EmptyState from "./components/EmptyState.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import BookingsPage from "./pages/BookingsPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import EventDetailsPage from "./pages/EventDetailsPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import ManageEventsPage from "./pages/ManageEventsPage.jsx";
import VenuesPage from "./pages/VenuesPage.jsx";

function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RoleRoute({ children, roles }) {
  const user = useSelector((state) => state.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/events" replace />;
  return children;
}

export default function App() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("eventify-theme") === "dark");

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("eventify-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  function handleLogout() {
    dispatch(logout());
    navigate("/");
  }

  const showSidebar = user && ["/dashboard", "/manage-events", "/venues", "/bookings"].some((path) => location.pathname.startsWith(path));

  return (
    <>
      <header className="topbar">
        <Link className="brand" to="/"><Ticket /> Eventify</Link>
        <nav className="main-nav">
          <NavLink to="/events">Evente</NavLink>
          {user && <NavLink to="/bookings"><CalendarDays size={18} /> Biletat</NavLink>}
          {["admin", "organizer", "staff"].includes(user?.role) && <NavLink to="/dashboard"><BarChart3 size={18} /> Dashboard</NavLink>}
          {["admin", "organizer"].includes(user?.role) && <NavLink to="/manage-events"><Settings size={18} /> Menaxho</NavLink>}
          {["admin", "organizer"].includes(user?.role) && <NavLink to="/venues"><Users size={18} /> Lokacione</NavLink>}
          <button className="icon-button" onClick={() => setDarkMode(!darkMode)} title="Ndrysho pamjen">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
          {!user ? <Link className="button small" to="/login">Hyr</Link> : <button className="icon-button" onClick={handleLogout} title="Dil"><LogOut size={18} /></button>}
        </nav>
      </header>
      <div className={showSidebar ? "app-shell with-sidebar" : "app-shell"}>
        {showSidebar && (
          <aside className="sidebar">
            <strong><LayoutDashboard size={18} /> Paneli</strong>
            <NavLink to="/dashboard"><BarChart3 size={18} /> Dashboard</NavLink>
            <NavLink to="/bookings"><CalendarDays size={18} /> Biletat</NavLink>
            {["admin", "organizer"].includes(user?.role) && <NavLink to="/manage-events"><Settings size={18} /> Evente</NavLink>}
            {["admin", "organizer"].includes(user?.role) && <NavLink to="/venues"><Users size={18} /> Lokacione</NavLink>}
          </aside>
        )}
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailsPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<RoleRoute roles={["admin", "organizer", "staff"]}><DashboardPage /></RoleRoute>} />
            <Route path="/manage-events" element={<RoleRoute roles={["admin", "organizer"]}><ManageEventsPage /></RoleRoute>} />
            <Route path="/venues" element={<RoleRoute roles={["admin", "organizer"]}><VenuesPage /></RoleRoute>} />
            <Route
              path="*"
              element={(
                <EmptyState
                  title="Faqja nuk u gjet"
                  message="Linku mund të jetë ndryshuar ose faqja nuk ekziston më."
                  action={<Link className="button" to="/events">Kthehu te eventet</Link>}
                />
              )}
            />
          </Routes>
        </main>
      </div>
    </>
  );
}
