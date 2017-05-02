var topUrl = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port;
var callInterval;
var timeInterval = 2000;

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
    var html = "<h2>Zone List</h2>";
    html += "<ul>";
       for (var i in data["zones"]) {
           html += "<option value=" + data["zones"][i].zone_id + ">" + data["zones"][i].display_name + "</option>\n";
       }
    html += "</ul>";
    document.getElementById("zoneList").innerHTML = html;

    startInterval();
    updateSelected();
});

function startInterval() {
  callInterval = setInterval(function() { 
    var zone_id = document.getElementById("zoneList").options[document.getElementById("zoneList").selectedIndex].value;

    ajax_get(topUrl + '/roonAPI/getZone?zoneId=' + zone_id, function(data) {
      updateSelected(); 
    });

  }, 5000);
}

function stopInterval() {
  clearInterval( callInterval );
}


function updateSelected() {
  var zone_id = document.getElementById("zoneList").options[document.getElementById("zoneList").selectedIndex].value;

  ajax_get(topUrl + '/roonAPI/getZone?zoneId=' + zone_id, function(data) {
    var html = "";

    if ( data["zone"].state == "playing" || data["zone"].state == "paused" ) {
      html += show_zone(data["zone"]);
    }
    document.getElementById("selectedZone").innerHTML = html;
  });
}

function show_zone(zone) {
  var html = "";

  html += "<p><p>\n";

  html += "Artist: " + zone.now_playing.three_line.line2 + "<br>\n";
  html += "Album: " + zone.now_playing.three_line.line3 + "<br>\n";
  html += "Title: " + zone.now_playing.three_line.line1 + "<br>\n";

  html += "<p><p>\n";

  html += "<center><img src=" + topUrl + "/roonAPI/getMediumImage?image_key=" + zone.now_playing.image_key + "></center><p>\n";

  // Volumes

  html += "<p><p>\n";
  for ( var i in zone.outputs ) {
    if ( zone.outputs[i].zone_id == zone.zone_id && zone.outputs[i].volume != null ) {
      html += "<center>\n";
      html += "<input type=\"range\"";
      html += " min=" + zone.outputs[i].volume.min;
      html += " max=" + zone.outputs[i].volume.max;
      html += " value=" + zone.outputs[i].volume.value;
      html += " step=\"1\"";
      html += " onchange=\"changeVolume(this.value, \'" + zone.outputs[i].output_id + "\')\" \/>\n";
    }
  }

  // Navigation Buttons

  html += "<p><p>\n";
  html += "<center>\n";
  html += "<form>\n";
  html += "<input type=\"button\" value=\"prev\" onclick=\"goPrev(\'" + zone.zone_id + "\')\"/>\n";
  html += "<input type=\"button\" value=\"play/pause\" onclick=\"goPlayPause(\'" + zone.zone_id + "\')\"/>\n";
  html += "<input type=\"button\" value=\"next\" onclick=\"goNext(\'" + zone.zone_id + "\')\"/>\n";
  html += "</form>\n";
  html += "</center>\n";

  return html;
}

function changeVolume(volume, outputId) {
  ajax_get(topUrl + '/roonAPI/change_volume?volume=' + volume + '&outputId=' + outputId, function(data) {
  });
}

function goPrev(zone_id) {
  ajax_get(topUrl + '/roonAPI/previous?zoneId=' + zone_id, function(data) {
    updateSelected(); 
  });
}

function goNext(zone_id) {
  ajax_get(topUrl + '/roonAPI/next?zoneId=' + zone_id, function(data) {
    updateSelected();
  });
}

function goPlayPause(zone_id) {
  ajax_get(topUrl + '/roonAPI/play_pause?zoneId=' + zone_id, function(data) {
    updateSelected();
  });
}
