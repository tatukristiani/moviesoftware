
// This function works when user is on homepage.
// Function saves the movie that the user picked from home page to their database.
function saveToUserDatabase(jsonFormat, user) {

  if(user !== null) {
    let name = jsonFormat.name;
    let year = jsonFormat.year;
    let json;

    // Send name and year to server, then server will find the movies info and add them to database.
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        json = xhr.responseText;
        let response = JSON.stringify(json);
        alert(response);
      } else if (xhr.status == 404 || xhr.status == 500) {
        alert("Oops, couldn't save the movie... Sorry!");
      }
    };

    let uri = "http://localhost:8080/saveMovieToDb?name=" + name + "&year=" +
        year + "&user=" + user;
    xhr.open("POST", uri, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
  }
  else {
    alert("You have to be signed in to add a movie to your list!");
  }
}

// This function works when user is on search page.
// Function saves the searched movie to their database.
function saveToUserDatabaseSearch(jsonFormat, user) {

  if(user !== null) {
    let name = jsonFormat.Title;
    let year = jsonFormat.Year;
    let json;

    // Send name and year to server, then server will find the movies info and add them to database.
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        json = xhr.responseText;
        let response = JSON.stringify(json);
        alert(response);
      } else if (xhr.status == 404 || xhr.status == 500) {
        alert("Oops, couldn't save the movie... Sorry!");
      }
    };

    let uri = "http://localhost:8080/saveMovieToDb?name=" + name + "&year=" +
        year + "&user=" + user;
    xhr.open("POST", uri, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
  }
  else {
    alert("You have to be signed in to add a movie to your list!");
  }
}

