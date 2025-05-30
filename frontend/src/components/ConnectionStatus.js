"use client"

import { useContext } from "react"
import { FaExclamationTriangle } from "react-icons/fa"
import AuthContext from "../context/AuthContext"

const ConnectionStatus = () => {
  const { apiConnected } = useContext(AuthContext)

  if (apiConnected) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow-md flex items-center z-50">
      <FaExclamationTriangle className="mr-2" />
      <span>Server connection issue. Some features may be limited.</span>
    </div>
  )
}

export default ConnectionStatus
