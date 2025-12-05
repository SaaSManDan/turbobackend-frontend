# Requirements Document

## Introduction

This document specifies the requirements for a reusable React hook called `useApi` that standardizes API calls across the TurboBackend frontend application. The hook provides a consistent interface for making HTTP requests with built-in loading states, error handling, and response management.

## Glossary

- **useApi Hook**: A custom React hook that encapsulates fetch API logic and state management for HTTP requests
- **Loading State**: A boolean flag indicating whether an API request is currently in progress
- **Error State**: A string containing error information when an API request fails, or null when no error exists
- **Response Data**: The parsed JSON data returned from a successful API request
- **Base URL**: The root URL for API endpoints, read from NEXT_PUBLIC_BACKEND_BASE_URL environment variable
- **Abort Controller**: A browser API mechanism for canceling in-flight HTTP requests
- **Execute Function**: The function returned by the hook that triggers API requests manually

## Requirements

### Requirement 1

**User Story:** As a frontend developer, I want to make API calls with automatic state management, so that I can easily track loading, data, and errors without manual state handling.

#### Acceptance Criteria

1. THE useApi Hook SHALL return an object containing data, loading, error, and execute properties
2. WHEN the useApi Hook initiates a request, THE useApi Hook SHALL set loading to true and clear any previous error
3. WHEN the useApi Hook receives a successful response, THE useApi Hook SHALL set data to the parsed JSON, set loading to false, and keep error as null
4. WHEN the useApi Hook receives an error response, THE useApi Hook SHALL set error to the error message, set loading to false, and keep data unchanged

### Requirement 2

**User Story:** As a frontend developer, I want to make API calls with different HTTP methods and request bodies, so that I can perform various operations using the same hook.

#### Acceptance Criteria

1. THE useApi Hook SHALL accept an endpoint parameter and an optional options object
2. THE useApi Hook SHALL support GET, POST, PUT, DELETE, and PATCH HTTP methods via the options.method parameter
3. WHEN no HTTP method is specified, THE useApi Hook SHALL default to GET
4. WHEN a request body is provided via options.body or execute function parameters, THE useApi Hook SHALL serialize it to JSON and include it in the request
5. WHEN a request includes a body, THE useApi Hook SHALL set the Content-Type header to application/json

### Requirement 3

**User Story:** As a frontend developer, I want the hook to construct URLs automatically, so that I don't have to repeat the base URL in every API call.

#### Acceptance Criteria

1. WHEN an endpoint path is provided (not starting with http:// or https://), THE useApi Hook SHALL read the base URL from NEXT_PUBLIC_BACKEND_BASE_URL and concatenate it with the endpoint
2. WHEN a full URL is provided (starting with http:// or https://), THE useApi Hook SHALL use it directly without modification
3. THE useApi Hook SHALL handle trailing slashes in base URLs and leading slashes in endpoint paths to avoid double slashes

### Requirement 4

**User Story:** As a frontend developer, I want to trigger API calls manually or automatically, so that I can control when requests are made.

#### Acceptance Criteria

1. THE useApi Hook SHALL return an execute function that can be called to trigger requests manually
2. THE useApi Hook SHALL accept an options.immediate flag
3. WHEN options.immediate is true, THE useApi Hook SHALL execute the request when the component mounts
4. WHEN options.immediate is false or undefined, THE useApi Hook SHALL only execute requests when the execute function is called
5. THE execute function SHALL accept optional dynamicBody and dynamicHeaders parameters that override the options values for that specific call

### Requirement 5

**User Story:** As a frontend developer, I want to include custom headers in requests, so that I can add authentication tokens or other required headers.

#### Acceptance Criteria

1. THE useApi Hook SHALL accept an options.headers object
2. WHEN custom headers are provided, THE useApi Hook SHALL merge them with default headers
3. WHEN the same header key exists in both custom and default headers, THE useApi Hook SHALL use the custom header value
4. THE execute function SHALL accept dynamicHeaders that are merged with options.headers for that specific call

### Requirement 6

**User Story:** As a frontend developer, I want the hook to handle errors properly, so that I can display meaningful error messages to users.

#### Acceptance Criteria

1. WHEN a network error occurs, THE useApi Hook SHALL set the error state to the error message
2. WHEN a response has a non-2xx status code, THE useApi Hook SHALL parse the response JSON and extract the error message from the error field
3. IF the error field is not present in the response, THE useApi Hook SHALL use the response statusText as the error message
4. WHEN JSON parsing of an error response fails, THE useApi Hook SHALL set a generic error message

### Requirement 7

**User Story:** As a frontend developer, I want the hook to prevent memory leaks and race conditions, so that my application remains stable.

#### Acceptance Criteria

1. THE useApi Hook SHALL use AbortController to manage request cancellation
2. WHEN a component unmounts during a request, THE useApi Hook SHALL abort the request and prevent state updates
3. WHEN a new request starts while a previous request is in-flight, THE useApi Hook SHALL abort the previous request
4. WHEN a request is aborted, THE useApi Hook SHALL not update the component state
