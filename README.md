# HTTP Calls for Roon APIs
---------------------------

These APIs are run by http calls.
There is a list below with examples that calls these APIs.

Have tried it with iOs swift and iOS' Workflow app to create widgets.

## Prerequisite

These apis are running on Node.js. Below are the steps to install it.

* On Windows, install from the above link.
* On Mac OS, you can use [homebrew](http://brew.sh) to install Node.js.
* On Linux, you can use your distribution's package manager, but make sure it installs a recent Node.js. Otherwise just install from the above link.

Make sure you are running node 5.x or higher.
```sh
node -v
```

For example:

```sh
$ node -v
v5.10.1
```

## Installing roon-extension-http-api

1. Download the repository.
* Go to [http-extension-http-api](https://github.com/st0g1e/roon-extension-http-api) page
* Click on "Clone or Download"
* Click "Download Zip"

2. Install
* Copy the downloaded zip to the desired folder
* unzip
* open terminal/command line and change directory to the folder
  ```
  cd [PATH]
  ```
* Install Dependencies
  ```
  npm install
  ```
* Fix image APIs
  ```
  sh update_image_api.sh
  ```
* (Optional) To remove the running log
  Comment console.log lines at
  - node_modules/node-roon-api/lib.js
  - node_modules/node-roon-api/moo.js ( REQUEST)
  - node_modules/node-roon-api/moomsj.js (CONTINUE and COMPLETE)

3. Running
  ```
  node .
  ```
  
4. Enable the extension
   In Roon, go to Settings -> Extensions and click on the "enable" button next to the roon-extension-http-api extension details.
   
** Testing in Browser

You should now the IP address where the extension is (for the same computer, you can use localhost. the default port is 3001.
This can be changed by changing the PORT value in server.js

Open a browser and go to the following link:
```
http://localhost:3001/roonAPI/listZones
```

## Available APIs
The full list of APIs can be seen on routes.js

The format to call these APIs are:
```
http://[IPAddress]:[Port]/roonAPI/[APIName]
```

The APIs are:
* Transport APIs
  - getCore
  - listZone
  - getZone
  - play_pause
  - play
  - pause
  - stop
  - previous
  - next
  - change_volume
  
* Image APIs
  - getImage
  - getMediumImage
  - getIcon
  
* Browser APIs  
  - listByItemKey
  - listSearch
  - goUp
  - goHome
  - listGoPage
  - listRefresh

* Timers
  - getTimers
  - addTimer
  - removeTimer

## Examples
There are several examples that calls the APIs above under the htmls directory.

URL: http://localhost:3001/player.html

These are: 
- player.html (simple player with play/pause, next, previous and volume slider where available)
- browser.html (simple viewer list, can play the songs)
- timers.html (simple timers to play/pause songs)

