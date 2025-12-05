---
inclusion: manual
---

# API Endpoint Specifications

## POST /v1/createNewProject

### Description

Creates a new project for the authenticated user and automatically generates a default MCP API key for the project. Requires authentication via Clerk token in Authorization header. The user ID is extracted from the auth context set by the authentication middleware.

### Authentication

Requires Bearer token in Authorization header. Authentication is handled by middleware which sets `event.context.auth.userId`.

### Request Body

```json
{
  "projectName": "string (required)"
}
```

### Response

**Success (200):**
```json
{
  "success": true,
  "projectId": "string - nanoid of created project",
  "mcpKey": "string - plaintext MCP API key (format: tb_live_{random_string})"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Invalid input. projectName is required."
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Failed to create project"
}
```

### Notes

- Authentication errors (401) are handled by the auth middleware before reaching this endpoint
- User ID is automatically extracted from the verified token via `event.context.auth.userId`
- The `projectId` is generated as a lowercase alphanumeric nanoid with underscores replaced by random lowercase letters or numbers
- A default MCP API key is automatically created for the project with the format `tb_live_{random_string}`
- The plaintext MCP key is returned in the response for the user to save (this is the only time it will be visible)
- The MCP key is stored as an encrypted value in the database using the encryption utility
- The default key is named "Default Key" and is active with no expiration date


## GET /v1/getAllProjects

### Description

Retrieves all projects for the authenticated user. Returns projects ordered by creation date (newest first). Requires authentication via Clerk token in Authorization header. The user ID is extracted from the auth context set by the authentication middleware.

### Authentication

Requires Bearer token in Authorization header. Authentication is handled by middleware which sets `event.context.auth.userId`.

### Request Body

None (GET request)

### Response

**Success (200):**
```json
{
  "success": true,
  "projects": [
    {
      "project_id": "string - nanoid",
      "project_name": "string",
      "created_at": "number - unix timestamp in seconds",
      "updated_at": "number - unix timestamp in seconds"
    }
  ]
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Failed to fetch projects"
}
```

### Notes

- Authentication errors (401) are handled by the auth middleware before reaching this endpoint
- User ID is automatically extracted from the verified token via `event.context.auth.userId`
- Projects are returned in descending order by creation date (newest first)


## GET /v1/getMcpKey

### Description

Retrieves the active MCP API key for a specific project. Returns the decrypted key along with metadata including key name, creation date, last used date, and expiration date. Requires authentication via Clerk token in Authorization header and verifies that the authenticated user owns the requested project.

### Authentication

Requires Bearer token in Authorization header. Authentication is handled by middleware which sets `event.context.auth.userId`.

### Query Parameters

```
project_id: string (required) - The project ID to retrieve the MCP key for
```

### Response

**Success (200):**
```json
{
  "success": true,
  "mcpKey": "string - decrypted plaintext MCP API key",
  "keyName": "string - name of the key",
  "createdAt": "number - unix timestamp in seconds",
  "lastUsedAt": "number - unix timestamp in seconds or null",
  "expiresAt": "number - unix timestamp in seconds or null"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "project_id is required"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": "Project not found or access denied"
}
```

OR

```json
{
  "success": false,
  "error": "No active MCP key found for this project"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Failed to decrypt MCP key"
}
```

OR

```json
{
  "success": false,
  "error": "Failed to get MCP key"
}
```

### Notes

- Authentication errors (401) are handled by the auth middleware before reaching this endpoint
- User ID is automatically extracted from the verified token via `event.context.auth.userId`
- The endpoint verifies project ownership before returning the key
- Only active MCP keys are returned (is_active = true)
- If multiple active keys exist, the most recently created one is returned
- The MCP key is decrypted from its stored encrypted format before being returned
- Decryption errors are caught and return a 500 error with a generic error message



## GET /v1/getProjectDetails

### Description

