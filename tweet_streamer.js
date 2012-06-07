//
// tweet_streamer.js 
//
// I build a server in Node.js that streams tweets to a client.
//
//			June 6, 2012
//			Bo Yu (boyu2011@gmail.com)
//

var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    events = require("events");

//
// This function reads a file from the uri, and send it to the client.
//

function load_static_file(uri, response)
{
	var filename = path.join(process.cwd(), uri);

	path.exists(filename, function(exists) {
		if(!exists) {
			response.writeHeader(404, {"Content-Type": "text/plain"});
			response.write("404 Not Found\n");
			response.end();
			return;
		}

		fs.readFile(filename, "binary", function(err, file) {
			if(err) {
				response.writeHeader(500, {"Content-Type": "text/plain"});
				response.write(err+"\n");
				response.end();
				return;
			}

			response.writeHeader(200);
			response.write(file, "binary");
			response.end();
		});
	});
}

var twitter_client = http.createClient(80, "api.twitter.com");

var tweet_emitter = new events.EventEmitter();

function get_tweets() {
	var request = twitter_client.request("GET", "/1/statuses/public_timeline.json", {"host": "api.twitter.com"});

	request.addListener("response", function(response) {
		var body = "";
		response.addListener("data", function(data) {
			body += data;
		});

		response.addListener("end", function() {
			var tweets = JSON.parse(body);
			if(tweets.length > 0) {
				// trigger all of the event listeners listening for the "tweets" event, and send the new tweets to each client.
				tweet_emitter.emit("tweets", tweets);
			}
		});
	});

	request.end();
}

// we retrieve the new tweets every five seconds.
setInterval(get_tweets, 5000);

// create the HTTP server to handle requests.

http.createServer(function(request, response) {
	
	var uri = url.parse(request.url).pathname;
	
	if (uri === "/stream") {
		
		var listener = tweet_emitter.addListener("tweets", function(tweets) {
			
			response.writeHeader(200, { "Content-Type" : "text/plain" });
			response.write(JSON.stringify(tweets));
			response.end();

			clearTimeout(timeout);
		});

		// create a timer to kill requests that last over 10 seconds by sending them an empty array.
		var timeout = setTimeout(function() {
			
			response.writeHeader(200, { "Content-Type" : "text/plain" });
			response.write(JSON.stringify([]));
			response.end();

			tweet_emitter.removeListener(listener);
		}, 10000);
	}
	else {
		load_static_file(uri, response);
	}
}).listen(8080);

sys.puts("Server running at http://localhost:8080/");
