var http = require('http');

http.createServer(function(request, response) {
  var proxy_request = http.request({
     hostname: request.headers['host'],
     port: 80,
     method: request.method,
     url: request.url,
     headers: request.headers
  });
  proxy_request.addListener('response', function (proxy_response) {
    proxy_response.addListener('data', function(chunk) {
      response.write(chunk, 'binary');
    });
    proxy_response.addListener('end', function() {
      response.end();
    });
    response.writeHead(proxy_response.statusCode, proxy_response.headers);
  });
  request.addListener('data', function(chunk) {
    proxy_request.write(chunk, 'binary');
  });
  request.addListener('end', function() {
    proxy_request.end();
  });
}).listen(process.env.PORT);