# Design Document

## Hook Interface

### useApi Hook

```javascript
const { data, loading, error, execute } = useApi(endpoint, options);
```

**Parameters:**
- `endpoint` (string): The API endpoint path (e.g., '/api/v1/createNewProject') or full URL
- `options` (object, optional):
  - `method` (string): HTTP method - 'GET', 'POST', 'PUT', 'DELETE', 'PATCH' (default: 'GET')
  - `headers` (object): Custom headers to include in the request
  - `immediate` (boolean): Whether to execute the request immediately on mount (default: false)
  - `body` (object): Request body for POST/PUT/PATCH requests

**Return Values:**
- `data` (any): The parsed JSON response data, or null if no request has completed
- `loading` (boolean): True when a request is in progress, false otherwise
- `error` (string|null): Error message if the request failed, null otherwise
- `execute` (function): Manual execution function that accepts optional body and headers parameters

## Internal Functions

### buildUrl(endpoint)

**Parameters:**
- `endpoint` (string): The endpoint path or full URL

**Logic:**
- Check if endpoint starts with 'http://' or 'https://'
- If yes, return endpoint as-is
- If no, read base URL from `process.env.NEXT_PUBLIC_BACKEND_BASE_URL`
- Remove trailing slash from base URL if present
- Ensure endpoint starts with '/'
- Concatenate base URL and endpoint
- Return the complete URL

### executeRequest(dynamicBody, dynamicHeaders)

**Parameters:**
- `dynamicBody` (object, optional): Request body for this specific call
- `dynamicHeaders` (object, optional): Additional headers for this specific call

**Logic:**
- Clear any existing error state
- Set loading state to true
- Create new AbortController and store in ref
- Determine final body: use dynamicBody if provided, otherwise use options.body
- Determine final headers: merge default headers, options.headers, and dynamicHeaders
- If body exists, add 'Content-Type': 'application/json' to headers
- Build complete URL using buildUrl function
- Create fetch configuration object with method, headers, body (JSON stringified if present), and abort signal
- Execute fetch request with try-catch
- In try block:
  - Check if response.ok (status 200-299)
  - If not ok, parse response JSON and extract error message from error field or use statusText
  - Throw error with the message
  - If ok, parse response JSON
  - Set data state with parsed response
  - Set loading to false
  - Return parsed data
- In catch block:
  - Check if error is abort error (error.name === 'AbortError')
  - If abort error, do nothing (don't update state)
  - If other error, set error state with error message
  - Set loading to false
```


