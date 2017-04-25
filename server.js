var express = require('express');
var path = require('path');

var app = express();

const PORT=3001; 

app.use(express.static(path.join(__dirname, 'htmls')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


require('./routes')(app);

app.listen(PORT);

console.log('Listening on port' + PORT);
