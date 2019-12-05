function sheetId() {
  return '1iei64t3-PFGC0JjAUZOFdF8sw3aDTFfXHfz-0dlBlWw';
}
function url() {
  return "https://scripts.mit.edu/~mitoc/wall/";
}

function checkUpdateAndSendEmail() {
  console.info("getting hours");
  var text = null;
  try {
    text = UrlFetchApp.fetch(url()).getContentText();
  } catch (e) {
    console.warn('could not get html from ' + url() + ': ' + e);
  }
  var idHoursRegex = new RegExp("data-hours-id=.([0-9]+).+time.+<span>(.+)<\/span>");
  var match = idHoursRegex.exec(text);
  if (!match) {
    console.info("no hours found");
  } else if (match.length % 3 != 0) {
    throw("unexpected regex result: " + match);
  } else {
    console.info("found hours");
    var idArr = [];
    var hoursArr = [];
    for (var i = 0; i*3 < match.length; i++) {
      var id = match[i+1];
      var hours = match[i+2];
      idArr.push(id);
      hoursArr.push(hours);
    }
    
    var savedIds = getSavedIds()
    var newIds = idArr.filter(function(id) {
      savedIds.indexOf(id) < 0;
    })
    if (newIds.length > 0) {
      saveHours(idArr, sheetId());
      sendEmails(hoursArr, getEmails());
    }
    
    console.info("run finished successfully");
  }
}

function getSavedIds() {
  console.info("getting existiing hours");
  var rangeName = 'A2:A100';
  var values = Sheets.Spreadsheets.Values.get(sheetId(), rangeName).values;
  if (values == undefined) {
    return [];
  } else {
    var ids = values.map(function(arr) {
      return arr[0];
    });
    return ids;
  }
}

function getEmails() {
  console.info("getting emails");
  var rangeName = 'B2:B20';
  var values = Sheets.Spreadsheets.Values.get(sheetId(), rangeName).values;
  if (values == undefined) {
    return [];
  } else {
    var emails = values.map(function(arr) {
      return arr[0];
    });
    return emails;
  }
}
  

function saveHours(idArr, sheetId) {
  console.info("saving hours");      
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
  console.info("sending emails: " + emailsArr.join(", "));
  var email = Session.getActiveUser().getEmail();
  var subject = "New Mit Gym Hours";
  var body = hoursArr.toString() + "\n" + url();
  return GmailApp.sendEmail(emailsArr.join(","), subject, body);
}
