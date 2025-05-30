/**
 * Utility to test the connection to the backend API
 */

import axios from "axios"

// Get the API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

/**
 * Tests the connection to the backend API
 * @returns {Promise<Object>} The test results
 */
export const testApiConnection = async () => {
  try {
    console.log("Testing connection to API:", API_URL)

    const startTime = Date.now()
    const response = await axios.get(`${API_URL}/health`)
    const endTime = Date.now()

    return {
      success: true,
      latency: endTime - startTime,
      data: response.data,
      message: "Connection successful",
    }
  } catch (error) {
    console.error("API connection test failed:", error)

    return {
      success: false,
      error: error.message,
      message: "Connection failed",
      details: error.response ? error.response.data : null,
    }
  }
}

/**
 * Tests the authentication to the backend API
 * @returns {Promise<Object>} The test results
 */
export const testAuthConnection = async () => {
  try {
    const token = localStorage.getItem("token")

    if (!token) {
      return {
        success: false,
        message: "No authentication token found",
      }
    }

    console.log("Testing authenticated connection to API")

    const response = await axios.get(`${API_URL}/users/me`, {
      headers: {
        "x-auth-token": token,
      },
    })

    return {
      success: true,
      data: response.data,
      message: "Authentication successful",
    }
  } catch (error) {
    console.error("API authentication test failed:", error)

    return {
      success: false,
      error: error.message,
      message: "Authentication failed",
      details: error.response ? error.response.data : null,
    }
  }
}

export default {
  testApiConnection,
  testAuthConnection,
}
