import { Box } from '@mui/material';
import EventsList from '../components/EventsList';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  // Load events from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  // Listen for event deletion
  useEffect(() => {
    const handleStorageChange = () => {
      const savedEvents = localStorage.getItem('events');
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const viewEventDetails = (eventId) => {
    navigate(`/event/${eventId}`);
    window.scrollTo(0, 0);
  };

  return (
    <Box>
      <EventsList
        events={events}
        title="All Events"
        onViewDetails={viewEventDetails}
      />
    </Box>
  );
};

export default EventsPage; 