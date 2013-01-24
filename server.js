var http = require('http')
  , url = require('url')
  , qs = require('querystring')
  , cheerio = require('cheerio')

http.createServer(function(request, response) {
  var proxy_request
    , gizoogle_request
    , buffer = ''
    , data
    , $
    , translation
  proxy_request = http.request(
    { hostname: request.headers['host']
    , port: 80
    , method: request.method
    , path: url.parse(request.url).pathname
    , headers: request.headers
    }
    , 
    function(proxy_response) {
      proxy_response.on('data', function(chunk) {
        response.write(chunk)
      })
      proxy_response.on('end', function() {
        response.end()
      })
      response.writeHead(proxy_response.statusCode, proxy_response.headers)
    }
  )
  request.setEncoding('utf8')
  request.on('data', function(chunk) {
    buffer += chunk
  })
  request.on('end', function() {
    data = qs.stringify({translatetext:buffer})
    buffer = ''
    gizoogle_request = http.request(
      { hostname: 'www.gizoogle.net'
      , port: 80
      , method: 'POST'
      , path: '/textilizer.php'
      , headers: 
        { 'content-type': 'application/x-www-form-urlencoded'
        , 'content-length': data.length }
      }
      ,
      function(gizoogle_response) {
        gizoogle_response.on('data', function(chunk) {
          buffer += chunk
        })
        gizoogle_response.on('end', function() {
          $ = cheerio.load(buffer)
          translation = $('textarea')['0'].next.data.trim()
          proxy_request.setHeader('content-length', translation.length)
          proxy_request.write(translation)
          proxy_request.end()
          buffer = ''
        })
      }
    )
    gizoogle_request.write(data)
    gizoogle_request.end()
  })
}).listen(8080);