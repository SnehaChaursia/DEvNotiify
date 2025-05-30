import { useState, useEffect } from "react"
import { FaBell, FaTrash, FaCalendarAlt, FaClock, FaTimes } from "react-icons/fa"
import { getReminders, removeReminder, getTimeRemaining } from "../services/ReminderService"
import ConfirmationDialog from './ConfirmationDialog'

const MyReminders = ({ isOpen, onClose, onViewEvent }) => {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [reminderToDelete, setReminderToDelete] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadReminders()
    }
  }, [isOpen])

  const loadReminders = () => {
    setLoading(true)
    const allReminders = getReminders()

    // Sort reminders by date (closest first)
    allReminders.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))

    setReminders(allReminders)
    setLoading(false)
  }

  const handleOpenDialog = (eventId) => {
    setReminderToDelete(eventId)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setReminderToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (reminderToDelete !== null) {
      const success = await removeReminder(reminderToDelete)
      if (success) {
        loadReminders()
      } else {
        console.error("Failed to remove reminder.")
      }
      handleCloseDialog()
    }
  }

  const handleRemoveReminder = (eventId) => {
    handleOpenDialog(eventId)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <FaBell className="text-purple-600 mr-2" /> My Reminders
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-grow">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading reminders...</p>
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                <FaBell className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Reminders Set</h3>
              <p className="text-gray-600 mb-4">You haven't set any reminders for upcoming events yet.</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-300"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder) => {
                const eventDate = new Date(reminder.eventDate)
                const reminderDate = new Date(reminder.reminderTime)
                const timeRemaining = getTimeRemaining(reminder.reminderTime)
                const isPast = new Date(reminder.eventDate) < new Date()

                return (
                  <div
                    key={reminder.id}
                    className={`border rounded-lg overflow-hidden ${
                      isPast ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-gray-800">{reminder.eventName}</h4>
                        <button
                          onClick={() => handleOpenDialog(reminder.eventId)}
                          className="text-gray-400 hover:text-red-500"
                          aria-label="Remove reminder"
                        >
                          <FaTrash />
                        </button>
                      </div>

                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <FaCalendarAlt className="mr-2 text-gray-400" />
                          <span>
                            {eventDate.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <FaClock className="mr-2 text-gray-400" />
                          <span>
                            Reminder set for{" "}
                            {reminderDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            at{" "}
                            {reminderDate.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-between items-center">
                        {isPast ? (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Event Passed</span>
                        ) : reminder.isNotified ? (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                            Reminder Sent
                          </span>
                        ) : timeRemaining.expired ? (
                          <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
                            Reminder Due Soon
                          </span>
                        ) : (
                          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                            {timeRemaining.text}
                          </span>
                        )}

                        <button
                          onClick={() => {
                            onViewEvent(reminder.eventId)
                            onClose()
                          }}
                          className="text-sm text-purple-600 hover:text-purple-800"
                        >
                          View Event
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        title="Confirm Reminder Deletion"
        description="Are you sure you want to delete this reminder? This action cannot be undone."
      />
    </div>
  )
}

export default MyReminders
