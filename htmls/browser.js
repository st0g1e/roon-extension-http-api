var topUrl = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port;

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

    goHome();
});

function goHome() {
  var zone_id = document.getElementById("zoneList").options[document.getElementById("zoneList").selectedIndex].value;

  ajax_get(topUrl + '/roonAPI/goHome?zoneId=' + zone_id + '&list_size=20', function(data) {
    show_data(data, zone_id, 1);
  });
}

function goUp() {
  var zone_id = document.getElementById("zoneList").options[document.getElementById("zoneList").selectedIndex].value;

  ajax_get(topUrl + '/roonAPI/goUp?zoneId=' + zone_id + '&list_size=20', function(data) {
    show_data(data, zone_id, 1);
  });
}

function show_data( data, zone_id, page ) {
    var html = "";
   
    var pageHtml = "";
    if ( page > 1 ) {
      pageHtml += "<a href=\'javascript:void(0);\' onclick=\"goPage(\'" + zone_id + "\'," + (page-1) + ",100)\">prev</a>\n";
    } else {
      pageHtml += "prev";
    }

    pageHtml += " | Page: " + page + " | ";

    if ( data.list.length > 99 ) {
      pageHtml += "<a href=\'javascript:void(0);\' onclick=\"goPage(\'" + zone_id + "\'," + (page+1) + ",100)\">next</a>\n";
    } else {
      pageHtml += "next";
    }

    document.getElementById("PageNumber").innerHTML = pageHtml;

    for ( var i in data['list'] ) {
      html += "<div class=\"gallery\">\n";
      html += "<a href=\'javascript:void(0);\' onclick=\"showList(\'" + data.list[i].item_key + "\', \'" + zone_id + "\', 1, 5);\">";

      if ( data.list[i].image_key == null ) {
         html += "<img src=\'images/roonIcon.png\'/>\n";
      } else {
         html += "<img src=\'" + topUrl + "/roonAPI/getIcon?image_key=" + data.list[i].image_key + "\'/>\n";
      }

      html += "</a>\n";
      html += "<div class=\"desc\">" + data.list[i].title  + "</div>\n";
      html += "</div>\n";
    }

    document.getElementById("browseTable").innerHTML = html;
}

function showList(item_key, zone_id, page, listSize) {
  ajax_get(topUrl + '/roonAPI/listByItemKey?zoneId=' + zone_id + "&item_key=" + item_key + "&page=" + page + "&list_size=" + listSize, function(data) {
    show_data(data, zone_id, page);
  });
}

function goPage(zone_id, page, size) {
  ajax_get(topUrl + '/roonAPI/listGoPage?page=' + page + "&list_size=" + size, function(data) {
    show_data(data, zone_id, page);
  });
}

function search(form) {
  var zone_id = document.getElementById("zoneList").options[document.getElementById("zoneList").selectedIndex].value;
  var toSearch = form.toSearch.value;

  //go home first
  ajax_get(topUrl + '/roonAPI/goHome?zoneId=' + zone_id + '&list_size=20', function(data) {
    var library_item_key = data.list[0].item_key;

    ajax_get(topUrl + '/roonAPI/listByItemKey?zoneId=' + zone_id + "&item_key=" + library_item_key + "&page=1&list_size=20", function(data) {
      var search_item_key = data.list[0].item_key;

      ajax_get(topUrl + '/roonAPI/listSearch?zoneId=' + zone_id + "&item_key=" + search_item_key + "&toSearch=" + toSearch + "&page=1&list_size=20", function(data) {
         show_data(data, zone_id, 1);
      });
    });
  });
}
