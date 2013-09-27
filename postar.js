/**
* 
* - postAr -
* the beautifully simple post/paste tool
* 
*/

var express = require('express');
var _ = require('underscore');

var app = express();

var MAX_CACHE_SIZE = 20;

app.set('view engine', 'jade');

app.use('/static', express.static(__dirname + '/static'));

app.use('/post', function(req, res, next) {
	console.log("MW!");
    var data = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) { 
        data += chunk;
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

function store(key, val, sticky) {
	sticky = sticky || false;
	storage[key] = {key:key, value:val, sticky:sticky, time:new Date().getTime()};
	cleanup();
}

app.get('/', function(req, res) { res.redirect('/get/welcome'); });

app.get('/get/:id', function(req, res) {
	var id = req.route.params["id"];
	var obj = storage[id];
	var value = null;
	if (obj) {
		value = obj.value;
	}
	res.render('show',
		{host: req.host, key: id, value: value}
		);
});

app.post('/post/:id', function(req, res) {
	var id = req.route.params["id"];
	console.log("storing: " + req.rawBody);
	store(id, req.rawBody);
	res.send("OK");
});

store('welcome', 'Welcome to postAr!', true);

// behind nginx
app.enable('trust proxy');

app.listen(8888);
