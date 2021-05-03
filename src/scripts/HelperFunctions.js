
// Transfers JSON-data to a html string that displays the data in a nice way.
// This one is for search page! They have different attributes.
function jsonToMovieInfoString(parsedJson) {
  let title = parsedJson.Title;
  let year = parsedJson.Year;
  let runtime = parsedJson.Runtime;
  let genre = parsedJson.Genre;
  let info = "<h1>" + title + "</h1><br><br>" +
      "<p>Year: " + year + "</p><br>" +
      "<p>Runtime: " + runtime + "</p><br>" +
      "<p>Genre: " + genre + "</p><br>";
  return info;
};

// Same as jsonToMovieInfoString() but this one is for Home Page
function jsonToMovieInfo(parsedJson) {
  let title = parsedJson.name;
  let year = parsedJson.year;
  let runtime = parsedJson.runtimeMin + " min";
  let genre = parsedJson.genre;
  let info = "<h1>" + title + "</h1><br><br>" +
      "<p>Year: " + year + "</p><br>" +
      "<p>Runtime: " + runtime + "</p><br>" +
      "<p>Genre: " + genre + "</p><br>";
  return info;
};


function timeConvertToString(minutes) {
  var timeInHours = minutes / 60;
  var decimalsFromHour = timeInHours - Math.floor(timeInHours);
  var hour = timeInHours - decimalsFromHour;
  var minutes = minutes - hour * 60;
  let stringToReturn = "Time spent on movies: " + hour + " hours and " + minutes + " minutes.";

  return stringToReturn;
}

function openHome() {
  window.location.href = 'index.html';
}


