
# Google Sheets API with Apps Script

This Google Apps Script provides a `GET` and `POST` API to interact with Google Sheets. You can use it to retrieve, append, edit, or delete rows based on specified criteria.

## API Endpoints

### `GET` Request

#### Usage
- **Mandatory Parameters:** `sheetId`, `sheetName`
- **Optional Parameters:**
  - `requestedData`: Comma-separated list of column names to return (e.g., `requestedData=heading1,heading2`)
  - `filter`: Colon-separated pairs of column names and values to filter by (e.g., `filter=heading1:value1,heading2:value2`)

#### Example Request
```url
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?sheetId=YOUR_SHEET_ID&sheetName=YOUR_SHEET_NAME&requestedData=heading1,heading2&filter=heading1:value1,heading2:value2
```

#### Example Response
```json
{
  "success": true,
  "data": [
    {
      "heading1": "value1",
      "heading2": "value2"
    },
    ...
  ]
}
```

#### Error Handling
If an error occurs, the response will be in the following format:
```json
{
  "success": false,
  "data": "Error message"
}
```

### `POST` Request

#### Usage
- **Mandatory Parameters:** `sheetId`, `sheetName`, `method`, `data`
- **Methods:**
  - `append`: Adds new rows with the provided data
  - `edit`: Edits a single row based on the filter criteria
  - `editAll`: Edits all rows matching the filter criteria
  - `delete`: Deletes a single row based on the filter criteria
  - `deleteAll`: Deletes all rows matching the filter criteria

#### Data Format
- **append:**
  ```json
  [
    {"column1": "value1", "column2": "value2"},
    ...
  ]
  ```
- **edit, editAll:**
  ```json
  {
    "filter": [{"column": "value"}, ...],
    "edit": [{"column": "value"}, ...]
  }
  ```
- **delete, deleteAll:**
  ```json
  {
    "filter": [{"column": "value"}, ...]
  }
  ```

#### Example Request
```url
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```
- **Request Body:**
  ```json
  {
    "sheetId": "YOUR_SHEET_ID",
    "sheetName": "YOUR_SHEET_NAME",
    "method": "append",
    "data": [
      {"column1": "value1", "column2": "value2"},
      ...
    ]
  }
  ```

#### Example Response
```json
{
  "success": true,
  "data": "Data appended successfully"
}
```

#### Error Handling
If an error occurs, the response will be in the following format:
```json
{
  "success": false,
  "data": "Error message"
}
```

## Detailed Method Explanations

### Append Method
- **Description:** Adds new rows to the sheet with the provided data.
- **Data Format:** An array of objects, where each object represents a row.
- **Example:**
  ```json
  {
    "sheetId": "YOUR_SHEET_ID",
    "sheetName": "Projects",
    "method": "append",
    "data": [
      {"column1": "value1", "column2": "value2"},
      {"column1": "value3", "column2": "value4"}
    ]
  }
  ```

### Edit Method
- **Description:** Edits a single row based on the filter criteria. Shows an error if multiple or no rows match.
- **Data Format:** An object containing `filter` and `edit` arrays.
- **Example:**
  ```json
  {
    "sheetId": "YOUR_SHEET_ID",
    "sheetName": "Projects",
    "method": "edit",
    "data": {
      "filter": [{"column": "column1", "value": "value1"}, {"column": "column2", "value": "value2"}],
      "edit": [{"column": "column3", "value": "new_value1"}, {"column": "column4", "value": "new_value2"}]
    }
  }
  ```

### EditAll Method
- **Description:** Edits all rows matching the filter criteria.
- **Data Format:** Same as `edit`.
- **Example:**
  ```json
  {
    "sheetId": "YOUR_SHEET_ID",
    "sheetName": "Projects",
    "method": "editAll",
    "data": {
      "filter": [{"column": "column1", "value": "value1"}],
      "edit": [{"column": "column3", "value": "new_value"}]
    }
  }
  ```

### Delete Method
- **Description:** Deletes a single row based on the filter criteria. Shows an error if multiple or no rows match.
- **Data Format:** An object containing a `filter` array.
- **Example:**
  ```json
  {
    "sheetId": "YOUR_SHEET_ID",
    "sheetName": "Projects",
    "method": "delete",
    "data": {
      "filter": [{"column": "column1", "value": "value1"}, {"column": "column2", "value": "value2"}]
    }
  }
  ```

### DeleteAll Method
- **Description:** Deletes all rows matching the filter criteria.
- **Data Format:** Same as `delete`.
- **Example:**
  ```json
  {
    "sheetId": "YOUR_SHEET_ID",
    "sheetName": "Projects",
    "method": "deleteAll",
    "data": {
      "filter": [{"column": "column1", "value": "value1"}]
    }
  }
  ```

## Error Handling
- If an error occurs during any operation, the response will be:
  ```json
  {
    "success": false,
    "data": "Error message"
  }
  ```

## Conclusion
This API allows you to interact with Google Sheets by retrieving, appending, editing, and deleting rows based on specified criteria. Make sure to handle the responses and errors appropriately in your application.