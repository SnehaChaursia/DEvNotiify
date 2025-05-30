import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventDetail from '../components/EventDetail';

const EventDetailPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [events, setEvents] = useState([]);

  // Load events from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      const allEvents = JSON.parse(savedEvents);
      setEvents(allEvents);
      // Convert both eventId and event.id to numbers for comparison
      const foundEvent = allEvents.find(e => Number(e.id) === Number(eventId));
      setEvent(foundEvent);
    }
  }, [eventId]);

  const handleBack = () => {
    navigate('/events');
  };

  const handleViewDetails = (newEventId) => {
    navigate(`/event/${newEventId}`);
  };

  const handleEventDeleted = (deletedEventId) => {
    // Update events in state and localStorage
    const updatedEvents = events.filter(e => Number(e.id) !== Number(deletedEventId));
    setEvents(updatedEvents);
    localStorage.setItem('events', JSON.stringify(updatedEvents));
    
    // Force reload the page to ensure all components are updated
    window.location.href = '/events';
  };

  return (
    <EventDetail
      event={event}
      events={events}
      onBack={handleBack}
      onViewDetails={handleViewDetails}
      onEventDeleted={handleEventDeleted}
    />
  );
};

export default EventDetailPage; 