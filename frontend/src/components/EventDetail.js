"use client"

import { useState, useEffect, useContext } from "react"
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaGlobe,
  FaUsers,
  FaTrophy,
  FaBookmark,
  FaRegBookmark,
  FaArrowLeft,
  FaLaptopCode,
  FaBuilding,
  FaExternalLinkAlt,
  FaShare,
  FaBell,
  FaBellSlash,
  FaSpinner,
  FaTrash,
} from "react-icons/fa"
import { hasReminder, removeReminder } from "../services/ReminderService"
import AuthContext from "../context/AuthContext"
import { useNotifications } from '../context/NotificationContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import CommentsSection from './CommentsSection'

const EventDetail = ({ event, events, onBack, onViewDetails, onEventDeleted }) => {
  const [isSaved, setIsSaved] = useState(event?.isSaved || false)
  const [isReminderSet, setIsReminderSet] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [isSubmittingReminder, setIsSubmittingReminder] = useState(false)
  const [reminderStatus, setReminderStatus] = useState(null)
  const [reminderMessage, setReminderMessage] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const { isAuthenticated, isAdminAuthenticated } = useContext(AuthContext)
  const { joinUserRoom } = useNotifications()
  const navigate = useNavigate()

  useEffect(() => {
    if (event) {
      // Check if reminder exists for this event
      const checkReminder = async () => {
        const hasRemind = isAuthenticated 
          ? await hasReminder(event.id)
          : JSON.parse(localStorage.getItem('reminders') || '[]').some(r => r.eventId === event.id)
        setIsReminderSet(hasRemind)
      }
      checkReminder()
    }
  }, [event, isAuthenticated])

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <button onClick={onBack} className="inline-flex items-center text-purple-600 hover:text-purple-800">
            <FaArrowLeft className="mr-2" /> Back to Events
          </button>
        </div>
      </div>
    )
  }

  // Calculate days remaining
  const today = new Date()
  const eventDate = new Date(event.date)
  const daysRemaining = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24))

  // Format date
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Format time
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  // Toggle save/bookmark
  const toggleSave = () => {
    setIsSaved(!isSaved)
    // Update saved state in localStorage
    const savedEvents = JSON.parse(localStorage.getItem('savedEvents') || '[]')
    if (!isSaved) {
      savedEvents.push(event.id)
    } else {
      const index = savedEvents.indexOf(event.id)
      if (index > -1) {
        savedEvents.splice(index, 1)
      }
    }
    localStorage.setItem('savedEvents', JSON.stringify(savedEvents))
  }

  // Toggle share options
  const toggleShareOptions = () => {
    setShowShareOptions(!showShareOptions)
  }

  // Share event
  const shareEvent = (platform) => {
    const url = window.location.href
    const text = `Check out this ${event.type}: ${event.name}`

    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`)
        break
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
        break
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`)
        break
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`
        break
      default:
        navigator.clipboard.writeText(url)
        toast.success("Link copied to clipboard!")
    }

    setShowShareOptions(false)
  }

  // Set or remove reminder
  const handleSetOrRemoveReminder = async () => {
    setIsSubmittingReminder(true)
    setReminderMessage('')
    setReminderStatus(null)

    // Check for notification permission before setting reminder
    if (!isReminderSet && "Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission !== "granted") {
          setReminderMessage('Notifications blocked. Please enable in browser settings.')
          setReminderStatus('error')
        }
        setIsSubmittingReminder(false)
      })
      return
    }

    try {
      if (isReminderSet) {
        // Remove reminder
        setReminderStatus('removing')
        const success = isAuthenticated ? await removeReminder(event.id) : true
        if (!isAuthenticated) {
          const reminders = JSON.parse(localStorage.getItem('reminders') || '[]')
          const updatedReminders = reminders.filter(r => r.eventId !== event.id)
          localStorage.setItem('reminders', JSON.stringify(updatedReminders))
        }

        if (success) {
          setIsReminderSet(false)
          setReminderMessage('Reminder removed!')
          setReminderStatus('removed')
          toast.success('Reminder removed successfully!')
        } else if (isAuthenticated) {
          setReminderMessage('Failed to remove reminder. Please try again.')
          setReminderStatus('error')
          toast.error('Failed to remove reminder')
        }
      } else {
        // Set reminder
        setReminderStatus('setting')
        const reminderData = {
          eventId: event.id,
          eventName: event.name,
          eventDate: event.date,
          reminderTime: new Date(event.date).toISOString(),
        }

        if (isAuthenticated) {
          const token = localStorage.getItem('token')
          const response = await fetch('http://localhost:5000/api/users/reminders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token,
            },
            body: JSON.stringify(reminderData),
          })

          if (!response.ok) {
            throw new Error('Failed to set reminder')
          }

          const data = await response.json()
          joinUserRoom(data.userId)
        } else {
          // For non-authenticated users, store reminder in localStorage
          const reminders = JSON.parse(localStorage.getItem('reminders') || '[]')
          reminders.push(reminderData)
          localStorage.setItem('reminders', JSON.stringify(reminders))
        }

        setIsReminderSet(true)
        setReminderMessage('Reminder set!')
        setReminderStatus('set')
        toast.success(`Reminder set for ${event.name}!`)
      }
    } catch (err) {
      console.error('Reminder action failed:', err)
      setReminderMessage('Failed to update reminder. Please try again.')
      setReminderStatus('error')
      toast.error('Failed to update reminder')
    } finally {
      setIsSubmittingReminder(false)
    }
  }

  // Find similar events (same type or shared tags)
  const similarEvents = events
    .filter((e) => e.id !== event.id && (e.type === event.type || e.tags.some((tag) => event.tags.includes(tag))))
    .slice(0, 3)

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      console.log('Deleting event:', event.id);
      console.log('Admin token:', localStorage.getItem('adminToken'));
      
      const response = await fetch(`http://localhost:5000/api/events/${event.id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': localStorage.getItem('adminToken')
        }
      });

      console.log('Delete response status:', response.status);
      const data = await response.json();
      console.log('Delete response data:', data);

      if (response.ok) {
        // First notify parent component
        if (onEventDeleted) {
          onEventDeleted(event.id);
        }

        // Then update localStorage
        const savedEvents = JSON.parse(localStorage.getItem('events') || '[]');
        const updatedEvents = savedEvents.filter(e => Number(e.id) !== Number(event.id));
        localStorage.setItem('events', JSON.stringify(updatedEvents));

        // Show success message
        toast.success('Event deleted successfully');

        // Force reload the entire application
        window.location.reload();
      } else {
        throw new Error(data.msg || 'Failed to delete event');
      }
    } catch (err) {
      console.error('Delete event error:', err);
      toast.error(err.message || 'Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Event Header */}
      <div className={`w-full h-2 ${event.type === "hackathon" ? "bg-purple-600" : "bg-blue-600"}`}></div>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button and Admin Actions */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="inline-flex items-center text-gray-600 hover:text-purple-600">
            <FaArrowLeft className="mr-2" /> Back to Events
          </button>
          
          {isAdminAuthenticated && (
            <button
              onClick={handleDeleteEvent}
              disabled={isDeleting}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <FaTrash className="mr-2" />
                  Delete Event
                </>
              )}
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Event Banner */}
          <div className="bg-gradient-to-r from-purple-700 to-indigo-800 h-48 flex items-center justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center px-4">{event.name}</h1>
          </div>

          {/* Event Actions */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold uppercase text-white px-3 py-1 rounded-full ${
                    daysRemaining < 0
                      ? "bg-gray-500"
                      : daysRemaining === 0
                        ? "bg-green-500"
                        : daysRemaining <= 3
                          ? "bg-red-500"
                          : "bg-yellow-500"
                  }`}
                >
                  {daysRemaining < 0
                    ? "Ended"
                    : daysRemaining === 0
                      ? "Today"
                      : daysRemaining <= 3
                        ? `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`
                        : `${daysRemaining} days left`}
                </span>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    event.type === "hackathon" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {event.type === "hackathon" ? "Hackathon" : "Coding Contest"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSetOrRemoveReminder}
                  disabled={isSubmittingReminder}
                  className={`p-2 rounded-full ${
                    isReminderSet ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-600"
                  } hover:bg-gray-200 transition-colors`}
                  aria-label={isReminderSet ? "Remove reminder" : "Set reminder"}
                  title={isReminderSet ? "Remove reminder" : "Set reminder"}
                >
                  {isSubmittingReminder ? (
                    <FaSpinner className="animate-spin" />
                  ) : isReminderSet ? (
                    <FaBell />
                  ) : (
                    <FaBellSlash />
                  )}
                </button>

                <button
                  onClick={toggleSave}
                  className={`p-2 rounded-full ${
                    isSaved ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-600"
                  } hover:bg-gray-200 transition-colors`}
                  aria-label={isSaved ? "Remove from saved" : "Save event"}
                  title={isSaved ? "Remove from saved" : "Save event"}
                >
                  {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                </button>

                <div className="relative">
                  <button
                    onClick={toggleShareOptions}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    aria-label="Share event"
                    title="Share event"
                  >
                    <FaShare />
                  </button>
                  {showShareOptions && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50">
                      <button
                        onClick={() => shareEvent("twitter")}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Share on Twitter
                      </button>
                      <button
                        onClick={() => shareEvent("facebook")}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Share on Facebook
                      </button>
                      <button
                        onClick={() => shareEvent("linkedin")}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Share on LinkedIn
                      </button>
                      <button
                        onClick={() => shareEvent("email")}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Share via Email
                      </button>
                      <button
                        onClick={() => shareEvent("copy")}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Copy Link
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {reminderStatus && (
              <div className={`mt-2 text-sm font-medium ${reminderStatus === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {reminderMessage}
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="md:col-span-2">
                {/* Event Description */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Event</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </div>

                {/* Event Details */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Details</h2>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex items-start">
                      <div className="text-purple-600 mt-1 mr-3">
                        <FaCalendarAlt />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Date & Time</h3>
                        <p className="text-gray-600">{formattedDate}</p>
                        <p className="text-gray-600">{formattedTime}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="text-purple-600 mt-1 mr-3">
                        <FaClock />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Duration</h3>
                        <p className="text-gray-600">{event.duration}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="text-purple-600 mt-1 mr-3">
                        <FaMapMarkerAlt />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Location</h3>
                        <p className="text-gray-600">{event.location}</p>
                      </div>
                    </div>

                    {event.type === "hackathon" ? (
                      <div className="flex items-start">
                        <div className="text-purple-600 mt-1 mr-3">
                          <FaUsers />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Team Size</h3>
                          <p className="text-gray-600">{event.teamSize}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start">
                        <div className="text-purple-600 mt-1 mr-3">
                          <FaLaptopCode />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Difficulty Level</h3>
                          <p className="text-gray-600">{event.difficulty}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start">
                      <div className="text-purple-600 mt-1 mr-3">
                        <FaBuilding />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Organizer</h3>
                        <p className="text-gray-600">{event.organizer}</p>
                      </div>
                    </div>

                    {event.prizes && (
                      <div className="flex items-start">
                        <div className="text-purple-600 mt-1 mr-3">
                          <FaTrophy />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Prizes</h3>
                          <p className="text-gray-600 whitespace-pre-wrap">{event.prizes}</p>
                        </div>
                      </div>
                    )}

                    {event.website && (
                      <div className="flex items-start">
                        <div className="text-purple-600 mt-1 mr-3">
                          <FaGlobe />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Website</h3>
                          <a
                            href={event.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-800 flex items-center"
                          >
                            Visit Official Website <FaExternalLinkAlt className="ml-1 text-xs" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments Section */}
                <CommentsSection eventId={event.id} />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Registration */}
                {event.website && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Registration</h3>
                    <a
                      href={event.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-purple-600 text-white text-center py-3 rounded-md hover:bg-purple-700 transition duration-300"
                    >
                      Register Now
                    </a>
                    {daysRemaining > 0 && (
                      <p className="text-center text-gray-600 mt-3 text-sm">
                        Registration closes in {daysRemaining} day{daysRemaining === 1 ? "" : "s"}
                      </p>
                    )}
                  </div>
                )}

                {/* Reminder Card */}
                {isReminderSet && (
                  <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-100">
                    <div className="flex items-center mb-3">
                      <FaBell className="text-yellow-500 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-800">Reminder Set</h3>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">You'll be notified before this event starts.</p>
                    <button
                      onClick={() => navigate('/reminders')}
                      className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Manage Reminders
                    </button>
                  </div>
                )}

                {/* Similar Events */}
                {similarEvents.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Similar Events</h3>
                    <div className="space-y-4">
                      {similarEvents.map((similarEvent) => (
                        <div
                          key={similarEvent.id}
                          className="block bg-white p-4 rounded-md hover:shadow-md transition duration-300 cursor-pointer"
                          onClick={() => onViewDetails(similarEvent.id)}
                        >
                          <h4 className="font-semibold text-gray-800">{similarEvent.name}</h4>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <FaCalendarAlt className="mr-1" />
                            <span>
                              {new Date(similarEvent.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {similarEvent.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetail
