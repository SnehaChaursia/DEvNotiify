

import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa"

const SearchResults = ({ results, query, onClear }) => {
  if (!query) return null

  return (
    <div className="search-results bg-white rounded-lg shadow-lg mt-2 max-h-96 overflow-y-auto z-50 absolute w-full">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-medium text-gray-700">
          {results.length === 0
            ? "No results found"
            : `Found ${results.length} result${results.length === 1 ? "" : "s"}`}
        </h3>
        <button onClick={onClear} className="text-sm text-purple-600 hover:text-purple-800">
          Clear
        </button>
      </div>

      {results.length > 0 ? (
        <ul className="py-2">
          {results.map((event) => (
            <li key={event.id} className="hover:bg-gray-50">
              <a href={`/event/${event.id}`} className="block px-4 py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-start">
                  <div
                    className={`w-2 h-full mr-3 ${event.type === "hackathon" ? "bg-purple-600" : "bg-blue-600"}`}
                  ></div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{event.name}</h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <FaCalendarAlt className="mr-1" />
                      <span>
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="mx-2">•</span>
                      <FaMapMarkerAlt className="mr-1" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {event.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {event.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{event.tags.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <span
                      className={`text-xs font-bold uppercase text-white px-2 py-1 rounded-full ${
                        event.type === "hackathon" ? "bg-purple-600" : "bg-blue-600"
                      }`}
                    >
                      {event.type}
                    </span>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-8 text-center">
          <p className="text-gray-500">No events match your search</p>
          <p className="text-sm text-gray-400 mt-1">Try different keywords or browse all events</p>
        </div>
      )}
    </div>
  )
}

export default SearchResults
