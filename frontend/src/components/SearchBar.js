

import { useState, useRef, useEffect } from "react"
import { FaSearch, FaTimes } from "react-icons/fa"

const SearchBar = ({ onSearch, placeholder = "Search events..." }) => {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)

  const handleChange = (e) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value)
  }

  const clearSearch = () => {
    setQuery("")
    onSearch("")
    inputRef.current.focus()
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key === "k") || (document.activeElement.tagName !== "INPUT" && e.key === "/")) {
        e.preventDefault()
        inputRef.current.focus()
      }

      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        clearSearch()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div
      className={`search-bar relative max-w-md w-full transition-all duration-300 ${
        isFocused ? "ring-2 ring-purple-300" : ""
      }`}
    >
      <div className="relative flex items-center">
        <div className="absolute left-3 text-gray-400">
          <FaSearch />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full py-3 pl-10 pr-10 bg-white border border-gray-200 rounded-lg focus:outline-none"
          aria-label="Search events"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}
      </div>
      <div className="absolute right-3 top-3 hidden sm:flex items-center space-x-1">
        <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
          {navigator.platform.indexOf("Mac") === 0 ? "⌘" : "Ctrl"}
        </kbd>
        <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
          K
        </kbd>
      </div>
    </div>
  )
}

export default SearchBar
