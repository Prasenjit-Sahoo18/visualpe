// auth-check.js

// Function to handle unauthorized access
function handleUnauthorized() {
    localStorage.removeItem('jwt');
    window.location.href = '/login.html';
  }
  
  // Add global error listener
  window.addEventListener('error', function(e) {
    if (e.message.includes('401') || e.message.includes('Unauthorized')) {
      handleUnauthorized();
    }
  });
  
  // Function to add authentication header to fetch requests
  function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('jwt');
    if (!token) {
      handleUnauthorized();
      return Promise.reject(new Error('No authentication token'));
    }
  
    const authenticatedOptions = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    };
  
    return fetch(url, authenticatedOptions)
      .then(response => {
        if (response.status === 401) {
          handleUnauthorized();
          throw new Error('Unauthorized');
        }
        return response;
      });
  }
  
  // Check authentication on page load
  document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      handleUnauthorized();
    }
    // Optionally, you could also verify the token here
  });