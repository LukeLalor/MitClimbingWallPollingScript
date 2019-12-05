function sheetId() {
  return '1iei64t3-PFGC0JjAUZOFdF8sw3aDTFfXHfz-0dlBlWw';
}
function url() {
  return "https://scripts.mit.edu/~mitoc/wall/";
}

function run() {
  console.info("getting html from " + url());
  
  var options = {'muteHttpExceptions' : false};
  var httpResponse = UrlFetchApp.fetch(url(), options);
  
  if (httpResponse.getResponseCode() == 404) {
    console.warn('404: could not reach ' + url());
  } else if (httpResponse.getResponseCode() != 200) {
    console.log(httpResponse)
    throw("error reaching " + url() + ": " + httpResponse.getResponseCode())
  } else {
    var parsed = parseHours(httpResponse.getContentText());
    
    var savedIds = null;// does .gs have a better way to do lazy vals ?
    var newIds = parsed.ids.filter(function(id) {
      if (!savedIds) {
        savedIds = getSavedIds();
      }
      savedIds.indexOf(id) < 0;
    })
    if (newIds.length > 0) {
      saveHours(idArr, sheetId());
      sendEmails(hoursArr, getEmails());
    }
    
    console.info("run finished successfully");
  }
}

function parseHours(text) {
  console.info("parsing hours");
  
  var idHoursRegex = new RegExp("data-hours-id=.([0-9]+).+time.+<span>(.+)<\/span>");
  var match = idHoursRegex.exec(text);
  var obj = {
    ids: [],
    hours: []
  }
  if (match) {
    if (match.length % 3 != 0) {
      throw("unexpected regex result: " + match);
    } else {
      for (var i = 0; i*3 < match.length; i++) {
        var id = match[i+1];
        var hours = match[i+2];
        obj.ids.push(id);
        obj.hours.push(hours);
      }
    }
  }
  console.log(obj)
  return obj;
}

function getSavedIds() {
  console.info("getting existiing hours' ids");
  var rangeName = 'A2:A100';
  var values = Sheets.Spreadsheets.Values.get(sheetId(), rangeName).values;
  var ids = [];
  if (values != undefined) {
    ids = values.map(function(arr) {
      return arr[0];
    });
  }
  console.log(ids);
  return ids;
}

function getEmails() {
  console.info("getting emails");
  var rangeName = 'B2:B20';
  var values = Sheets.Spreadsheets.Values.get(sheetId(), rangeName).values;
  var emails = [];
  if (values != undefined) {
    emails = values.map(function(arr) {
      return arr[0];
    });
  }
  console.log(emails);
  return emails;
}

function saveHours(idArr, sheetId) {
  console.info("saving hour ids: " + idArr);      
  var valueRange = Sheets.newValueRange();
  valueRange.values = idArr.map(function(value) { return [value]; });
  var response = Sheets.Spreadsheets.Values.update(valueRange, sheetId, 'A2:A100', {
    valueInputOption: 'RAW'
  });      
  if (response.updatedCells < 1) {
    throw ("could not update cell with hour id(s)");
  }
  return response;
}

function sendEmail(hoursArr, emailsArr) {
  console.info("sending email(s)");
  var email = Session.getActiveUser().getEmail();
  var subject = "New Mit Gym Hours";
  var body = hoursArr.toString() + "\n" + url();
  return GmailApp.sendEmail(emailsArr.join(","), subject, body);
}
