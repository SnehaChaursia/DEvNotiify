import { useState, useEffect, useContext } from "react"
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaBookmark,
  FaRegBookmark,
  FaUsers,
  FaLaptopCode,
  FaBell,
} from "react-icons/fa"
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Stack,
  Button,
  useTheme,
  alpha,
} from '@mui/material'
import { hasReminder } from "../services/ReminderService"
import { saveEvent } from "../services/api"
import AuthContext from "../context/AuthContext"

const EventCard = ({ event, onViewDetails }) => {
  const [isSaved, setIsSaved] = useState(event.isSaved || false)
  const [hasEventReminder, setHasEventReminder] = useState(false)
  const { isAuthenticated, user } = useContext(AuthContext)
  const theme = useTheme()

  useEffect(() => {
    // Check if reminder exists for this event
    const reminderExists = hasReminder(event.id)
    setHasEventReminder(reminderExists)

    // Check if event is saved in user data
    if (isAuthenticated && user && user.savedEvents) {
      setIsSaved(user.savedEvents.includes(event.id))
    }
  }, [event.id, isAuthenticated, user])

  const toggleSave = async (e) => {
    e.stopPropagation()

    try {
      if (isAuthenticated) {
        // Save to server if authenticated
        await saveEvent(event.id)
      }

      // Toggle saved state
      setIsSaved(!isSaved)
    } catch (error) {
      console.error("Error saving event:", error)
    }
  }

  // Calculate days remaining
  const today = new Date()
  const eventDate = new Date(event.date)
  const daysRemaining = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24))

  // Determine status color and label
  const getStatusInfo = () => {
    if (daysRemaining < 0) {
      return { color: theme.palette.grey[500], label: 'Ended' }
    } else if (daysRemaining === 0) {
      return { color: theme.palette.success.main, label: 'Today' }
    } else if (daysRemaining <= 3) {
      return { color: theme.palette.error.main, label: 'Soon' }
    }
    return { color: theme.palette.warning.main, label: 'Upcoming' }
  }

  const statusInfo = getStatusInfo()

  return (
    <Card 
      sx={{ 
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'grey.100',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          borderColor: 'grey.200',
        },
        cursor: 'pointer',
      }}
      onClick={() => onViewDetails(event.id)}
    >
      <Box
        sx={{
          height: 4,
          background: event.type === "hackathon" 
            ? 'linear-gradient(90deg, #4f46e5, #818cf8)'
            : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
        }}
      />

      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1}>
            <Chip
              label={statusInfo.label}
              size="small"
              sx={{
                bgcolor: alpha(statusInfo.color, 0.1),
                color: statusInfo.color,
                fontWeight: 600,
                '& .MuiChip-label': { px: 1 },
              }}
            />
            <Chip
              label={event.type === "hackathon" ? "Hackathon" : "Contest"}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 600,
              }}
            />
            {hasEventReminder && (
              <IconButton
                size="small"
                sx={{ 
                  color: theme.palette.warning.main,
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.warning.main, 0.2),
                  }
                }}
                title="Reminder set"
              >
                <FaBell />
              </IconButton>
            )}
          </Stack>
          <IconButton
            onClick={toggleSave}
            sx={{
              color: isSaved ? theme.palette.warning.main : theme.palette.grey[400],
              '&:hover': { 
                color: theme.palette.warning.main,
                bgcolor: alpha(theme.palette.warning.main, 0.1),
              },
            }}
            aria-label={isSaved ? "Remove from saved" : "Save event"}
          >
            {isSaved ? <FaBookmark /> : <FaRegBookmark />}
          </IconButton>
        </Box>

        <Typography 
          variant="h6" 
          component="h3" 
          sx={{ 
            mb: 2, 
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontSize: '1.1rem',
            lineHeight: 1.4,
          }}
        >
          {event.name}
        </Typography>

        <Stack spacing={1.5} sx={{ mb: 2, flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary }}>
            <FaCalendarAlt style={{ marginRight: 8, color: theme.palette.grey[400] }} />
            <Typography variant="body2">
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Typography>
          </Box>

          {event.duration && (
            <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary }}>
              <FaClock style={{ marginRight: 8, color: theme.palette.grey[400] }} />
              <Typography variant="body2">{event.duration}</Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary }}>
            <FaMapMarkerAlt style={{ marginRight: 8, color: theme.palette.grey[400] }} />
            <Typography variant="body2">{event.location}</Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          {event.tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              size="small"
              sx={{
                bgcolor: theme.palette.grey[50],
                color: theme.palette.grey[700],
                fontSize: '0.75rem',
                fontWeight: 500,
                border: '1px solid',
                borderColor: theme.palette.grey[200],
                '&:hover': {
                  bgcolor: theme.palette.grey[100],
                }
              }}
            />
          ))}
        </Stack>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 'auto',
          pt: 2,
          borderTop: 1,
          borderColor: theme.palette.grey[100]
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary }}>
            {event.type === "hackathon" ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FaUsers style={{ marginRight: 4, color: theme.palette.grey[400] }} />
                <Typography variant="body2">{event.teamSize}</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FaLaptopCode style={{ marginRight: 4, color: theme.palette.grey[400] }} />
                <Typography variant="body2">{event.difficulty}</Typography>
              </Box>
            )}
          </Box>

          <Button
            variant="text"
            color="primary"
            endIcon="→"
            sx={{ 
              fontWeight: 500,
              color: theme.palette.primary.main,
              '&:hover': { 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              }
            }}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default EventCard
