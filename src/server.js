const url = require('url');
const util = require('util');
const express = require('express');
const mysql = require('mysql'); // For database.
const cors = require('cors'); // For all access for all domains.
const request = require('request'); // For external API calls.
const bcrypt = require('bcryptjs'); // Password hash crypt.

// Create connection to database. Current database is a local one.
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


/**
 * Gets all movies from the database table "movie"
 */
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

/**
 * Searches for a movie from the omdbAPI with the users given title and year(optional).
 * This function finds only 1 movie MAX.
 */
app.get('/search', function(req, res) {
  console.log('Searching movie from external API');
  var q = url.parse(req.url, true).query;
  var movieName = q.name;
  var movieYear = parseInt(q.year);
  console.log('Movie name: ' + movieName + ' MovieYear: ' + movieYear);

  // Check if we have year input from the user, if we got one then we perform a search with it.
  if (movieYear != null && movieYear != NaN && movieYear > 0 && movieYear <
      9999) {
    request('http://www.omdbapi.com/?t=' + movieName + '&y=' + movieYear +
        '&apikey=1376e1b1', function(error, response, body) {
      console.log(body);
      console.log('Search with year completed.');
      res.send(body);
    });
  }

  // If user didn't add a year to the search bar, then we don't use it.
  else {
    request('http://www.omdbapi.com/?t=' + movieName + '&apikey=1376e1b1',
        function(error, response, body) {
          //console.log(body);
          console.log('Search without year completed!');
          res.send(body);
        });
  }
});

// Save data to database (Authors tool for adding movies)
/**
 * Authors tool for adding movies to the database.
 */
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

/**
 * Checks if the users given username and password are indeed correct.
 */
app.post('/accountValidate', function(req, res) {
  console.log("Validating user credentials.");
  let dataReceived = req.body;
  let username = dataReceived.username; // String of username
  let password = dataReceived.password; // String of password

  let user = '"' + username + '"'; // String of username for db

  // Check from database if user is valid
  (async () => {
    try {
      let sql = 'SELECT username, password from users WHERE username = ' + user;
      let result = await query(sql);
      let resultString = JSON.stringify(result);

      // Check if we got the username, 3 because it gives 2 when there is no user by the username that was searched and username must be at least 4 characters.
      if (resultString.length > 3) {
        let usernameDb = result[0].username;
        var hashPass = result[0].password;

        // Using the bcrypts compare method to check if the password in the database matches with the one given by the user.
        bcrypt.compare(password, hashPass, function(error, response) {
          //console.log(response);
          if(response == true && usernameDb == username) {
            res.send(true);
          }
          else if(response == false) {
            console.log(error);
            res.send(false);
          }
        });
      } else {
        res.send(false);
      }

    } catch (error) {
      console.log(error);
      res.send('Problems with the database.');
    }
  })();
});


/**
 * Creates an account for the user.
 * Hashes the password and check the correct validation of the username/password.
 */
app.post('/createAccount', function(req, res) {
  console.log("Creating an account");
  let dataReceived = req.body;
  let username = dataReceived.username; // String of username
  let password = dataReceived.password; // String of password
  let responseString;

  if(username.length > 3 && password.length > 3) {

    var hashPass = bcrypt.hashSync(password, 12);
    let user = '"' + username + '"'; // String of username for db
    let pass = '"' + hashPass + '"'; // String of password for db

    // Check from database if user is valid
    (async () => {
      try {
        let sql = "SELECT username FROM users WHERE username = " + user;
        let accountExists = await query(sql);


        if(JSON.stringify(accountExists).length < 3) {
          sql = "INSERT INTO users(username,password,user_level) VALUES(" +
              user + ", " + pass + ", 'user')";
          await query(sql);
          res.send(true);
        }
        else {
          responseString = {
            response: "This username is already taken. Pick another one."
          }
          res.send(responseString);
        }

      } catch (error) {
        console.log(error);
        res.send(false);
      }
    })();
  }
  else {
    responseString = {
      response: "Username and password must be at least 4 characters in length!"
    };
    res.send(responseString);
  }
});

/**
 * Saves the movies data to the users database. Finds the movies data from the external API.
 */
app.post('/saveMovieToDb', urlencodedParser, function(req, res) {
  console.log("Saving movie to users database.");

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
    //console.log('Server response: ' + body);
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
    let userID; // For the users ID.
    let movieID; // For the movies ID.

    // Check if the movie is in database. If it's not add it.
    (async () => {
      try {
        // Check if the movie is already in the database.
        let sql = 'SELECT * FROM movie WHERE name = ' + name + ' AND year = ' +
            year;
        let result = await query(sql);
        let resultString = JSON.stringify(result);

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

        // Search for movies ID
        sql = 'SELECT id FROM movie WHERE name = ' + name + ' AND year = ' +
            year;
        result = await query(sql);
        movieID = result[0].id;
        console.log(movieID);

        // First we check if the movie is already in the users database.
        sql = "SELECT * from user_movie WHERE userID = " + userID + " AND movieID = " + movieID;
        let confirmMovieDoesntExists = await query(sql);

        // If we wound out that the user doesn't have this movie we save it.
        if(JSON.stringify(confirmMovieDoesntExists).length < 3) {

          // Then add this movie to the user_movie table.
          sql = 'INSERT INTO user_movie(userID,movieID) VALUES(' + userID +
              ', ' +
              movieID + ')';
          await query(sql);
          res.send(movieName + ' successfully added to your movies!');
        }
        else {
          res.send("You already have " + movieName + " added to your movies.");
        }
      } catch (error) {
        console.log(error);
        res.send('Couldn\'t add ' + movieName + ' to your movies.');
      }
    })();
  });
});

/**
 * Finds all movies that the user has on the database.
 */
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
