
function doGet(e) {
    try {
      const params = e.parameter;
      const headers = ["sheetId", "sheetName", "requestedData", "filter"];
      
      if (params.help) {
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          data: `Guide:
          - Mandatory parameters: sheetId, sheetName
          - Optional parameters:
            - requestedData: Comma-separated list of column names to return (e.g., requestedData=heading1,heading2)
            - filter: Colon-separated pairs of column names and values to filter by (e.g., filter=heading1:value1,heading2:value2)
          - Example usage:
            ?sheetId=YOUR_SHEET_ID&sheetName=YOUR_SHEET_NAME&requestedData=heading1,heading2&filter=heading1:value1,heading2:value2`
        })).setMimeType(ContentService.MimeType.JSON);
      }
  
      if (!params.sheetId || !params.sheetName) {
        throw new Error("Missing mandatory parameters: \"sheetId\" and/or \"sheetName\"");
      }
  
      const ss = SpreadsheetApp.openById(params.sheetId);
      const sheet = ss.getSheetByName(params.sheetName);
  
      if (!sheet) {
        throw new Error(`Sheet "${params.sheetName}" not found in the provided spreadsheet.`);
      }
  
      const dataRange = sheet.getDataRange().getValues();
      const [headerRow, ...rows] = dataRange;
      let items = rows.map(row => {
        return headerRow.reduce((obj, header, i) => {
          obj[header] = row[i];
          return obj;
        }, {});
      });
  
      if (params.filter) {
        const filters = params.filter.split(",").map(pair => pair.split(":"));
        items = items.filter(item => {
          return filters.every(([key, value]) => {
            const itemValue = item[key];
            return itemValue !== undefined && itemValue.toString().trim() === value.toString().trim();
          });
        });
      }
  
      if (params.requestedData) {
        const requestedHeaders = params.requestedData.split(",").map(h => h.trim());
        items = items.map(item => {
          return requestedHeaders.reduce((obj, header) => {
            obj[header] = item[header];
            return obj;
          }, {});
        });
      }
  
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: items
      })).setMimeType(ContentService.MimeType.JSON);
  
    } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        data: error.message
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  