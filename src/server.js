const url = require('url');
const util = require('util');
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const request = require('request');

// Create connection to database
var sqlCon = mysql.createConnection({
  host: 'localhost',
  user: 'olso',
  password: 'olso',
  database: 'movies_db',
});

// Connect to database
sqlCon.connect(function(err) {
  if (err) throw err;
  console.log('Connected to MySQL!');
});

const query = util.promisify(sqlCon.query).bind(sqlCon);

const app = express();
app.use(cors()); // Allow Access from all domains

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false});
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


// Home page, displays hard coded movies from database. Data originally from external API:s database.
app.get('/home', function(req, res) {
  console.log('Home page opened');
  let sql = 'SELECT * from movie';

  (async () => {
    try {
      let result = await query(sql);
      let jsonObj = JSON.stringify(result);
      res.send(jsonObj);
    } catch (err) {
      console.log('Database error!' + err);
    }
  })();

});

// Search a movie fron omdbAPI with a movie name/year. Sends only one movie per search.
app.get('/search', function(req, res) {
  console.log('Searching movie from external API');
  var q = url.parse(req.url, true).query;
  var movieName = q.name;
  var movieYear = parseInt(q.year);
  console.log('Movie name: ' + movieName + ' MovieYear: ' + movieYear);

  // Check if we have year input from user, if we got one then we perform a search with it.
  if (movieYear != null && movieYear != NaN && movieYear > 0 && movieYear <
      9999) {
    request('http://www.omdbapi.com/?t=' + movieName + '&y=' + movieYear +
        '&apikey=1376e1b1', function(error, response, body) {
      console.log(body);
      console.log('Year search complete!');
      res.send(body);
    });
  }
  // If user didn't add a year to the search bar, then we don't use it.
  else {
    request('http://www.omdbapi.com/?t=' + movieName + '&apikey=1376e1b1',
        function(error, response, body) {
          console.log(body);
          console.log('NO year search complete!');
          res.send(body);
        });
  }
});

// Save data to database (Authors tool for adding movies)
app.post('/saveDataToDb', function(req, res) {
  console.log('Saving data to database');

  // get JSON-object from the http-body
  let jsonObj = req.body;
  console.log(jsonObj);

  // Check if there is something to be added.
  if (!jsonObj.isNull) {

    // All variables except numbers have semi-colons added for sql purposes. ex. String must be type -> "String", this is not allowed -> String.
    let name = '"' + jsonObj.Title + '"';
    let year = jsonObj.Year;
    let imageID = '"' + jsonObj.imdbID + '"';

    // Movies runtime must be converted from string to a float.
    var runtimeToFloat = parseFloat(jsonObj.Runtime).toFixed(2);
    let runtimeMin;

    // We want to double check that the value is a number.
    if (isNaN(runtimeToFloat)) {
      runtimeMin = 0.00;
    } else {
      runtimeMin = runtimeToFloat;
    }

    let genre = '"' + jsonObj.Genre + '"';
    let director = '"' + jsonObj.Director + '"';
    let actor = '"' + jsonObj.Actors + '"';
    let plot = '"' + jsonObj.Plot + '"';
    let poster = '"' + jsonObj.Poster + '"';

    // IIFE, insert the data to database. Send response to client according to success/failure.
    (async () => {
      try {
        let sql = 'INSERT INTO movie(name, year, imageID, runtimeMin, genre, director, actors, plot, poster)' +
            ' VALUES(' + name + ', ' + year + ', ' + imageID + ', '
            + runtimeMin + ', ' + genre + ', ' + director + ', '
            + actor + ', ' + plot + ', ' + poster + ')';
        await query(sql);

        res.send('Succesfully saved data to database');

      } catch (error) {
        console.log(error);
        res.send('Couldn\'t save data to database');

      }
    })();
  }
});

// Checks if the user is registered.
app.post('/accountValidate', function(req, res) {
  let dataReceived = req.body;
  let username = dataReceived.username; // String of username
  let password = dataReceived.password; // String of password

  let user = '"' + dataReceived.username + '"'; // String of username for db
  let pass = '"' + dataReceived.password + '"'; // String of password for db

  // Check from database if user is valid
  (async () => {
    try {
      let sql = 'SELECT username from users WHERE username = ' + user +
          ' AND password = ' + pass;
      let result = await query(sql);
      let resultString = JSON.stringify(result);

      // Check if we got the username, 3 because it gives 2 when there is no user by the username that was searched and username must be atleast 4 characters.
      if (resultString.length > 3) {
        let usernameDb = result[0].username;
        console.log(
            'Username: ' + usernameDb + ' and compared to: ' + username);

        if (usernameDb == username) {
          console.log('Server send value true');
          res.send(true);
        } else {
          console.log('Server send value false');
          res.send(false);
        }
      } else {
        res.send(false);
      }

    } catch (error) {
      console.log(error);
      res.send('Problems with the database.');
    }
  })();
});

