# Database Page - Setup Instructions

## Current State
The database page is currently using **example data** to display the database schema visualization.

## Switching to Real API Data

When you're ready to use real data from the API, follow these steps:

### Step 1: Comment Out Example Data
In `page.jsx`, find the section marked with:
```javascript
// ============================================
// EXAMPLE DATA - Comment out this section when using real API data
// ============================================
```

Comment out the entire `EXAMPLE_DATA` constant (lines ~8-50).

### Step 2: Uncomment the API Hook
Find this commented section (around line 70):
```javascript
// const { data: databasesData, loading, error } = useApi(
//     `/v1/getProjectDatabases?projectId=${projectId}&environment=development`,
//     { method: 'GET', immediate: true }
// );
```

Uncomment these lines to enable the API call.

### Step 3: Update Data Source
Find these lines (around line 75):
```javascript
// Using example data (comment this out when using real API)
const loading = false;
const error = null;
const databases = EXAMPLE_DATA.databases;

// Using real API data (uncomment this when ready)
// const databases = databasesData?.databases || [];
```

Comment out the example data lines and uncomment the real API data line:
```javascript
// Using example data (comment this out when using real API)
// const loading = false;
// const error = null;
// const databases = EXAMPLE_DATA.databases;

// Using real API data (uncomment this when ready)
const databases = databasesData?.databases || [];
```

### Step 4: Test
Save the file and refresh the page. The database page should now fetch and display real data from your API.

## API Endpoint
The page uses the `GET /v1/getProjectDatabases` endpoint with the following query parameters:
- `projectId`: The current project ID from the URL
- `environment`: Set to "development" (can be modified as needed)

## Expected API Response Format
```json
{
  "success": true,
  "databases": [
    {
      "database_id": "string",
      "db_name": "string",
      "db_schema": "string (JSON stringified)",
      "environment": "string",
      "is_active": boolean,
      "created_at": number,
      "updated_at": number
    }
  ]
}
```

The `db_schema` field should contain a JSON string with this structure:
```json
{
  "tables": [
    {
      "tableName": "string",
      "columns": [
        {
          "name": "string",
          "type": "string",
          "primaryKey": boolean,
          "nullable": boolean,
          "unique": boolean,
          "default": any,
          "foreignKey": {
            "table": "string",
            "column": "string",
            "onDelete": "string"
          }
        }
      ],
      "indexes": [
        {
          "name": "string",
          "columns": ["string"]
        }
      ]
    }
  ]
}
```
