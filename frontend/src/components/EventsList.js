"use client"

import { useState, useCallback, useMemo } from "react"
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Paper,
  Alert,
  AlertTitle,
  useTheme,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
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
  const theme = useTheme()

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
    <Box sx={{ py: 6, bgcolor: 'grey.50' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 'bold', color: 'text.primary' }}>
          {title || "Upcoming Events"}
        </Typography>

        <Box sx={{ mb: 4 }}>
          <SearchContainer events={events} onSearchApply={handleSearchApply} />
        </Box>

        {isSearchActive && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              '& .MuiAlert-icon': {
                color: 'primary.main'
              }
            }}
            action={
              <Button 
                color="primary" 
                onClick={clearSearch}
                sx={{ 
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'transparent' }
                }}
              >
                Clear Search
              </Button>
            }
          >
            <AlertTitle>Search Results</AlertTitle>
            Showing results for "{searchQuery}" ({searchResults.length} events)
          </Alert>
        )}

        <FilterBar events={events} onFilterChange={handleFilterChange} />

        {filteredEvents.length === 0 ? (
          <Paper 
            elevation={0}
            sx={{ 
              p: 6, 
              textAlign: 'center',
              bgcolor: 'background.paper',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No events found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {isSearchActive 
                ? `No events match your search "${searchQuery}"` 
                : "No events match your current filters"
              }
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={
                isSearchActive
                  ? clearSearch
                  : () => handleFilterChange({ types: [], tags: [], status: [], sortBy: "date-asc" })
              }
            >
              {isSearchActive ? "Clear Search" : "Clear Filters"}
            </Button>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3}>
              {filteredEvents.slice(0, displayCount).map((event) => (
                <Grid item xs={12} md={6} lg={4} key={event.id}>
                  <EventCard event={event} onViewDetails={onViewDetails} />
                </Grid>
              ))}
            </Grid>

            {displayCount < filteredEvents.length && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={loadMore}
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    borderRadius: 2
                  }}
                >
                  Load More
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  )
}

export default EventsList
