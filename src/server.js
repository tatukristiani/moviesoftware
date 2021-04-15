var util = require('util');
var express = require('express');
var mysql = require('mysql');
var cors = require('cors');

// Create connection to database
var sqlCon = mysql.createConnection({
  host: "localhost",
  user: "olso",
  password: "olso",
  database: "example_db" //to be determined
})

// Connect to database
sqlCon.connect(function(err) {
  if(err) throw err;
  console.log("Connected to MySQL!");
});

// eslint-disable-next-line no-unused-vars
var query = util.promisify(sqlCon.query).bind(sqlCon);

var app = express();
app.use(cors()); // Allow Access from all domains

var bodyParser = require('body-parser');
// eslint-disable-next-line no-unused-vars
var urlencodedParser = bodyParser.urlencoded({exended: false});
app.use(bodyParser.urlencoded({extended: false }));
app.use(bodyParser.json());


// Sites that are listed

app.get('/', function(req,res) {
  console.log("Got a GET request for the homepage");

  res.send("Hello!");
})

app.get('/search', function(req, res) {
  console.log("Switched to search mode.");

  res.send("Now searching");
})


// Server listening to port 8080.
var server = app.listen(8080, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Listening at http://%s:%s", host, port);
})
