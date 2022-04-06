var RoonApi          = require("node-roon-api");
var RoonApiTransport = require("node-roon-api-transport");
var RoonApiStatus    = require("node-roon-api-status");
var RoonApiImage     = require("node-roon-api-image");
var RoonApiBrowse    = require("node-roon-api-browse");

var path = require('path');


var core;
var timeout;

var roon = new RoonApi({
   extension_id     : "st0g1e.roon-http-api",
   display_name     : "roon-http-api",
   display_version  : "1.0.3",
   publisher        : "bastian ramelan",
   email            :	"st0g1e@yahoo.com",
   log_level        : "none",

   core_paired: function(core_) {
     core = core_;
   	 core.services.RoonApiTransport.subscribe_zones((response, msg) => {
     });
   },

   core_unpaired: function(core_) {

   }
});

var svc_status = new RoonApiStatus(roon);

roon.init_services({
   required_services: [ RoonApiTransport, RoonApiBrowse, RoonApiImage ],
   provided_services: [ svc_status ],
});

svc_status.set_status("Extension enabled", false);
roon.start_discovery();


// --------------- APIs ------------------

exports.getCore = function(req, res){
  res.send({
    "id": core.core_id,
    "display_name": core.display_name,
    "display_version": core.display_version
  });
};

exports.listZones = function(req, res) {
    core.services.RoonApiTransport.get_zones((iserror, body) => {
        if (!iserror) {
            res.send({
                "zones": body.zones
            })
        }
    })
};

exports.listOutputs = function(req, res) {
    core.services.RoonApiTransport.get_outputs((iserror, body) => {
        if (!iserror) {
            res.send({
                "outputs": body.outputs
            })
        }
    })
};
exports.getZone = function(req, res) {
  res.send({
    "zone": core.services.RoonApiTransport.zone_by_zone_id(req.query['zoneId'])
  })
};

exports.play_pause = function(req, res) {
    core.services.RoonApiTransport.control(req.query['zoneId'], 'playpause');

   res.send({
    "status": "success"
  })
};

exports.stop = function(req, res) {
    core.services.RoonApiTransport.control(req.query['zoneId'], 'stop');

   res.send({
    "status": "success"
  })
};

exports.play = function(req, res) {
    core.services.RoonApiTransport.control(req.query['zoneId'], 'play');

   res.send({
    "zone": "Success"
  })
};

exports.pause = function(req, res) {
    core.services.RoonApiTransport.control(req.query['zoneId'], 'pause');

   res.send({
    "status": "success"
  })
};


exports.previous = function(req, res) {
    core.services.RoonApiTransport.control(req.query['zoneId'], 'previous');

//    setTimeout(function(){
       res.send({
         "zone": req.headers.referer
       })
//    }, 2000);
};

exports.next = function(req, res) {
  core.services.RoonApiTransport.control(req.query['zoneId'], 'next');

//    setTimeout(function(){
       res.send({
         "zone": core.services.RoonApiTransport.zone_by_zone_id(req.query['zoneId'])
       })
//    }, 2000);
};

exports.change_volume = function(req, res) {
  core.services.RoonApiTransport.change_volume(req.query['outputId'], "absolute", req.query['volume']);


  res.send({
    "status": "success"
  })
};

exports.getMediumImage = function( req, res ) {
  get_image( req.query['image_key'], "fit", 300, 200, "image/jpeg", res);
};

exports.getIcon = function( req, res ) {
  get_image( req.query['image_key'], "fit", 100, 100, "image/jpeg", res);
};

exports.getImage = function(req, res) {
   get_image( req.query['image_key'], "fit", 300, 200, "image/jpeg", res);
};

exports.getOriginalImage = function(req, res) {
  core.services.RoonApiImage.get_image(req.query['image_key'], function(cb, contentType, body) {

     res.contentType = contentType;

     res.writeHead(200, {'Content-Type': 'image/jpeg' });
     res.end(body, 'binary');
  });
};

function get_image(image_key, scale, width, height, format, res) {
   core.services.RoonApiImage.get_image(image_key, {scale, width, height, format}, function(cb, contentType, body) {

      res.contentType = contentType;

      res.writeHead(200, {'Content-Type': 'image/jpeg' });
      res.end(body, 'binary');
   });
};

exports.listByItemKey = function(req, res) {
   refresh_browse( req.query['zoneId'], { item_key: req.query['item_key'] }, req.query['page'], req.query['list_size'], function(myList) {

   res.send({
     "list": myList
   })
  });
};

exports.listSearch = function(req, res) {
   refresh_browse( req.query['zoneId'], { item_key: req.query['item_key'], input: req.query['toSearch'] }, req.query['page'], req.query['list_size'], function(myList) {
    res.send({
      "list": myList
    })
  });
};

exports.goUp = function(req, res) {
   refresh_browse( req.query['zoneId'], { pop_levels: 1 }, 1, req.query['list_size'],  function(myList) {

    res.send({
      "list": myList
    })
  });

};

exports.goHome = function(req, res) {
   refresh_browse( req.query['zoneId'], { pop_all: true }, 1, req.query['list_size'], function(myList) {

   res.send({
     "list": myList
    })
  });
};

