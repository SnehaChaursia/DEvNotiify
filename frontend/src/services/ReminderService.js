// ReminderService.js - Handles all reminder-related functionality

import api, { saveReminder as apiSaveReminder, deleteReminder as apiDeleteReminder } from "./api"

// Local storage fallback for when user is not authenticated
const LOCAL_STORAGE_KEY = "eventReminders"

// Check if user is authenticated
const isAuthenticated = () => {
  // We can get authentication status from AuthContext if needed, but for a simple check,
  // checking the presence of the token in localStorage is sufficient here as it mirrors AuthContext's check.
  return !!localStorage.getItem("token")
}

// Function to fetch reminders from the backend
const fetchRemindersFromApi = async () => {
  try {
    // Assuming you have an API endpoint like GET /api/users/reminders
    const response = await api.get('/users/reminders');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching reminders from API:', error);
    // Return empty array or handle error appropriately
    return [];
  }
}

// Get all reminders from localStorage or API
export const getReminders = async () => {
  try {
    if (isAuthenticated()) {
      // Fetch from backend for authenticated users
      return await fetchRemindersFromApi();
    } else {
      // Fetch from local storage for non-authenticated users
      const reminders = localStorage.getItem(LOCAL_STORAGE_KEY)
      return reminders ? JSON.parse(reminders) : []
    }
  } catch (error) {
    console.error("Error getting reminders:", error)
    return []
  }
}

// Save reminders to localStorage
export const saveReminders = (reminders) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reminders))
    return true
  } catch (error) {
    console.error("Error saving reminders:", error)
    return false
  }
}

// Check if a reminder exists for an event
export const hasReminder = async (eventId) => {
  const reminders = await getReminders()
  return reminders.some((reminder) => reminder.eventId === eventId)
}

// Add a new reminder
export const addReminder = async (eventId, eventName, eventDate, reminderTime) => {
  try {
    const reminders = await getReminders()

    // Check if reminder already exists
    const existingIndex = reminders.findIndex((r) => r.eventId === eventId)

    const newReminder = {
      id: Date.now(),
      eventId,
      eventName,
      eventDate,
      reminderTime,
      createdAt: new Date().toISOString(),
      isNotified: false,
    }

    if (existingIndex >= 0) {
      // Update existing reminder
      reminders[existingIndex] = newReminder
    } else {
      // Add new reminder
      reminders.push(newReminder)
    }

    // If authenticated, save to server
    if (isAuthenticated()) {
      await apiSaveReminder({
        eventId,
        eventName,
        eventDate,
        reminderTime,
      })
      return true
    }

    // Otherwise, save to local storage
    return saveReminders(reminders)
  } catch (error) {
    console.error("Error adding reminder:", error)
    return false
  }
}

// Remove a reminder
export const removeReminder = async (eventId) => {
  try {
    const reminders = await getReminders()
    const updatedReminders = reminders.filter((reminder) => reminder.eventId !== eventId)

    // If authenticated, delete from server
    if (isAuthenticated()) {
      await apiDeleteReminder(eventId)
      return true
    }

    // Otherwise, remove from local storage
    return saveReminders(updatedReminders)
  } catch (error) {
    console.error("Error removing reminder:", error)
    return false
  }
}

// Calculate time remaining for a reminder
export const getTimeRemaining = (reminderTime) => {
  const now = new Date().getTime()
  const reminderDate = new Date(reminderTime).getTime()
  const timeRemaining = reminderDate - now

  if (timeRemaining <= 0) {
    return { expired: true, text: "Reminder time passed" }
  }

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return {
      expired: false,
      text: `${days} day${days !== 1 ? "s" : ""} and ${hours} hour${hours !== 1 ? "s" : ""} before event`,
    }
  } else if (hours > 0) {
    return {
      expired: false,
      text: `${hours} hour${hours !== 1 ? "s" : ""} and ${minutes} minute${minutes !== 1 ? "s" : ""} before event`,
    }
  } else {
    return {
      expired: false,
      text: `${minutes} minute${minutes !== 1 ? "s" : ""} before event`,
    }
  }
}

// Check for due reminders and trigger notifications
export const checkReminders = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notifications")
    return
  }

  const reminders = await getReminders()
  const now = new Date().getTime()
  let updatedReminders = false

  reminders.forEach((reminder) => {
    const reminderTime = new Date(reminder.reminderTime).getTime()

    // If reminder is due and not yet notified
    if (reminderTime <= now && !reminder.isNotified) {
      // Request permission and show notification
      if (Notification.permission === "granted") {
        showNotification(reminder)
        reminder.isNotified = true
        updatedReminders = true
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            showNotification(reminder)
            reminder.isNotified = true
            updatedReminders = true
            saveReminders(reminders)
          }
        })
      }
    }
  })

  if (updatedReminders) {
    saveReminders(reminders)
  }
}

// Show a browser notification
const showNotification = (reminder) => {
  const eventDate = new Date(reminder.eventDate)
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const notification = new Notification("Event Reminder", {
    body: `${reminder.eventName} is coming up on ${formattedDate}!`,
    icon: "/favicon.ico", // You can replace this with your app's icon
  })

  notification.onclick = () => {
    window.focus()
    notification.close()
    // Ideally, we would navigate to the event detail page here
  }
}

// Get reminder options based on event date
export const getReminderOptions = (eventDate) => {
  const eventTime = new Date(eventDate).getTime()
  const now = new Date().getTime()

  // If event is in the past, no reminder options
  if (eventTime <= now) {
    return []
  }

  const options = []
  const oneDay = 24 * 60 * 60 * 1000
  const oneHour = 60 * 60 * 1000

  // 1 week before
  if (eventTime - now >= 7 * oneDay) {
    options.push({
      label: "1 week before",
      value: new Date(eventTime - 7 * oneDay).toISOString(),
    })
  }

  // 3 days before
  if (eventTime - now >= 3 * oneDay) {
    options.push({
      label: "3 days before",
      value: new Date(eventTime - 3 * oneDay).toISOString(),
    })
  }

  // 1 day before
  if (eventTime - now >= oneDay) {
    options.push({
      label: "1 day before",
      value: new Date(eventTime - oneDay).toISOString(),
    })
  }

  // 12 hours before
  if (eventTime - now >= 12 * oneHour) {
    options.push({
      label: "12 hours before",
      value: new Date(eventTime - 12 * oneHour).toISOString(),
    })
  }

  // 1 hour before
  if (eventTime - now >= oneHour) {
    options.push({
      label: "1 hour before",
      value: new Date(eventTime - oneHour).toISOString(),
    })
  }

  // 30 minutes before
  if (eventTime - now >= 30 * 60 * 1000) {
    options.push({
      label: "30 minutes before",
      value: new Date(eventTime - 30 * 60 * 1000).toISOString(),
    })
  }

  return options
}
