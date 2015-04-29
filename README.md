# - postAr -

The beautifully simple post/paste tool.
<!--infostart-->
## What and Why

Postar makes it dead simple to push data from anywhere right to your browser.
It is ideal if you just quickly need to get *a value* from a remote system.

It is not intended to compete with pastebin or similar services. 

*'What's different?'* You ask?

* dead simple data push - stupid simple "API"
* easily overwriteable data - just push again
* temporary - post count limit (old posts get kicked), in memory

The use cases are:

* You need to get ip address of an embedded device (and dyndns is too much overhead and/or you need the internal ip)
* want to get quickly updating values from a sensor (simple overwrite)
* share some information and make it disappear from the internet again just seconds later (just make another push to overwrite it)

### Why I created it

I needed to know the IP address of a headless RaspberryPi which it got from the company's dhcp server. Dyndns would have given me the public IP, so I looked for a website to which the Pi could post data  (its ifconfig output) repeatedly, where I could easily access it from another pc.
Since I couldn't find one and the APIs from all the paste* websites were way too complex for this, I created postAr.
Now you and me can easily accomplish this task via:

	while true; do
		ifconfig | curl --data-binary @- http://post.paukl.at/post/pi-ip ; sleep 60;
	done

... and always know its IP by looking at /get/pi-ip
<!--infoend-->

## Go go go
    npm install
    npm start

... and browse to [http://localhost:8888/](http://localhost:8080/ "http://localhost:8888/") 

To see (very simple/limited) statistics of the current postAr instance (number of gets/posts that actually got/updated data) go to [/stats](http://localhost:8888/)

To configure postAr's behaviour, create a ``config.json`` file and override values from the config object (see ``postar.js``).

If you want to deploy postAr on your server, check out the ``misc`` folder which contains nginx and supervisord configs.

## I can haz tests?

	npm install -g mocha
	mocha

<br/><br/>
by [Paul Klingelhuber](http://paukl.at "Paul Klingelhuber") (2013 - 2015)