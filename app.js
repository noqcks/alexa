var request = require('request');
var result;

const SECONDS_IN_3_MONTHS = 5183000
const API_KEY = "bd7c7669ef0faf4508d5c72ab735ac1de3ddfd2b"

var end = Math.floor(Date.now() / 1000);
var start = end - SECONDS_IN_3_MONTHS
var query = 'apple'

var url = `https://gateway-a.watsonplatform.net/calls/data/GetNews?apikey=${API_KEY}&return=enriched.url.enrichedTitle.docSentiment&start=${start}&end=${end}&q.enriched.url.cleanedTitle=${query}&count=20&outputMode=json`

request(url, function (error, response, body) {
  if (error) console.log(error)
  if (!error && response.statusCode == 200) {
    // console.log(JSON.parse(body))

    var results = JSON.parse(body).result.docs
    var count = 0
    var score = 0
    for (var i in results) {
      count++
      score += results[i].source.enriched.url.enrichedTitle.docSentiment.score
    }
    result = score/count
    console.log(result);
  }
})
