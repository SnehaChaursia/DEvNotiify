"use client"

import { useState } from "react"
import { FaTimes } from "react-icons/fa"
import LoginForm from "./LoginForm"
import SignupForm from "./SignupForm"

const AuthModal = ({ isOpen, onClose, initialView = "login" }) => {
  const [view, setView] = useState(initialView)

  const toggleView = () => {
    setView(view === "login" ? "signup" : "login")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
          aria-label="Close"
        >
          <FaTimes />
        </button>

        {view === "login" ? <LoginForm onToggleForm={toggleView} /> : <SignupForm onToggleForm={toggleView} />}
      </div>
    </div>
  )
}

export default AuthModal
