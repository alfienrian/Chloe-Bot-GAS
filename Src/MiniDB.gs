// var db = new miniSheetDB2.init(ssid);
var db = new miniSheetDB2.init(ssid1, 'Sheet1', {    
    col_length: 11,
    row_start: 2,
    json: true
});

function getAll() {
    let result = db.getAll();
    Logger.log(result.row);
}

function getKey() {
  db.col_length = 10
    let result = db.key(23232);
    Logger.log(result);
} 