Retrieves basic details for a specific project including project ID, name, and timestamps. Requires authentication via Clerk token in Authorization header and verifies that the authenticated user has access to the requested project using RLS (Row Level Security) checks.

### Authentication

Requires Bearer token in Authorization header. Authentication is handled by middleware which sets `event.context.auth.userId`.

### Query Parameters

```
projectId: string (required) - The project ID to retrieve details for
```

### Response

**Success (200):**
```json
{
  "success": true,
  "project": {
    "project_id": "string - nanoid",
    "project_name": "string",
    "created_at": "number - unix timestamp in seconds",
    "updated_at": "number - unix timestamp in seconds"
  }
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "projectId is required"
}
```

**Access Denied (403):**
```json
{
  "success": false,
  "error": "Access denied to this project"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": "Project not found"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Failed to fetch project details"
}
```

### Notes

- Authentication errors (401) are handled by the auth middleware before reaching this endpoint
- User ID is automatically extracted from the verified token via `event.context.auth.userId`
- RLS check is performed using `verifyProjectAccess()` to ensure the user has access to the project
- The endpoint uses a database connection from the connection pool and properly releases it after use


## GET /v1/getProjectActions

### Description

Retrieves all actions for a specific project and environment. Returns actions ordered by creation date (newest first). Requires authentication via Clerk token in Authorization header and verifies that the authenticated user has access to the requested project using RLS (Row Level Security) checks.

### Authentication

Requires Bearer token in Authorization header. Authentication is handled by middleware which sets `event.context.auth.userId`.

### Query Parameters

```
projectId: string (required) - The project ID to retrieve actions for
environment: string (required) - The environment to filter actions by
```

### Response

**Success (200):**
```json
{
  "success": true,
  "actions": [
    {
      "action_id": "string - nanoid",
      "project_id": "string - nanoid",
      "user_id": "string",
      "request_id": "string",
      "action_type": "string",
      "action_details": "string - varchar details",
      "status": "string",
      "environment": "string",
      "reference_ids": "object - JSON reference IDs",
      "created_at": "number - unix timestamp in seconds"
    }
  ]
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "projectId and environment are required"
}
```

**Access Denied (403):**
```json
{
  "success": false,
  "error": "Access denied to this project"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Failed to fetch project actions"
}
```

### Notes

- Authentication errors (401) are handled by the auth middleware before reaching this endpoint
- User ID is automatically extracted from the verified token via `event.context.auth.userId`
- RLS check is performed using `verifyProjectAccess()` to ensure the user has access to the project
- Actions are returned in descending order by creation date (newest first)
- The endpoint uses a database connection from the connection pool and properly releases it after use


## GET /v1/getProjectDatabases

### Description

Retrieves all database schemas for a specific project and environment. Returns database information ordered by creation date (newest first). Requires authentication via Clerk token in Authorization header and verifies that the authenticated user has access to the requested project using RLS (Row Level Security) checks.

### Authentication

Requires Bearer token in Authorization header. Authentication is handled by middleware which sets `event.context.auth.userId`.

### Query Parameters

```
projectId: string (required) - The project ID to retrieve databases for
environment: string (required) - The environment to filter databases by
```

### Response

**Success (200):**
```json
{
  "success": true,
  "databases": [
    {
      "database_id": "string - nanoid",
      "project_id": "string - nanoid",
      "user_id": "string",
      "db_name": "string",
      "db_schema": "string",
      "environment": "string",
      "is_active": "boolean",
      "created_at": "number - unix timestamp in seconds",
      "updated_at": "number - unix timestamp in seconds"
    }
  ]
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "projectId and environment are required"
}
```

**Access Denied (403):**
```json
{
  "success": false,
  "error": "Access denied"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": "Project not found"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Failed to fetch project databases"
}
```

### Notes

- Authentication errors (401) are handled by the auth middleware before reaching this endpoint
- User ID is automatically extracted from the verified token via `event.context.auth.userId`
- RLS check is performed using `verifyProjectAccess()` to ensure the user owns the project
- Databases are returned in descending order by creation date (newest first)
- The endpoint uses a database connection from the connection pool and properly releases it after use


