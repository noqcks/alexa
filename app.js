var result;

const SECONDS_IN_2_MONTHS = 5183000
const API_KEY = "bd7c7669ef0faf4508d5c72ab735ac1de3ddfd2b"

var end = Math.floor(Date.now() / 1000);
var start = end - SECONDS_IN_2_MONTHS
var query = 'apple'

// var url = `https://gateway-a.watsonplatform.net/calls/data/GetNews?apikey=${API_KEY}&return=enriched.url.enrichedTitle.docSentiment&start=${start}&end=${end}&q.enriched.url.cleanedTitle=${subject}&count=20&outputMode=json`

var http = require('http');

// var options = {
//   host: 'https://gateway-a.watsonplatform.net',
//   path: `/calls/data/GetNews?apikey=${API_KEY}&return=enriched.url.enrichedTitle.docSentiment&start=${start}&end=${end}&q.enriched.url.cleanedTitle=${query}&count=20&outputMode=json`
// };

// http.get(`https://gateway-a.watsonplatform.net/calls/data/GetNews?apikey=${API_KEY}&return=enriched.url.enrichedTitle.docSentiment&start=${start}&end=${end}&q.enriched.url.cleanedTitle=${query}&count=20&outputMode=json`, callback)

callback = function(response) {
  var body = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    body += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    var results = JSON.parse(body).result.docs
    var count = 0
    var score = 0
    for (var i in results) {
      count++
      score += results[i].source.enriched.url.enrichedTitle.docSentiment.score
    }
    result = score/count
    // console.log(result)
    // return result;
    // console.log(JSON.parse(str));
  });
}

http.get(`http://gateway-a.watsonplatform.net/calls/data/GetNews?apikey=${API_KEY}&return=enriched.url.enrichedTitle.docSentiment&start=${start}&end=${end}&q.enriched.url.cleanedTitle=${query}&count=20&outputMode=json`, function(res) {

  var bodyChunks = [];
  res.on('data', function(chunk) {
    // You can process streamed parts here...
    bodyChunks.push(chunk);
  }).on('end', function() {
    var body = Buffer.concat(bodyChunks);
    var results = JSON.parse(body).result.docs
    var count = 0
    var score = 0
    for (var i in results) {
      count++
      score += results[i].source.enriched.url.enrichedTitle.docSentiment.score
    }
    result = score/count
    // console.log('BODY: ' + body);
    // return result
    // ...and/or process the entire body here.
  })
}).end('', '', console.log("hi"))




// console.log(result)

// req.on('error', function(e) {
//   console.log('ERROR: ' + e.message);
// });

// http.get(`http://gateway-a.watsonplatform.net/calls/data/GetNews?apikey=${API_KEY}&return=enriched.url.enrichedTitle.docSentiment&start=${start}&end=${end}&q.enriched.url.cleanedTitle=${query}&count=20&outputMode=json`, callback)

// console.log(result)
