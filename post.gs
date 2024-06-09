function doPost(e) {
    try {
      const params = JSON.parse(e.postData.contents);
      if (params.help) {
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          data: `Guide:
          - Mandatory parameters: sheetId, sheetName, method, data
          - Methods:
            - append: Adds new rows with the provided data
            - edit: Edits a single row based on the filter criteria
            - editAll: Edits all rows matching the filter criteria
            - delete: Deletes a single row based on the filter criteria
            - deleteAll: Deletes all rows matching the filter criteria
          - Data format:
            - append: [{"column1":"value1", "column2":"value2", ...}]
            - edit, editAll: { "filter": [{"column":"value"}, ...], "edit": [{"column":"value"}, ...] }
            - delete, deleteAll: { "filter": [{"column":"value"}, ...] }`
        })).setMimeType(ContentService.MimeType.JSON);
      }
  
      const { sheetId, sheetName, method, data } = params;
      if (!sheetId || !sheetName || !method || !data) {
        throw new Error("Missing mandatory parameters: \"sheetId\", \"sheetName\", \"method\", or \"data\"");
      }
  
      const ss = SpreadsheetApp.openById(sheetId);
      const sheet = ss.getSheetByName(sheetName);
  
      if (!sheet) {
        throw new Error(`Sheet "${sheetName}" not found in the provided spreadsheet.`);
      }
  
      const dataRange = sheet.getDataRange().getValues();
      const [headerRow, ...rows] = dataRange;
  
      switch (method) {
        case 'append':
          return appendData(sheet, headerRow, data);
        case 'edit':
          return editData(sheet, headerRow, rows, data, false);
        case 'editAll':
          return editData(sheet, headerRow, rows, data, true);
        case 'delete':
          return deleteData(sheet, headerRow, rows, data, false);
        case 'deleteAll':
          return deleteData(sheet, headerRow, rows, data, true);
        default:
          throw new Error(`Invalid method: "${method}". Valid methods are: append, edit, editAll, delete, deleteAll`);
      }
    } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        data: error.message
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  function appendData(sheet, headerRow, data) {
    const newRows = data.map(item => {
      return headerRow.map(header => item[header] || "");
    });
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: "Data appended successfully"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  function editData(sheet, headerRow, rows, data, editAll) {
    const { filter, edit } = data;
    const filterObj = filter.reduce((obj, { column, value }) => {
      obj[column] = value;
      return obj;
    }, {});
    const editObj = edit.reduce((obj, { column, value }) => {
      obj[column] = value;
      return obj;
    }, {});
  
    const filteredRows = rows.map((row, index) => {
      const rowObj = headerRow.reduce((obj, header, i) => {
        obj[header] = row[i];
        return obj;
      }, {});
      return { rowObj, index };
    }).filter(({ rowObj }) => {
      return Object.keys(filterObj).every(key => rowObj[key] === filterObj[key]);
    });
  
    if (filteredRows.length === 0) {
      throw new Error("No matching rows found.");
    }
    if (!editAll && filteredRows.length > 1) {
      throw new Error("Multiple matching rows found.");
    }
  
    filteredRows.forEach(({ index }) => {
      const rowIndex = index + 2; // Account for header row
      Object.keys(editObj).forEach(key => {
        const colIndex = headerRow.indexOf(key) + 1;
        if (colIndex < 1) {
          throw new Error(`Invalid column: "${key}"`);
        }
        sheet.getRange(rowIndex, colIndex).setValue(editObj[key]);
      });
    });
  
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: "Data edited successfully"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
function deleteData(sheet, headerRow, rows, data, deleteAll) {
    const filterObj = data.filter.reduce((obj, { column, value }) => {
      obj[column] = value;
      return obj;
    }, {});
  
    const filteredRows = rows.map((row, index) => {
      const rowObj = headerRow.reduce((obj, header, i) => {
        obj[header] = row[i];
        return obj;
      }, {});
      return { rowObj, index };
    }).filter(({ rowObj }) => {
      return Object.keys(filterObj).every(key => rowObj[key] === filterObj[key]);
    });
  
    if (filteredRows.length === 0) {
      throw new Error("No matching rows found.");
    }
    if (!deleteAll && filteredRows.length > 1) {
      throw new Error("Multiple matching rows found.");
    }
  
    // Collect row indices to delete, sorted in descending order
    const rowsToDelete = filteredRows.map(({ index }) => index + 2).sort((a, b) => b - a);
    
    rowsToDelete.forEach(rowIndex => {
      sheet.deleteRow(rowIndex);
    });
  
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: "Data deleted successfully"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  