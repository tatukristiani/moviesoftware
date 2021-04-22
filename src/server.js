const url = require('url');
const util = require('util');
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const request = require('request');

// Create connection to database
var sqlCon = mysql.createConnection({
  host: "localhost",
  user: "olso",
  password: "olso",
  database: "movies_db"
})

// Connect to database
sqlCon.connect(function(err) {
  if(err) throw err;
  console.log("Connected to MySQL!");
});

// eslint-disable-next-line no-unused-vars
const query = util.promisify(sqlCon.query).bind(sqlCon);

const app = express();
app.use(cors()); // Allow Access from all domains

var bodyParser = require('body-parser');
// eslint-disable-next-line no-unused-vars
var urlencodedParser = bodyParser.urlencoded({extended: false});
app.use(bodyParser.urlencoded({extended: false }));
app.use(bodyParser.json());


// Sites that are listed

app.get('/', function(req,res) {
  console.log("Got a GET request for the homepage");

  res.send("Hello!");
})

// Home page, displays hard coded movies from database. Data from external API:s database.
app.get('/home', function(req,res) {
  console.log("Home page opened");
  let sql = "SELECT * from movie";

  (async () => {
    try {
      let result = await query(sql);
      let jsonObj = JSON.stringify(result);
      res.send(jsonObj);
    } catch (err) {
      console.log("Database error!" + err);
    }
  })()

});

app.get('/api/search', function(req,res) {
  console.log("Searching movie from external API");
  var q = url.parse(req.url, true).query;
  var movieName = q.name;
  var movieYear = parseInt(q.year);
  console.log("Movie name: " + movieName + " MovieYear: " + movieYear);


  // Check if we have year input from user, if we got one then we perform a search with it.
  if(movieYear != null && movieYear != NaN && movieYear > 0 && movieYear < 9999) {
    request('http://www.omdbapi.com/?t=' + movieName + '&y=' + movieYear +
        '&apikey=1376e1b1', function(error, response, body) {
      console.log(body);
      console.log("Year search complete!");
      res.send(body);
    });
  }
  // If user didn't add a year to the search bar, then we don't use it.
  else {
    request('http://www.omdbapi.com/?t=' + movieName + '&apikey=1376e1b1', function(error, response, body) {
      console.log(body);
      console.log("NO year search complete!");
      res.send(body);
    });
  }
})

// TEST
app.get('/search', function(req, res) {
  console.log("Switched to search mode.");

  res.send("Now searching");
})

// TEST
app.get('/search/movie', function(req, res) {
  console.log("Searching for a movie");
  request('http://www.omdbapi.com/?t=joker&apikey=1376e1b1', function(error, response, body) {
    console.log(body);
    res.send(body);
  });
})

//TODO: Search movies from database with users id
app.get('/api/mymovies', function(req, res) {
  console.log("Fetching users movies");

  res.send("Yayy");
})

// Server listening to port 8080.
var server = app.listen(8080, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Listening at http://%s:%s", host, port);
})
