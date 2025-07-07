import React, { useState, useEffect } from 'react';
import { searchUsers } from '../services/api';

const UserSearchComponent = ({ onUserSelect, excludeUserIds = [], placeholder = "Search for users..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      try {
        setIsLoading(true);
        const response = await searchUsers(searchTerm);
        // Filter out excluded users (like current user or already added users)
        const filteredUsers = response.data.filter(
          user => !excludeUserIds.includes(user._id)
        );
        setSearchResults(filteredUsers);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const delayedSearch = setTimeout(() => {
      if (searchTerm.trim() && searchTerm.length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, excludeUserIds]);

  const handleUserClick = (user) => {
    onUserSelect(user);
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((user) => (
            <div
              key={user._id}
              onClick={() => handleUserClick(user)}
              className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{user.username}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {showResults && searchResults.length === 0 && searchTerm.length >= 2 && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            No users found matching "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSearchComponent;
