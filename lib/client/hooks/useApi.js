import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';

/**
 * Custom hook for making API calls with automatic state management
 * 
 * @param {string} endpoint - The API endpoint path (e.g., '/api/v1/createNewProject') or full URL
 * @param {Object} options - Configuration options
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE, PATCH). Default: 'GET'
 * @param {Object} options.headers - Custom headers to include in the request
 * @param {boolean} options.immediate - Whether to execute the request on mount. Default: false
 * @param {Object} options.body - Request body for POST/PUT/PATCH requests
 * @param {boolean} options.requireAuth - Whether to include Clerk authentication token. Default: true
 * 
 * @returns {Object} Hook state and methods
 * @returns {*} data - The parsed JSON response data, or null if no request has completed
 * @returns {boolean} loading - True when a request is in progress, false otherwise
 * @returns {string|null} error - Error message if the request failed, null otherwise
 * @returns {Function} execute - Manual execution function that accepts optional dynamicBody and dynamicHeaders parameters
 * 
 * @example
 * // Manual execution with POST
 * const { data, loading, error, execute } = useApi('/api/v1/createNewProject', {
 *   method: 'POST'
 * });
 * 
 * // Call execute when needed (e.g., on button click)
 * const handleCreate = async () => {
 *   try {
 *     await execute({ projectName: 'My Project' });
 *     console.log('Project created:', data);
 *   } catch (err) {
 *     console.error('Failed to create project:', error);
 *   }
 * };
 * 
 * @example
 * // Immediate execution on mount (GET request)
 * const { data, loading, error } = useApi('/api/account/paymentStatus', { 
 *   immediate: true 
 * });
 * 
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 * return <div>Payment Status: {data?.paymentStatus}</div>;
 * 
 * @example
 * // With custom headers
 * const { execute } = useApi('/api/v1/updateProject', {
 *   method: 'PUT',
 *   headers: { 'X-Custom-Header': 'value' }
 * });
 * 
 * execute({ projectName: 'Updated Name' });
 * 
 * @example
 * // Using full URL instead of endpoint path
 * const { data, loading, error } = useApi('https://api.example.com/data', {
 *   immediate: true
 * });
 * 
 * @example
 * // Dynamic parameters in execute function
 * const { execute } = useApi('/api/v1/createNewProject', { method: 'POST' });
 * 
 * // Override body and add headers for this specific call
 * execute(
 *   { projectName: 'Dynamic Project' },
 *   { 'X-Request-ID': '12345' }
 * );
 * 
 * @example
 * // Dynamic query parameters for GET requests
 * const { execute } = useApi('/v1/getProjectFileContent', { method: 'GET' });
 * 
 * // Pass query params as third parameter
 * execute(null, null, { projectId: '123', filePath: 'src/index.js' });
 */
export function useApi(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const { getToken } = useAuth();
  const requireAuth = options.requireAuth !== false;

  /**
   * Helper function to serialize query parameters
   * @param {Object} params - Query parameters object
   * @returns {string} - Serialized query string
   */
  function serializeQueryParams(params) {
    if (!params || Object.keys(params).length === 0) {
      return '';
    }
    
    const queryString = Object.entries(params)
      .map(function([key, value]) {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .join('&');
    
    return `?${queryString}`;
  }

  /**
   * Helper function to build complete URL from endpoint
   * @param {string} endpoint - The endpoint path or full URL
   * @param {Object} queryParams - Optional query parameters to append
   * @returns {string} - Complete URL
   */
  function buildUrl(endpoint, queryParams) {
    // Check if endpoint is already a full URL
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      const separator = endpoint.includes('?') ? '&' : '';
      return endpoint + separator + serializeQueryParams(queryParams).replace('?', '');
    }

    // Get base URL from environment variable
    let baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || '';

    // Remove trailing slash from base URL if present
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    // Ensure endpoint starts with /
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Check if endpoint already has query params
    const queryString = serializeQueryParams(queryParams);
    if (!queryString) {
      return `${baseUrl}${path}`;
    }
    
    const separator = endpoint.includes('?') ? '&' : '?';

    // Concatenate and return
    return `${baseUrl}${path}${separator}${queryString.replace('?', '')}`;
  }

  /**
   * Execute the API request
   * @param {Object} dynamicBody - Optional body to use for this specific call
   * @param {Object} dynamicHeaders - Optional headers to merge for this specific call
   * @param {Object} queryParams - Optional query parameters to append to the URL
   * @returns {Promise} - Promise that resolves with response data
   */
  const executeRequest = useCallback(async function(dynamicBody, dynamicHeaders, queryParams) {
    // Clear error and set loading
    setError(null);
    setLoading(true);

    // Create new AbortController for this request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Determine final body
    const finalBody = dynamicBody !== undefined ? dynamicBody : options.body;

    // Get authentication token if required
    let authHeaders = {};
    if (requireAuth) {
      try {
        const token = await getToken();
        if (token) {
          authHeaders['Authorization'] = `Bearer ${token}`;
        }
      } catch (authError) {
        setError('Failed to get authentication token');
        setLoading(false);
        throw new Error('Failed to get authentication token');
      }
    }

    // Merge headers: auth -> options.headers -> dynamicHeaders
    const finalHeaders = {
      ...authHeaders,
      ...(options.headers || {}),
      ...(dynamicHeaders || {})
    };

    // Add Content-Type for JSON requests if body is present
    if (finalBody) {
      finalHeaders['Content-Type'] = 'application/json';
    }

    // Build complete URL with query params
    const url = buildUrl(endpoint, queryParams);

    // Create fetch configuration
    const fetchConfig = {
      method: options.method || 'GET',
      headers: finalHeaders,
      signal: abortControllerRef.current.signal
    };

    // Add body if present
    if (finalBody) {
      fetchConfig.body = JSON.stringify(finalBody);
    }

    // Execute fetch and handle response
    try {
      const response = await fetch(url, fetchConfig);

      // Parse response body once
      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        throw new Error('Failed to parse response');
      }

      // Check if response is ok (status 200-299)
      if (!response.ok) {
        const errorMessage = responseData.error || response.statusText || `Error: ${response.status}`;
        console.log("Error: ", errorMessage)
        throw new Error(errorMessage);
      }

      // Set successful response data
      setData(responseData);
      setLoading(false);
      return responseData;

    } catch (err) {
      // Check if error is an abort error
      if (err.name === 'AbortError') {
        // Request was aborted, don't update state
        return;
      }

      // Handle other errors
      setError(err.message || 'An error occurred');
      setLoading(false);
      throw err;
    }

  }, [endpoint, options.method, options.body, options.headers, requireAuth, getToken]);

  // Implement immediate execution on mount and cleanup on unmount
  useEffect(function() {
    if (options.immediate) {
      executeRequest();
    }

    // Cleanup function to abort request on unmount
    return function() {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [options.immediate, executeRequest]);

  return { data, loading, error, execute: executeRequest };
}