exports.listGoPage = function(req, res) {
   load_browse( req.query['page'], req.query['list_size'], function(myList) {

   res.send({
     "list": myList
    })
  });

};

exports.listRefresh = function(req, res) {
   refresh_browse( req.query['zoneId'], { refresh_list: true }, 0, 0, function(myList) {

   res.send({
     "list": myList
    })
  });
};


// GROUP - UNGROUP

exports.group = function(req, res) {
    core.services.RoonApiTransport.group_outputs(req.body.output);

   res.send({
    "status": "success"
  })
};

exports.ungroup = function(req, res) {
    core.services.RoonApiTransport.ungroup_outputs(req.body.output);

   res.send({
    "status": "success"
  })
};


// TRANSFERS

exports.transferZone = function(req, res) {
  core.services.RoonApiTransport.transfer_zone(req.query['fromZoneId'], req.query['toZoneId']);

    res.send({
     "status": "success"
   })
};


// Timers

exports.addTimer = function(req, res) {
  save_timer(req.query['zoneId'], req.query['time'], req.query['command'], req.query['isRepeat']);

  run_later();
  var timers = get_timers();

  res.send({
    "timers": timers
  })
};

exports.getTimers = function(req, res) {
  var timers = get_timers();

  res.send({
    "timers": timers
  })
};

exports.removeTimer = function(req, res) {
  var timers = get_timers();
  var zoneToRemove = req.query['zoneId'];
  var timeToRemove = req.query['time'];
  var commandToRemove = req.query['command'];
  var isRepeatToRemove = req.query['isRepeat'];

  for ( var i in timers ) {
    if ( timers[i].zoneId == zoneToRemove && timers[i].time == timeToRemove &&
         timers[i].command == commandToRemove && timers[i].isRepeat == isRepeatToRemove ) {
      timers.splice(i, 1);
      break;
    }
  }

  roon.save_config("my_timers", timers);

  run_later();
  var timers = get_timers();

  res.send({
   "timers": timers
  })
};


function refresh_browse(zone_id, opts, page, listPerPage, cb) {
    var items = [];
    opts = Object.assign({
        hierarchy:          "browse",
        zone_or_output_id:  zone_id,
    }, opts);


    core.services.RoonApiBrowse.browse(opts, (err, r) => {
        if (err) { console.log(err, r); return; }

        if (r.action == 'list') {
            page = ( page - 1 ) * listPerPage;

            core.services.RoonApiBrowse.load({
                hierarchy:          "browse",
                offset:             page,
                set_display_offset: listPerPage,
            }, (err, r) => {
                items = r.items;

                cb(r.items);
            });
        }
    });
}

function load_browse(page, listPerPage, cb) {
   page = ( page - 1 ) * listPerPage;

   core.services.RoonApiBrowse.load({
      hierarchy:          "browse",
      offset:             page,
      set_display_offset: page,
   }, (err, r) => {
      cb(r.items);
    });
}

function runCommand(command, zone_id) {
  if ( command == "play" ) {
    core.services.RoonApiTransport.control(req.query['zoneId'], 'play');
  } else if ( command == "pause" ) {
    core.services.RoonApiTransport.control(req.query['zoneId'], 'pause');
  }
}

function get_timers() {
  var run_laters = roon.load_config("my_timers");

  return run_laters;
}

function save_timer(zoneId, time, command, isRepeat) {
  var timers = get_timers();

  if ( timers == null ) {
    timers = [];
  }

  var toAdd = {}
  toAdd.zoneId = zoneId;
  toAdd.time = time;
  toAdd.command = command;
  toAdd.isRepeat = isRepeat;

  timers.push(toAdd);

  roon.save_config("my_timers", timers);
  refresh_timer();
}

function refresh_timer() {
  var timers = get_timers();
  var dateNow = new Date();

  var newTimers = [];
  var isFirst = true;

  for ( var i in timers ) {
     if ( timers[i].time >= dateNow.getTime() ) {
         newTimers.push( timers[i] );
     }
  }
  newTimers.sort(compare);
  roon.save_config("my_timers", newTimers);

}

function compare(a, b) {
  if ( a.time < b.time ) { return -1; }
  if ( a.time > b.time ) { return 1; }
  return 0;
}


function run_later() {
  clearTimeout(timeout);

  var timers = get_timers();
  var timer;

  if ( timers != null && timers.length > 0 ) {
    timer = timers[0];

    var date = new Date(parseInt(timer.time));
    var curDate = new Date();

    var lapse = date - curDate;

    if ( timer.command == "play" ) {
      timeout = setTimeout( function () {
        playZone(timer.zoneId);
        run_later();
      },  lapse);
    } else if ( timer.command == "pause" ) {
      timeout = setTimeout( function() {
        pauseZone(timer.zoneId);
        run_later();
      }, lapse);
    }
  }
}

function playZone(zoneId) {
  refresh_timer();
  core.services.RoonApiTransport.control(zoneId, 'play');
}

function pauseZone(zoneId) {
  refresh_timer();
  core.services.RoonApiTransport.control(zoneId, 'pause');
}
