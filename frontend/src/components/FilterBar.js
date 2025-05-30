"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Paper,
  Button,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Radio,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import SortIcon from '@mui/icons-material/Sort'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'

const FilterBar = ({ events, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [activeFilter, setActiveFilter] = useState(null)
  const [filters, setFilters] = useState({
    types: [],
    tags: [],
    status: [],
    sortBy: "date-asc",
  })
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Extract all unique tags from events
  const allTags = [...new Set(events.flatMap((event) => event.tags))].sort()

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters }

      if (filterType === "sortBy") {
        newFilters.sortBy = value
      } else {
        const index = newFilters[filterType].indexOf(value)
        if (index === -1) {
          newFilters[filterType] = [...newFilters[filterType], value]
        } else {
          newFilters[filterType] = newFilters[filterType].filter((item) => item !== value)
        }
      }

      return newFilters
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      types: [],
      tags: [],
      status: [],
      sortBy: "date-asc",
    })
    setAnchorEl(null)
    setIsOpen(false)
  }

  const handleFilterClick = (event, filterType) => {
    setAnchorEl(event.currentTarget)
    setActiveFilter(filterType)
  }

  const handleFilterClose = () => {
    setAnchorEl(null)
    setActiveFilter(null)
  }

  // Update parent component when filters change
  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  const getFilterCount = (filterType) => {
    return filters[filterType].length
  }

  const renderFilterMenu = () => {
    const menuItems = {
      types: ["hackathon", "contest"].map((type) => (
        <MenuItem key={type} onClick={(e) => e.stopPropagation()}>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.types.includes(type)}
                onChange={() => handleFilterChange("types", type)}
                sx={{
                  color: theme.palette.primary.main,
                  '&.Mui-checked': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            }
            label={`${type.charAt(0).toUpperCase() + type.slice(1)}s`}
            sx={{ width: '100%', m: 0 }}
          />
        </MenuItem>
      )),
      tags: allTags.map((tag) => (
        <MenuItem key={tag} onClick={(e) => e.stopPropagation()}>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.tags.includes(tag)}
                onChange={() => handleFilterChange("tags", tag)}
                sx={{
                  color: theme.palette.primary.main,
                  '&.Mui-checked': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            }
            label={tag}
            sx={{ width: '100%', m: 0 }}
          />
        </MenuItem>
      )),
      status: ["upcoming", "today", "soon", "ended"].map((status) => (
        <MenuItem key={status} onClick={(e) => e.stopPropagation()}>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.status.includes(status)}
                onChange={() => handleFilterChange("status", status)}
                sx={{
                  color: theme.palette.primary.main,
                  '&.Mui-checked': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            }
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            sx={{ width: '100%', m: 0 }}
          />
        </MenuItem>
      )),
      sort: [
        { value: "date-asc", label: "Date (Earliest First)" },
        { value: "date-desc", label: "Date (Latest First)" },
        { value: "name-asc", label: "Name (A-Z)" },
      ].map((option) => (
        <MenuItem key={option.value} onClick={(e) => e.stopPropagation()}>
          <FormControlLabel
            control={
              <Radio
                checked={filters.sortBy === option.value}
                onChange={() => handleFilterChange("sortBy", option.value)}
                sx={{
                  color: theme.palette.primary.main,
                  '&.Mui-checked': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            }
            label={option.label}
            sx={{ width: '100%', m: 0 }}
          />
        </MenuItem>
      )),
    }

    return (
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      >
        {activeFilter && menuItems[activeFilter]}
      </Menu>
    )
  }

  const renderMobileFilters = () => (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={() => setIsOpen(false)}
      PaperProps={{
        sx: { width: 320, p: 2 }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Filters</Typography>
        <IconButton onClick={() => setIsOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>

      <List>
        <ListItem>
          <ListItemText primary="Event Type" />
        </ListItem>
        <Box sx={{ pl: 2 }}>
          {["hackathon", "contest"].map((type) => (
            <FormControlLabel
              key={type}
              control={
                <Checkbox
                  checked={filters.types.includes(type)}
                  onChange={() => handleFilterChange("types", type)}
                />
              }
              label={`${type.charAt(0).toUpperCase() + type.slice(1)}s`}
            />
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        <ListItem>
          <ListItemText primary="Tags" />
        </ListItem>
        <Box sx={{ pl: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {allTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onClick={() => handleFilterChange("tags", tag)}
              color={filters.tags.includes(tag) ? "primary" : "default"}
              variant={filters.tags.includes(tag) ? "filled" : "outlined"}
              size="small"
            />
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        <ListItem>
          <ListItemText primary="Status" />
        </ListItem>
        <Box sx={{ pl: 2 }}>
          {["upcoming", "today", "soon", "ended"].map((status) => (
            <FormControlLabel
              key={status}
              control={
                <Checkbox
                  checked={filters.status.includes(status)}
                  onChange={() => handleFilterChange("status", status)}
                />
              }
              label={status.charAt(0).toUpperCase() + status.slice(1)}
            />
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        <ListItem>
          <ListItemText primary="Sort By" />
        </ListItem>
        <Box sx={{ pl: 2 }}>
          {[
            { value: "date-asc", label: "Date (Earliest First)" },
            { value: "date-desc", label: "Date (Latest First)" },
            { value: "name-asc", label: "Name (A-Z)" },
          ].map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Radio
                  checked={filters.sortBy === option.value}
                  onChange={() => handleFilterChange("sortBy", option.value)}
                />
              }
              label={option.label}
            />
          ))}
        </Box>
      </List>

      <Box sx={{ mt: 'auto', pt: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          onClick={clearFilters}
          startIcon={<CloseIcon />}
        >
          Clear Filters
        </Button>
      </Box>
    </Drawer>
  )

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        mb: 3,
        bgcolor: 'background.paper',
        borderRadius: 2
      }}
    >
      {isMobile ? (
        <>
          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setIsOpen(true)}
              startIcon={
                <Badge badgeContent={getFilterCount('types') + getFilterCount('tags') + getFilterCount('status')} color="primary">
                  <FilterListIcon />
                </Badge>
              }
            >
              Filters
            </Button>
          </Box>
          {renderMobileFilters()}
        </>
      ) : (
        <Stack
          direction="row"
          spacing={2}
          sx={{ p: 2 }}
          divider={<Divider orientation="vertical" flexItem />}
        >
          <Button
            variant="outlined"
            onClick={(e) => handleFilterClick(e, 'types')}
            startIcon={<FilterListIcon />}
            endIcon={
              getFilterCount('types') > 0 && (
                <Chip
                  label={getFilterCount('types')}
                  size="small"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )
            }
          >
            Event Type
          </Button>

          <Button
            variant="outlined"
            onClick={(e) => handleFilterClick(e, 'tags')}
            startIcon={<FilterListIcon />}
            endIcon={
              getFilterCount('tags') > 0 && (
                <Chip
                  label={getFilterCount('tags')}
                  size="small"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )
            }
          >
            Tags
          </Button>

          <Button
            variant="outlined"
            onClick={(e) => handleFilterClick(e, 'status')}
            startIcon={<FilterListIcon />}
            endIcon={
              getFilterCount('status') > 0 && (
                <Chip
                  label={getFilterCount('status')}
                  size="small"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )
            }
          >
            Status
          </Button>

          <Button
            variant="outlined"
            onClick={(e) => handleFilterClick(e, 'sort')}
            startIcon={<SortIcon />}
          >
            Sort By
          </Button>

          {(getFilterCount('types') > 0 || getFilterCount('tags') > 0 || getFilterCount('status') > 0) && (
            <Button
              variant="text"
              color="primary"
              onClick={clearFilters}
              startIcon={<CloseIcon />}
            >
              Clear Filters
            </Button>
          )}
        </Stack>
      )}

      {renderFilterMenu()}
    </Paper>
  )
}

export default FilterBar
