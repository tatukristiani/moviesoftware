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

const query = util.promisify(sqlCon.query).bind(sqlCon);

const app = express();
app.use(cors()); // Allow Access from all domains

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false});
app.use(bodyParser.urlencoded({extended: false }));
app.use(bodyParser.json());



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

// Search a movie fron omdbAPI with a movie name/year. Sends only one movie per search.
app.get('/search', function(req,res) {
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

// Save data to database (Authors tool for adding movies)
app.post('/saveDataToDb', urlencodedParser, function(req, res) {
  console.log("Saving data to database");

  // get JSON-object from the http-body
  let jsonObj = req.body;
  console.log(jsonObj);


  // Check if there is something to be added.
  if (!jsonObj.isNull) {

    // All variables except numbers have semi-colons added for sql purposes. ex. String must be type -> "String", this is not allowed -> String.
    let name = "\"" + jsonObj.Title + "\"";
    let year = jsonObj.Year;
    let imageID = "\"" + jsonObj.imdbID + "\"";

    // Movies runtime must be converted from string to a float.
    var runtimeToFloat = parseFloat(jsonObj.Runtime).toFixed(2);
    let runtimeMin;

    // We want to double check that the value is a number.
    if(isNaN(runtimeToFloat)) {
      runtimeMin = 0.00;
    }
    else {
      runtimeMin = runtimeToFloat;
    }

    let genre = "\"" + jsonObj.Genre + "\"";
    let director = "\"" + jsonObj.Director + "\"";
    let actor = "\"" + jsonObj.Actors + "\"";
    let plot = "\"" + jsonObj.Plot + "\"";
    let poster = "\"" + jsonObj.Poster + "\"";

    // IIFE, insert the data to database. Send response to client according to success/failure.
    (async () => {
      try {
        let sql = "INSERT INTO movie(name, year, imageID, runtimeMin, genre, director, actors, plot, poster)" +
            " VALUES(" + name + ", " + year + ", " + imageID + ", "
            + runtimeMin + ", " + genre + ", " + director + ", "
            + actor + ", " + plot + ", " + poster + ")";
        await query(sql);

      res.send("Succesfully saved data to database");

      } catch (error) {
        console.log(error);
        res.send("Couldn't save data to database");

      }
    })()
  }
});

app.post('/accountValidate', function(req, res) {
  let dataReceived = req.body;
  let username = dataReceived.username; // String of username
  let password = dataReceived.password; // String of password

  let user = "\"" + dataReceived.username + "\""; // String of username for db
  let pass = "\"" + dataReceived.password + "\""; // String of password for db

  // Check from database if user is valid
  (async () => {
    try {
      let sql = "SELECT username from users WHERE username = " + user + " AND password = " + pass;
      let result = await query(sql);
      let resultString = JSON.stringify(result);

      // Check if we got the username, 3 because it gives 2 when there is no user by the username that was searched and username must be atleast 4 characters.
      if(resultString.length > 3) {
        let usernameDb = result[0].username;
        console.log(
            "Username: " + usernameDb + " and compared to: " + username);

        if (usernameDb == username) {
          console.log("Server send value true");
          res.send(true);
        } else {
          console.log("Server send value false");
          res.send(false);
        }
      }
      else {
        res.send(false);
      }

    } catch(error) {
      console.log(error);
      res.send("Problems with the database.");
    }
  })()
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
