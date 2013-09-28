/**
* 
* - postAr -
* the beautifully simple post/paste tool
* 
*/

var express = require('express');
var _ = require('underscore');
var fs = require('fs');

var app = express();

var MAX_CACHE_SIZE = 20;
var MAX_DATA_SIZE = 1024*100; // 100kb

app.set('view engine', 'jade');

app.use('/static', express.static(__dirname + '/static'));

// expressjs doesn't support rawBody anymore by default, workaround:
app.use('/post', function(req, res, next) {
    var data = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) { 
    	if (req.tooLong) { return; }
        data += chunk;
        if (data.length > MAX_DATA_SIZE) {
        	data = data.substring(0, MAX_DATA_SIZE);
        	req.tooLong = true;
        }
    });
    req.on('end', function() {
        req.rawBody = data;
        next();
    });
});

var storage = {};

function cleanup() {
	var values = _.values(storage);
	if (values.length < MAX_CACHE_SIZE) {
		return;
	}
	// sort (oldest last)
	var valuesByTime = _.sortBy(values, function(obj) { return -1 * obj.time; });
	for (var i=MAX_CACHE_SIZE; i<valuesByTime.length; i++) {
		var obj = valuesByTime[i];
		if (!obj.sticky) {
			console.log("cleaning up key " + obj.key);
			delete storage[obj.key];
		}
	}
}

/**
* @param sticky must only be set to true for internal/admin posts
*	sticky posts won't be garbage collected and cannot be overwritten
*/
function store(key, val, sticky) {
	sticky = sticky || false;
	if (!sticky) {
		// check if overwrite is allowed (current post doesn't exist or is non-sticky)
		var current = storage[key];
		if (current && current.sticky === true) {
			console.log("tried to overwrite sticky post, not allowed!");
		}
	}
	storage[key] = {key:key, value:val, sticky:sticky, time:new Date().getTime()};
	cleanup();
}

app.get('/', function(req, res) { res.redirect('/get/welcome'); });

app.get('/get/:id?', function(req, res) {
	var id = req.route.params["id"];
	if (!id || id.length < 1) {
		return res.redirect('/get/welcome');
	}
	var obj = storage[id];
	var viewObject = {host:req.host, key: id, post: obj};
	if (obj) {
		viewObject.value = obj.value;
	}
	viewObject.randomKey = _.sample("abcdefghijklmnopqrstuvwxyz0123456789_-".split(""),5).join("");
	res.render('show', viewObject);
});

app.get('/post/:id', function(req, res) {
	return res.redirect('/get/' + req.route.params["id"]);
});

app.post('/post/:id', function(req, res) {
	var id = req.route.params["id"];
	console.log("storing: " + req.rawBody);
	store(id, req.rawBody);
	if (req.tooLong === true) {
		return res.send("WARN: toolong\n");
	}
	return res.send("OK\n");
});

// behind nginx
app.enable('trust proxy');

// read the info part of the readme file and use it as postAr's welcome text
fs.readFile('./README.md', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var infoRegex = /<!--infostart-->([.\s\S]+)<!--infoend-->/;
  var match = infoRegex.exec(data);
  var infoText = "ERR, could not read README.md";
  if (match && match.length > 0) {
  	infoText = match[1];
  }
  store('welcome', 'Welcome to postAr!\n' + infoText, true);

  // start postAr
  app.listen(8888, '127.0.0.1');
});