// Saves movie the user clicked on to their database.
app.post('/saveMovieToDb', urlencodedParser, function(req, res) {
  var q = url.parse(req.url, true).query;

  let movieName = q.name;
  let movieYear = parseInt(q.year);
  let username = q.user;
  let uri = 'http://www.omdbapi.com/?t=' + movieName + '&y=' + movieYear +
      '&apikey=1376e1b1';
  let jsonObj;

  // Variables for saving the movie to database.
  let name;
  let year;
  let imageID;
  let runtimeToFloat;
  let genre;
  let director;
  let actor;
  let plot;
  let poster;

  // We get the movies information from the API
  request(uri, function(error, response, body) {
    console.log('Server response: ' + body);
    jsonObj = JSON.parse(body);

    // Variables for saving the movie to database.
    name = '"' + jsonObj.Title + '"';
    year = jsonObj.Year;
    imageID = '"' + jsonObj.imdbID + '"';
    runtimeToFloat = parseFloat(jsonObj.Runtime).toFixed(2);
    genre = '"' + jsonObj.Genre + '"';
    director = '"' + jsonObj.Director + '"';
    actor = '"' + jsonObj.Actors + '"';
    plot = '"' + jsonObj.Plot + '"';
    poster = '"' + jsonObj.Poster + '"';

    let searchUser = '"' + username + '"';
    console.log('Name and year: ' + name + ' & ' + year + ' & ' + searchUser);

    let userID; // For the users ID.
    let movieID; // For the movies ID.

    // Check if the movie is in database. If it's not add it.
    (async () => {
      try {

        // Check if the movie allready is in database.
        let sql = 'SELECT * FROM movie WHERE name = ' + name + ' AND year = ' +
            year;
        let result = await query(sql);
        let resultString = JSON.stringify(result);
        console.log('Result string: ' + resultString + ' and length: ' +
            resultString.length);

        // If the movie is not in database, we save it there.
        if (resultString.length < 3) {
          // Add movie to database
          sql = 'INSERT into movie(name,year,imageID,runtimeMin,genre,director,actors,plot,poster)'
              + ' VALUES(' + name + ', ' + year + ', ' + imageID + ', ' +
              runtimeToFloat + ', ' + genre + ', ' + director + ', ' + actor +
              ', ' + plot + ', ' + poster + ')';
          await query(sql);
          console.log('SQL to add database: ' + sql);
        }

        // Search for usernames ID
        sql = 'SELECT id FROM users WHERE username = ' + searchUser;
        result = await query(sql);
        userID = result[0].id;
        console.log(userID);

        // Search for movies ID
        sql = 'SELECT id FROM movie WHERE name = ' + name + ' AND year = ' +
            year;
        result = await query(sql);
        movieID = result[0].id;
        console.log(movieID);

        // Then add this movie to the user_movie table.
        sql = 'INSERT INTO user_movie(userID,movieID) VALUES(' + userID + ', ' +
            movieID + ')';
        await query(sql);

        res.send(movieName + ' successfully added to your movies!');
      } catch (error) {
        console.log(error);
        res.send('Couldn\'t add ' + movieName + ' to your movies.');
      }
    })();
  });
});


app.get('/mymovies', urlencodedParser, function(req, res) {
  console.log('Fetching users movies');
  var q = url.parse(req.url, true).query;
  let user = '"' + q.user + '"';

  (async () => {
    try {
      let sql = "SELECT * FROM movie WHERE movie.id in (SELECT movieID FROM user_movie WHERE userID in (SELECT users.id FROM users WHERE username = " + user + "))";
      let result = await query(sql);
      let jsonObj = JSON.stringify(result);
      res.send(jsonObj);
    }catch(error) {
      console.log(error);
      res.send(false);
    }
  })()
});

// Server listening to port 8080.
var server = app.listen(8080, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Listening at http://%s:%s', host, port);
});
