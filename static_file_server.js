var sys = require("sys");
var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");

http.createServer(function(request, response) {
	
	// get file name
	var uri = url.parse(request.url).pathname;
	// combine current working dir and file name
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
				response.write(err + "\n");
				response.end();
				return;
			}

			response.writeHeader(200);
			response.write(file, "binary");
			response.end();
		});
	});
}).listen(8080);

sys.puts("Server running at http://localhost:8080/");
