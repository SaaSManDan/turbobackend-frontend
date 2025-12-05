# Implementation Plan

- [ ] 1. Create the useApi hook file and implement core structure
  - Create `lib/client/hooks/useApi.js` file
  - Import necessary React hooks (useState, useEffect, useCallback, useRef)
  - Set up the main hook function signature with endpoint and options parameters
  - Initialize state variables for data, loading, and error
  - Create AbortController ref for request cancellation
  - _Requirements: 1.1, 2.1_

- [x] 2. Implement the buildUrl helper function
  - Create buildUrl function that accepts endpoint parameter
  - Check if endpoint starts with 'http://' or 'https://'
  - If full URL, return as-is
  - If relative path, read NEXT_PUBLIC_BACKEND_BASE_URL from environment
  - Handle trailing slashes in base URL and leading slashes in endpoint
  - Return concatenated URL
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Implement the executeRequest function
  - Create executeRequest function that accepts dynamicBody and dynamicHeaders parameters
  - Clear error state and set loading to true at start
  - Create new AbortController and store in ref
  - Determine final body (dynamicBody or options.body)
  - Merge headers: default headers, options.headers, dynamicHeaders
  - Add Content-Type: application/json when body is present
  - Build complete URL using buildUrl
  - Create fetch configuration with method, headers, body (JSON stringified), and abort signal
  - _Requirements: 1.2, 1.3, 2.2, 2.4, 2.5, 4.5, 5.2, 5.3, 5.4_

- [x] 4. Implement request execution and response handling
  - Wrap fetch call in try-catch block
  - Check response.ok status
  - If not ok, parse response JSON and extract error from error field or use statusText
  - If ok, parse response JSON and set data state
  - Set loading to false after success
  - Return parsed data from function
  - _Requirements: 1.3, 1.4, 6.1, 6.2, 6.3_

- [x] 5. Implement error handling in executeRequest
  - In catch block, check if error is AbortError
  - If AbortError, do nothing (no state updates)
  - If other error, set error state with error message
  - Set loading to false
  - Handle JSON parsing errors appropriately
  - _Requirements: 1.4, 6.1, 6.2, 6.3, 6.4, 7.2, 7.4_

- [x] 6. Wrap executeRequest with useCallback
  - Use useCallback to memoize executeRequest function
  - Include appropriate dependencies in dependency array
  - Return the memoized execute function from the hook
  - _Requirements: 4.1_

- [x] 7. Implement immediate execution with useEffect
  - Create useEffect that checks options.immediate flag
  - If immediate is true, call executeRequest
  - Add executeRequest to dependency array
  - _Requirements: 4.2, 4.3_

- [x] 8. Implement cleanup on unmount
  - Add cleanup function to useEffect
  - In cleanup, abort the current request using AbortController
  - Ensure cleanup runs on unmount
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 9. Return hook values
  - Return object with data, loading, error, and execute properties
  - Ensure all values are properly exposed
  - _Requirements: 1.1_

- [ ]* 10. Write unit tests for useApi hook
  - Test initial state (data: null, loading: false, error: null)
  - Test default GET method when not specified
  - Test URL construction with various slash combinations
  - Test error message extraction from response
  - Test abort on unmount
  - _Requirements: All_

- [x] 11. Create example usage documentation
  - Add JSDoc comments to the hook explaining parameters and return values
  - Include usage examples in comments
  - Document the execute function parameters
  - _Requirements: All_
