/**
 * Transfers a parsed JSON-data to a string and returns it. This version of the function is used when dealing with data from the external API (omdbAPI).
 * @param parsedJson Parsed JSON-data. Properties of the JSON-data differ from the jsonToMovieInfo()-function.
 * @returns {string} HTML + String combination that includes movies title, year, runtime and genre.
 */
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

/**
 * Transfers a parsed JSON-data to a string and returns it. This version of the function is used when dealing with data from the database.
 * @param parsedJson Parsed JSON-data. Properties of the JSON-data differ from the jsonToMovieInfoString()-function.
 * @returns {string} HTML + String combination that includes movies title, year, runtime and genre.
 */
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

/**
 * Converts minutes to a string that shows hours and minutes.
 * @param minutes Takes in a number that is expected to be in minutes.
 * @returns {string} String that shows how many hours and minutes the given minutes is.
 */
function timeConvertToString(minutes) {
  var timeInHours = minutes / 60;
  var decimalsFromHour = timeInHours - Math.floor(timeInHours);
  var hour = timeInHours - decimalsFromHour;
  var minutes = minutes - hour * 60;
  let stringToReturn = "Time spent on movies: " + hour + " hours and " + minutes + " minutes.";

  return stringToReturn;
}

/**
 * Function opens the "Home" page (index.html)
 */
function openHome() {
  window.location.href = 'index.html';
}