## GET /v1/getApiBlueprints

### Description

Retrieves all API blueprints for a specific project and environment. Returns blueprints ordered by creation date (newest first). Requires authentication via Clerk token in Authorization header and verifies that the authenticated user has access to the requested project using RLS (Row Level Security) checks.

### Authentication

Requires Bearer token in Authorization header. Authentication is handled by middleware which sets `event.context.auth.userId`.

### Query Parameters

```
projectId: string (required) - The project ID to retrieve API blueprints for
environment: string (required) - The environment to filter blueprints by
```

### Response

**Success (200):**
```json
{
  "success": true,
  "blueprints": [
    {
      "blueprint_id": "string - nanoid",
      "project_id": "string - nanoid",
      "request_id": "string",
      "blueprint_content": "string - text content",
      "created_at": "number - unix timestamp in seconds"
    }
  ]
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "projectId and environment are required"
}
```

**Access Denied (403):**
```json
{
  "success": false,
  "error": "Access denied"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": "Project not found"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Failed to fetch API blueprints"
}
```

### Notes

- Authentication errors (401) are handled by the auth middleware before reaching this endpoint
- User ID is automatically extracted from the verified token via `event.context.auth.userId`
- RLS check is performed using `verifyProjectAccess()` to ensure the user owns the project
- Blueprints are returned in descending order by creation date (newest first)
- The endpoint uses a database connection from the connection pool and properly releases it after use


## GET /v1/getProjectDeployments

### Description

Retrieves all backend application deployments for a specific project and environment. Returns deployments ordered by deployment date (newest first). Requires authentication via Clerk token in Authorization header and verifies that the authenticated user has access to the requested project using RLS (Row Level Security) checks.

### Authentication

Requires Bearer token in Authorization header. Authentication is handled by middleware which sets `event.context.auth.userId`.

### Query Parameters

```
projectId: string (required) - The project ID to retrieve deployments for
environment: string (required) - The environment to filter deployments by
```

### Response

**Success (200):**
```json
{
  "success": true,
  "deployments": [
    {
      "deployment_id": "string - nanoid",
      "project_id": "string - nanoid",
      "platform": "string",
      "app_name": "string",
      "url": "string",
      "status": "string",
      "deployed_at": "number - unix timestamp in seconds",
      "last_updated": "number - unix timestamp in seconds"
    }
  ]
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "projectId and environment are required"
}
```

**Access Denied (403):**
```json
{
  "success": false,
  "error": "Access denied"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": "Project not found"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Failed to fetch project deployments"
}
```

### Notes

- Authentication errors (401) are handled by the auth middleware before reaching this endpoint
- User ID is automatically extracted from the verified token via `event.context.auth.userId`
- RLS check is performed using `verifyProjectAccess()` to ensure the user owns the project
- Deployments are returned in descending order by deployment date (newest first)
- The endpoint uses a database connection from the connection pool and properly releases it after use


## GET /v1/getProjectFiles

### Description

Retrieves a list of all code files stored in a project's S3 bucket. Returns file metadata including file paths, sizes, and last modified dates. Requires authentication via Clerk token in Authorization header and verifies that the authenticated user has access to the requested project using RLS (Row Level Security) checks.

### Authentication

Requires Bearer token in Authorization header. Authentication is handled by middleware which sets `event.context.auth.userId`.

### Query Parameters

```
projectId: string (required) - The project ID to retrieve files for
```

### Response

**Success (200):**
```json
{
  "success": true,
  "files": [
    {
      "key": "string - file path relative to project folder",
      "size": "number - file size in bytes",
      "lastModified": "string - ISO 8601 timestamp"
    }
  ]
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "projectId is required"
}
```

**Access Denied (403):**
```json
{
  "success": false,
  "error": "Access denied"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": "Project not found"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Failed to fetch project files"
}
```

