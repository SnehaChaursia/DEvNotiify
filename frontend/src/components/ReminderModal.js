"use client"

import React, { useState, useEffect, useContext } from "react"
import { FaBell, FaTimes, FaCheck } from "react-icons/fa"
import {
  removeReminder,
  hasReminder,
} from "../services/ReminderService"
import AuthContext from "../context/AuthContext"
import axios from 'axios'
import { useNotifications } from '../context/NotificationContext'
import { useNavigate } from 'react-router-dom'

const ReminderModal = ({ event, isOpen, onClose, onReminderSet }) => {
  const [hasExistingReminder, setHasExistingReminder] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState("default")
  const [showSuccess, setShowSuccess] = useState(false)
  const { isAuthenticated } = useContext(AuthContext)
  const [isSubmittingReminder, setIsSubmittingReminder] = useState(false)
  const [error, setError] = useState(null)
  const { joinUserRoom } = useNotifications()
  const navigate = useNavigate()
  const [isTestingEmail, setIsTestingEmail] = useState(false)

  useEffect(() => {
    if (isOpen && event) {
      // Check if reminder already exists
      const hasRemind = isAuthenticated 
        ? hasReminder(event.id)
        : JSON.parse(localStorage.getItem('reminders') || '[]').some(r => r.eventId === event.id)
      setHasExistingReminder(hasRemind)

      // Check notification permission
      if ("Notification" in window) {
        setNotificationPermission(Notification.permission)
      }
    }
  }, [isOpen, event, isAuthenticated])

  // Request notification permission
  const requestPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        setNotificationPermission(permission)
      })
    } else {
      alert("Notifications are not supported by your browser. Please use a modern browser.")
    }
  }

  // Set reminder
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmittingReminder(true)
    setError(null)

    // Check for notification permission before setting reminder
    if (notificationPermission !== "granted") {
        requestPermission();
        setIsSubmittingReminder(false);
        return;
    }

    try {
      if (isAuthenticated) {
        const token = localStorage.getItem('token')
        const response = await axios.post(
          'http://localhost:5000/api/users/reminders',
          {
            eventId: event.id,
            eventName: event.name,
            eventDate: event.date,
            // Use event.date directly for reminder time
            reminderTime: new Date(event.date).toISOString(),
          },
          {
            headers: {
              'x-auth-token': token,
            },
          }
        )
        // Join user's notification room
        joinUserRoom(response.data.userId)
      } else {
        // For non-authenticated users, store reminder in localStorage
        const reminders = JSON.parse(localStorage.getItem('reminders') || '[]')
        reminders.push({
          eventId: event.id,
          eventName: event.name,
          eventDate: event.date,
          // Use event.date directly for reminder time
          reminderTime: new Date(event.date).toISOString(),
        })
        localStorage.setItem('reminders', JSON.stringify(reminders))
        // TODO: Implement local notification trigger for non-authenticated users
      }
      
      // Show success message
      setShowSuccess(true)
      
      // Call onReminderSet after a short delay to show the success message
      setTimeout(() => {
        onReminderSet(true)
        onClose()
      }, 2000)
    } catch (err) {
      setError(err.message || "Failed to set reminder. Please try again.")
    } finally {
      setIsSubmittingReminder(false)
    }
  }

  // Remove reminder
  const handleRemove = async (eventId) => {
    setIsSubmittingReminder(true)
    setError(null)

    try {
      if (isAuthenticated) {
        const success = await removeReminder(eventId)
        if (success) {
          onReminderSet(false)
          onClose()
        } else {
          setError("Failed to remove reminder. Please try again.")
        }
      } else {
        // For non-authenticated users, remove from localStorage
        const reminders = JSON.parse(localStorage.getItem('reminders') || '[]')
        const updatedReminders = reminders.filter(r => r.eventId !== eventId)
        localStorage.setItem('reminders', JSON.stringify(updatedReminders))
        onReminderSet(false)
        onClose()
      }
    } catch (err) {
      setError(err.message || "Failed to remove reminder. Please try again.")
    } finally {
      setIsSubmittingReminder(false)
    }
  }

  const handleManageRemindersClick = () => {
    onClose() // Close the modal
    navigate('/reminders') // Navigate to the reminders page
  }

  const handleLoginSignupClick = () => {
    onClose(); // Close the modal
    navigate('/auth'); // Navigate to the authentication page
  };

  // Add test email function
  const handleTestEmail = async () => {
    setIsTestingEmail(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        'http://localhost:5000/api/test-email',
        {},
        {
          headers: {
            'x-auth-token': token,
          },
        }
      )
      alert('Test email sent! Please check your inbox.')
    } catch (err) {
      console.error('Error sending test email:', err)
      alert('Failed to send test email. Please check the console for details.')
    } finally {
      setIsTestingEmail(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">Set Event Reminder</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
              <FaTimes />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {showSuccess ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-4">
                  <FaCheck className="text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Reminder Set!</h3>
                <p className="text-gray-600">You'll be notified before the event starts.</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Event</h4>
                  <p className="text-gray-700">{event?.name}</p>
                  <p className="text-600 text-sm mt-1">
                    {new Date(event?.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {/* Optional: Suggest creating an account */}
                {!isAuthenticated && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-blue-800 mb-2">Want to save your reminders?</h4>
                    <p className="text-blue-700 text-sm mb-3">
                      Create an account to save your reminders across devices and get additional features.
                    </p>
                    <button
                      onClick={handleLoginSignupClick}
                      className="text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:underline"
                    >
                      Sign up or log in
                    </button>
                  </div>
                )}

                {hasExistingReminder ? (
                  <div className="bg-purple-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center text-purple-700 mb-2">
                      <FaBell className="mr-2" />
                      <span className="font-medium">Reminder Already Set</span>
                    </div>
                    <p className="text-purple-600 text-sm">
                      You already have a reminder set for this event. Would you like to remove it?
                    </p>
                    <div className="flex justify-end space-x-3 mt-4">
                       <button
                         type="button"
                         onClick={() => handleRemove(event.id)}
                         disabled={isSubmittingReminder}
                         className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                       >
                         Remove Reminder
                       </button>
                     </div>
                  </div>
                ) : notificationPermission !== "granted" ? (
                  <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-yellow-800 mb-2">Enable Notifications</h4>
                    <p className="text-yellow-700 text-sm mb-3">
                      To receive reminders, you need to allow notifications from this site.
                    </p>
                    <button
                      onClick={requestPermission}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition duration-300"
                    >
                      Allow Notifications
                    </button>
                  </div>
                ) : ( // Always show the set reminder button if no existing reminder and notifications are granted
                  <form onSubmit={handleSubmit} className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Get Notified for this Event</h4>

                    {error && (
                      <div className="mt-4 p-3 bg-red-50 text-red-500 rounded-md">
                        {error}
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 mt-4">
                      {/* Optionally keep remove button if we want users to be able to remove locally stored reminders */}
                      {/* <button
                        type="button"
                        onClick={handleRemove}
                        disabled={isSubmittingReminder}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Remove Reminder
                      </button> */}
                      <button
                        type="submit"
                        disabled={isSubmittingReminder}
                        className={`px-4 py-2 rounded-md text-white font-medium ${
                          isSubmittingReminder
                            ? "bg-purple-400 cursor-not-allowed"
                            : "bg-purple-600 hover:bg-purple-700"
                        }`}
                      >
                        {isSubmittingReminder ? "Setting..." : "Set Reminder"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Add test email button for authenticated users */}
                {isAuthenticated && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={handleTestEmail}
                      disabled={isTestingEmail}
                      className="text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:underline"
                    >
                      {isTestingEmail ? "Sending..." : "Test Email Notifications"}
                    </button>
                  </div>
                )}

                {/* Add Manage Reminders Button */}
                <div className="mt-4 text-center">
                  <button
                    onClick={handleManageRemindersClick}
                    disabled={isSubmittingReminder}
                    className="text-purple-600 hover:text-purple-700 font-medium focus:outline-none focus:underline"
                  >
                    Manage Reminders
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ReminderModal
