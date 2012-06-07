var sys = require("sys");
var http = require("http");

http.createServer(function(request, response) {
	response.writeHeader(200, {"Content-Type": "text/html"});
	response.write("Hello World!");
	response.end();
}).listen(8080);

sys.puts("Server running at http://localhost:8080/");