### Notes

- Authentication errors (401) are handled by the auth middleware before reaching this endpoint
- User ID is automatically extracted from the verified token via `event.context.auth.userId`
- RLS check is performed using `verifyProjectAccess()` to ensure the user owns the project
- Files are retrieved from S3 using AWS SDK v3 `ListObjectsV2Command`
- The S3 bucket name is configured via `S3_PROJECTS_BUCKET` environment variable
- Files are stored in S3 with the prefix `{projectId}/`
- The prefix is removed from file keys in the response for cleaner paths
- Returns an empty array if no files are found for the project


## GET /v1/getProjectFileContent

### Description

Retrieves the content of a specific code file from a project's S3 bucket. Returns the file content as a string. Requires authentication via Clerk token in Authorization header and verifies that the authenticated user has access to the requested project using RLS (Row Level Security) checks.

### Authentication

Requires Bearer token in Authorization header. Authentication is handled by middleware which sets `event.context.auth.userId`.

### Query Parameters

```
projectId: string (required) - The project ID the file belongs to
filePath: string (required) - The relative path to the file within the project folder
```

### Response

**Success (200):**
```json
{
  "success": true,
  "content": "string - file content",
  "filePath": "string - the requested file path"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "projectId and filePath are required"
}
```

**Access Denied (403):**
```json
{
  "success": false,
  "error": "Access denied"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": "Project not found"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Failed to fetch project file content"
}
```

### Notes

- Authentication errors (401) are handled by the auth middleware before reaching this endpoint
- User ID is automatically extracted from the verified token via `event.context.auth.userId`
- RLS check is performed using `verifyProjectAccess()` to ensure the user owns the project
- File content is retrieved from S3 using AWS SDK v3 `GetObjectCommand`
- The S3 bucket name is configured via `S3_PROJECTS_BUCKET` environment variable
- Files are stored in S3 with the key format `{projectId}/{filePath}`
- The response stream is converted to a UTF-8 string before being returned
- If the file doesn't exist in S3, an error will be returned



## GET /v1/getProjectDetails

### Description

Retrieves detailed information about a specific project including project name, creation date, and last update date. Requires authentication via Clerk token in Authorization header and verifies that the authenticated user has access to the requested project using RLS (Row Level Security) checks.

### Authentication

Requires Bearer token in Authorization header. Authentication is handled by middleware which sets `event.context.auth.userId`.

### Query Parameters

```
projectId: string (required) - The project ID to retrieve details for
```

### Response

**Success (200):**
```json
{
  "success": true,
  "project": {
    "project_id": "string - nanoid",
    "project_name": "string",
    "created_at": "number - unix timestamp in seconds",
    "updated_at": "number - unix timestamp in seconds"
  }
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "projectId is required"
}
```

**Access Denied (403):**
```json
{
  "success": false,
  "error": "Access denied"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": "Project not found"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Failed to fetch project details"
}
```

### Notes

- Authentication errors (401) are handled by the auth middleware before reaching this endpoint
- User ID is automatically extracted from the verified token via `event.context.auth.userId`
- RLS check is performed using `verifyProjectAccess()` to ensure the user owns the project
- The endpoint uses a database connection from the connection pool and properly releases it after use
- This endpoint is useful for displaying project information in the frontend, such as in an overview page


## GET /v1/getCloudCredentials

### Description

Retrieves all cloud provider credentials for a specific project. Returns credential metadata including provider type, credential name, region, and validation status indicating whether any fields are missing or empty. The actual decrypted credential values are returned in the `credentialFields` object. Requires authentication via Clerk token in Authorization header and verifies that the authenticated user has access to the requested project using RLS (Row Level Security) checks. Access control is enforced solely through the RLS check rather than database-level filtering.

### Authentication

Requires Bearer token in Authorization header. Authentication is handled by middleware which sets `event.context.auth.userId`.

### Query Parameters

