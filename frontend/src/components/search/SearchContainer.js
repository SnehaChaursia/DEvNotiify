// SearchContainer component
"use client"

import { useState, useRef, useEffect } from "react"
import SearchBar from "./SearchBar"
import SearchResults from "./SearchResults"

const SearchContainer = ({ events, onSearchApply }) => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [isResultsVisible, setIsResultsVisible] = useState(false)
  const containerRef = useRef(null)

  // Search logic
  const performSearch = (searchQuery) => {
    setQuery(searchQuery)

    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/)

    const filteredEvents = events.filter((event) => {
      // Search in name, location, tags, and type
      const searchableText = [event.name, event.location, ...event.tags, event.type, event.description || ""]
        .join(" ")
        .toLowerCase()

      // Check if all search terms are found
      return searchTerms.every((term) => searchableText.includes(term))
    })

    setResults(filteredEvents)
  }

  // Handle clicking outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsResultsVisible(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Show results when query exists
  useEffect(() => {
    setIsResultsVisible(query.length > 0)
  }, [query])

  // Clear search
  const clearSearch = () => {
    setQuery("")
    setResults([])
    setIsResultsVisible(false)
  }

  // Apply search as a filter
  const applySearch = () => {
    if (onSearchApply) {
      onSearchApply(query, results)
    }
    setIsResultsVisible(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <SearchBar onSearch={performSearch} placeholder="Search events, tags, or locations..." />

      {isResultsVisible && (
        <div className="relative">
          <SearchResults results={results} query={query} onClear={clearSearch} />

          {results.length > 0 && (
            <div className="absolute bottom-4 right-4">
              <button
                onClick={applySearch}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-300"
              >
                Apply Filter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchContainer;
