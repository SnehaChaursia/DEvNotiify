"use client"

import { useState, useCallback, useMemo } from "react"
import EventCard from "./EventCard"
import FilterBar from "./FilterBar"
import SearchContainer from "./SearchContainer"

const EventsList = ({ events, title, onViewDetails }) => {
  const [displayCount, setDisplayCount] = useState(6)
  const [activeFilters, setActiveFilters] = useState({
    types: [],
    tags: [],
    status: [],
    sortBy: "date-asc",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearchActive, setIsSearchActive] = useState(false)

  // Handle filter changes from FilterBar
  const handleFilterChange = useCallback((filters) => {
    setActiveFilters(filters)
    setDisplayCount(6) // Reset display count when filters change
  }, [])

  // Handle search application
  const handleSearchApply = useCallback((query, results) => {
    setSearchQuery(query)
    setSearchResults(results)
    setIsSearchActive(!!query)
    setDisplayCount(6) // Reset display count when search changes
  }, [])

  // Clear search filter
  const clearSearch = useCallback(() => {
    setSearchQuery("")
    setSearchResults([])
    setIsSearchActive(false)
  }, [])

  // Calculate days remaining for status filtering
  const getEventStatus = (eventDate) => {
    const today = new Date()
    const date = new Date(eventDate)
    const daysRemaining = Math.ceil((date - today) / (1000 * 60 * 60 * 24))

    if (daysRemaining < 0) return "ended"
    if (daysRemaining === 0) return "today"
    if (daysRemaining <= 3) return "soon"
    return "upcoming"
  }

  // Apply filters and sorting
  const filteredEvents = useMemo(() => {
    // If search is active, start with search results
    let result = isSearchActive ? [...searchResults] : [...events]

    // Filter by event type
    if (activeFilters.types.length > 0) {
      result = result.filter((event) => activeFilters.types.includes(event.type))
    }

    // Filter by tags
    if (activeFilters.tags.length > 0) {
      result = result.filter((event) => activeFilters.tags.some((tag) => event.tags.includes(tag)))
    }

    // Filter by status
    if (activeFilters.status.length > 0) {
      result = result.filter((event) => {
        const status = getEventStatus(event.date)
        return activeFilters.status.includes(status)
      })
    }

    // Apply sorting
    switch (activeFilters.sortBy) {
      case "date-asc":
        result.sort((a, b) => new Date(a.date) - new Date(b.date))
        break
      case "date-desc":
        result.sort((a, b) => new Date(b.date) - new Date(a.date))
        break
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        result.sort((a, b) => new Date(a.date) - new Date(b.date))
    }

    return result
  }, [events, activeFilters, isSearchActive, searchResults])

  const loadMore = () => {
    setDisplayCount((prevCount) => prevCount + 6)
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">{title || "Upcoming Events"}</h2>

        <div className="mb-6">
          <SearchContainer events={events} onSearchApply={handleSearchApply} />
        </div>

        {isSearchActive && (
          <div className="mb-6 flex items-center bg-purple-50 p-3 rounded-lg">
            <span className="text-purple-700 font-medium">
              Showing results for "{searchQuery}" ({searchResults.length} events)
            </span>
            <button onClick={clearSearch} className="ml-auto text-sm text-purple-600 hover:text-purple-800 font-medium">
              Clear Search
            </button>
          </div>
        )}

        <FilterBar events={events} onFilterChange={handleFilterChange} />

        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-medium text-gray-600 mb-2">No events found</h3>
            <p className="text-gray-500 mb-4">
              {isSearchActive ? `No events match your search "${searchQuery}"` : "No events match your current filters"}
            </p>
            <button
              onClick={
                isSearchActive
                  ? clearSearch
                  : () => handleFilterChange({ types: [], tags: [], status: [], sortBy: "date-asc" })
              }
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-300"
            >
              {isSearchActive ? "Clear Search" : "Clear Filters"}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.slice(0, displayCount).map((event) => (
                <EventCard key={event.id} event={event} onViewDetails={onViewDetails} />
              ))}
            </div>

            {displayCount < filteredEvents.length && (
              <div className="text-center mt-10">
                <button
                  onClick={loadMore}
                  className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-300"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default EventsList