```
projectId: string (required) - The project ID to retrieve cloud credentials for
```

### Response

**Success (200):**
```json
{
  "success": true,
  "credentials": [
    {
      "credentialId": "string - nanoid",
      "cloudProvider": "string - aws, gcp, azure, stripe, clerk, etc.",
      "credentialName": "string",
      "defaultRegion": "string",
      "isActive": "boolean",
      "hasMissingFields": "boolean - true if any fields are missing or empty",
      "credentialFields": {
        "fieldName": "string - actual decrypted credential value"
      },
      "createdAt": "number - unix timestamp in seconds",
      "updatedAt": "number - unix timestamp in seconds"
    }
  ]
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "projectId is required"
}
```

**Access Denied (403):**
```json
{
  "success": false,
  "error": "Access denied"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": "Project not found"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Failed to fetch cloud credentials"
}
```

### Notes

- Authentication errors (401) are handled by the auth middleware before reaching this endpoint
- User ID is automatically extracted from the verified token via `event.context.auth.userId`
- RLS check is performed using `verifyProjectAccess()` to ensure the user owns the project
- Credentials are returned in descending order by creation date (newest first)
- The actual credential values are decrypted and returned in the `credentialFields` object as key-value pairs
- The `credentialFields` object contains all fields present in the stored credentials with their actual decrypted values
- A field is considered empty if it's null, undefined, or a string with only whitespace
- If decryption fails, `hasMissingFields` is set to true and `credentialFields` is an empty object
- The endpoint uses a database connection from the connection pool and properly releases it after use


## POST /v1/updateCloudCredentials

### Description

Creates new cloud provider credentials or updates existing ones for a specific project. When updating, the endpoint merges new credential fields with existing ones, allowing partial updates without overwriting all fields. Credentials are encrypted before storage. Requires authentication via Clerk token in Authorization header and verifies that the authenticated user has access to the requested project using RLS (Row Level Security) checks.

### Authentication

Requires Bearer token in Authorization header. Authentication is handled by middleware which sets `event.context.auth.userId`.

### Request Body

```json
{
  "projectId": "string (required) - The project ID",
  "credentialId": "string (optional) - If provided, updates existing credential. If omitted, creates new credential",
  "cloudProvider": "string (required for new credentials) - aws, gcp, or azure",
  "credentialName": "string (optional) - Display name for the credential",
  "credentials": "object (required) - Key-value pairs of credential fields",
  "defaultRegion": "string (optional) - Default region for the cloud provider"
}
```

### Response

**Success (200):**
```json
{
  "success": true,
  "credentialId": "string - nanoid of created or updated credential",
  "message": "Credentials created successfully" | "Credentials updated successfully"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "projectId is required"
}
```

OR

```json
{
  "success": false,
  "error": "credentials object is required"
}
```

OR

```json
{
  "success": false,
  "error": "cloudProvider is required when creating new credentials"
}
```

**Access Denied (403):**
```json
{
  "success": false,
  "error": "Access denied"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": "Credential not found"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Failed to update cloud credentials"
}
```

### Notes

- Authentication errors (401) are handled by the auth middleware before reaching this endpoint
- User ID is automatically extracted from the verified token via `event.context.auth.userId`
- RLS check is performed using `verifyProjectAccess()` to ensure the user owns the project
- **Update mode** (when `credentialId` is provided):
  - Verifies the credential belongs to the user and project
  - Decrypts existing credentials and merges with new fields
  - Allows partial updates without losing existing fields
  - Can optionally update `defaultRegion`
- **Create mode** (when `credentialId` is omitted):
  - Requires `cloudProvider` to be specified
  - Generates a new credential ID using nanoid
  - Sets `credentialName` to `{cloudProvider} Credentials` if not provided
  - Sets `is_active` to true by default
- All credential values are encrypted using the encryption utility before storage
- The endpoint uses database transactions to ensure data consistency
- The endpoint uses a database connection from the connection pool and properly releases it after use
