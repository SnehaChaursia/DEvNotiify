import { useState, useEffect } from "react";
import {
  CssBaseline,
  Container,
  Box,
  AppBar,
  Toolbar
} from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Introduction from "./components/Introduction";
import EventsList from "./components/EventsList";
import EventDetail from "./components/EventDetail";
import MyReminders from "./components/MyReminders";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import SettingsPage from "./pages/SettingsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import EventsPage from "./pages/EventsPage";
import ConnectionStatus from "./components/ConnectionStatus";
import { checkReminders } from "./services/ReminderService";
import { NotificationProvider } from "./context/NotificationContext";
import NotificationBell from "./components/NotificationBell";
import { ThemeModeProvider, useThemeMode } from "./context/ThemeContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Wrapper to extract eventId from URL and show EventDetail
const EventDetailWrapper = ({ events, onBack, onViewDetails }) => {
  const { eventId } = useParams();
  // Convert both eventId and event.id to numbers for comparison
  const event = events.find((event) => Number(event.id) === Number(eventId));

  if (!event) return <Navigate to="/" replace />;
  
  return (
    <EventDetail
      event={event}
      events={events}
      onBack={onBack}
      onViewDetails={onViewDetails}
    />
  );
};

function App() {
  const [showReminders, setShowReminders] = useState(false);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const { mode } = useThemeMode();

  // Load events from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  const viewEventDetails = (eventId) => {
    navigate(`/event/${eventId}`);
    window.scrollTo(0, 0);
  };

  const goBackToEvents = () => navigate("/");

  const toggleRemindersModal = () => {
    setShowReminders((prev) => !prev);
  };

  useEffect(() => {
    checkReminders();
    const intervalId = setInterval(checkReminders, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const HomePage = () => (
    <Box>
      <Introduction />
      <EventsList
        events={events}
        title="Explore Hackathons & Contests"
        onViewDetails={viewEventDetails}
      />
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default"
      }}
    >
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Navbar onViewReminders={toggleRemindersModal} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <NotificationBell />
          </Box>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route
            path="/event/:eventId"
            element={
              <EventDetailWrapper
                events={events}
                onBack={goBackToEvents}
                onViewDetails={viewEventDetails}
              />
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <MyReminders
          isOpen={showReminders}
          onClose={toggleRemindersModal}
          onViewEvent={viewEventDetails}
        />

        <ConnectionStatus />
      </Container>
    </Box>
  );
}

const AppWithRouter = () => (
  <Router>
    <ThemeModeProvider>
      <AuthProvider>
        <NotificationProvider>
          <CssBaseline />
          <Toaster position="top-right" />
          <App />
        </NotificationProvider>
      </AuthProvider>
    </ThemeModeProvider>
  </Router>
);

export default AppWithRouter;

