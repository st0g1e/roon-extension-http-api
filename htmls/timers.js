var topUrl = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port;

var months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
var zone_list = {};

function ajax_get(url, callback) {
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            try {
                var data = JSON.parse(xmlhttp.responseText);
            } catch(err) {
                return;
            }
            callback(data);
        }
    };
 
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

ajax_get(topUrl + '/roonAPI/listZones', function(data) {
    for (var i in data["zones"]) {
       zone_list[data["zones"][i].zone_id] = data["zones"][i].display_name; 
    }

    show_data();
});

function show_data() {
  var optHtml = "";

  // CREATE ZONE LIST
  for (var i in zone_list) {
    optHtml += "<option value=" + i + ">" + zone_list[i] + "</option>\n";
  }

  document.getElementById("zoneListByTimer").innerHTML = optHtml;
  document.getElementById("zoneListByDate").innerHTML = optHtml;


  // CREATE MONTH LIST
  monthHtml = "";
  for ( var i in months ) {
    monthHtml +=  "<option value=" + i + ">" + months[i] + "</option>\n"; 
  }

  document.getElementById("monthList").innerHTML = monthHtml;

  // CREATE TIMER LIST 
  ajax_get(topUrl + '/roonAPI/getTimers', function(data) {
     var html = "";
     var curDate = new Date();
     var timerDate;
 
     html += "<table><tr>\n";
     html += "<th>Zone</th>\n";
     html += "<th>Command</th>\n";
     html += "<th>Date/Time</th>\n";
     html += "<th>Duration</th>\n";
     html += "<th>Is Repeat</th>\n";
     html += "<th>Remove</th>\n";
     html += "</tr>\n";

     if (data != null ) {
       for ( var i in data.timers ) {

         html += "<tr>\n";
         html += "<td>" + zone_list[data.timers[i].zoneId] + "</td>\n";
         html += "<td>" + data.timers[i].command + "</td>\n";
         html += "<td>" + dateTimeFromDate(data.timers[i].time) + "</td>\n";
         html += "<td>" + durationFromDate(data.timers[i].time) + "</td>\n";
         html += "<td>";
         if ( data.timers[i].isRepeat == "1" ) { 
           html += "yes";
         } else {
           html += "no";
         }
         html += "</td>\n";
         html += "<td><a href=\'javascript:void(0);\' onclick=\"removeTimer(\'" + data.timers[i].zoneId + "\', \'" + data.timers[i].time +
                 "\', \'" + data.timers[i].command + "\', \'" + data.timers[i].isRepeat + "\');\">remove</a></td>\n";
         html += "</tr>\n";
       }
     }

     html += "</html>\n";

     document.getElementById("timerList").innerHTML = html;
  });
}

function durationFromDate(timerDate) {
  var duration = "";

  var date = new Date(parseInt(timerDate));
  var curDate = new Date();

  var lapse = date - curDate;
  lapse = lapse / 1000;
  
  if ( lapse < 0 ) {
    duration = "has passed";
  } else {
    var day = Math.floor(lapse / 60 / 60 / 24);
    lapse = lapse - ( day * 60 * 60 * 24 );
    
    if ( day > 0 ) {
      duration += day + "d ";
    }
    
    var hour = Math.floor(lapse / 60 / 60);
    lapse = lapse - ( hour * 60 * 60);

    if ( hour > 0 ) {
      duration += hour + "h ";
    }

    var min = Math.floor(lapse / 60);
    lapse = Math.floor(lapse - (min * 60));

    if ( min > 0 ) {
      duration += min + "m ";
    }

    duration += lapse + "s";
  }

  return duration; 
}


function dateTimeFromDate(timerDate) {
  var date = new Date(parseInt(timerDate));

  var dateTime = "";

  var mth = months[date.getMonth()];
  var day = date.getDate();
  var year = date.getFullYear();
  var hour = date.getHours();
  var min = date.getMinutes();
  var sec = date.getSeconds();

  dateTime = day + " " + mth + " " + year + ", " + hour + ":" + min + ":" + sec;
  return dateTime;
}


function removeTimer(zoneId, time, command, isRepeat) {
    ajax_get(topUrl + '/roonAPI/removeTimer?zoneId=' + zoneId + "&time=" + time + "&command=" + command + "&isRepeat=" + isRepeat, function(data) {
      show_data();
    });
}

function addByTimer(form) {
  var zone_id = form.zoneListByTimer.value;
  var second = form.second.value
  var minute  = form.minute.value;
  var hour = form.hour.value;
  var command = form.command.value;
  var milliseconds = 0;  
  var dateNow = new Date();

  if ( second == null ) {
    second = 0;
  }

  if ( minute == null ) {
    minute = 0;
  }

  if ( hour == null ) {
    hour = 0;
  }

  milliseconds = ( hour * 60 * 60 * 1000 ) + (minute * 60 * 1000) + (second * 1000);

  var timerDate = dateNow.getTime() + milliseconds;

  addTimer(zone_id, timerDate, command, 0);     
}

function addByDateTime(form) {
  var zone_id = form.zoneListByDate.value;
  var day = form.day.value;
  var month = form.monthList.value;
  var year = form.year.value
  var second = 0;
  var minute  = form.minute.value;
  var hour = form.hour.value;
  var command = form.command.value;
  var milliseconds = 0;
  var dateNow = new Date();
 
  if ( day == null ) {
    day = "01";
  } else if ( day < 10 ) {
    day = "0" + day;
  }

  if ( minute == null ) {
    minute = "00";
  } else if ( minute < 10 ) {
    minute = "0" + minute;
  }

  if ( hour == null ) {
    hour = "00";
  } else if ( hour < 10 ) {
    hour = "0" + hour;
  }

  var timerRun = new Date( months[month] + " " + day + ", " + year + " " + hour + ":" + minute + ":00"); 
  var timerDate = timerRun.getTime();

  addTimer(zone_id, timerDate, command, 0);
}

function addTimer(zone_id, time, command, isRepeat) {
  ajax_get(topUrl + '/roonAPI/addTimer?zoneId=' + zone_id + "&time=" + time + "&command=" + command + "&isRepeat=" + isRepeat, function(data) {
    show_data();
  });
}
