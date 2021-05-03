let div = document.getElementById("search-results");

/**
 * Function that sends a GET-request to the server and tries to find a movie with the users inputs.
 */
function searchMovie() {
  let movieName = document.getElementById('search').value;
  let movieYear = document.getElementById('year').value;

  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var json = xhr.responseText;
      //console.log(json);
      if (json.length > 0) {
        showSearchResults(json);
        document.getElementById("search").value = "";
        document.getElementById("year").value = "";
      } else {
        div.innerHTML = 'No movies found!';
      }

    } else if (xhr.status == 404) {
      div.innerHTML = 'Something went wrong!';
    }
  };

  let uri = "http://localhost:8080/search?name=" + movieName + "&year=" + movieYear;
  console.log("URI: " + uri);

  xhr.open('GET', uri, true);
  xhr.send();
}

// Used for storing parsed JSON. (Had some problems with accessing the data)
let cacheMovieData = null;

/**
 * Shows the movie information on the html-page that are on the parameter json.
 * @param json String of a JSON-object.
 */
function showSearchResults(json) {
  // 1st step is to clear all current search result that are on the page.
  while(div.hasChildNodes()) {
    div.removeChild(div.firstChild);
  }
  let parsedJson = JSON.parse(json);
  cacheMovieData = parsedJson;

  // If response field has false then it means there are no search results.
  if(parsedJson.Response.includes("False"))  {
    let para = document.createElement("p");
    para.innerHTML = "No movies were found! Try to find something else instead.";
    div.appendChild(para);
  }
  else {

    // Create unordered list and parse json data.
    let ul = document.createElement('ul');


    // Create list item and figure
    let li = document.createElement('li');
    let figure = document.createElement("figure");

    // Create img/image text and add their values
    let img = document.createElement('img');

    // If a movies was found, but it has only couple informations about the movie and it doesn't have a poster -> we use a default one.
    if(parsedJson.Poster.includes("N/A")) {
      img.src = "../images/no-image-available-icon-10.jpg";
    }
    else {
      img.src = parsedJson.Poster;
    }
    img.alt = parsedJson.Title;
    img.className = "image";

    // Create movie information
    let movieInfo = document.createElement("div");
    movieInfo.innerHTML = jsonToMovieInfoString(parsedJson);
    movieInfo.className = "imageInfo";

    // Create a button for adding to "My movies"
    let button = document.createElement("button");
    button.className = "add-movie-button";
    button.innerHTML = "I've seen this!";
    button.addEventListener('click', e => {
      var dataForServer = sessionStorage.getItem("username");
      saveToUserDatabaseSearch(parsedJson, dataForServer);
    });

    // Add all to their parent nodes
    figure.appendChild(img);
    figure.appendChild(movieInfo);
    figure.appendChild(button);

    // Adding movies to database directly, only for admin.
    if(sessionStorage.getItem("username") === "admin") {
      let buttonDb = document.createElement("button");
      buttonDb.className = "addToDatabaseButton";
      buttonDb.innerHTML = "Add to database";
      buttonDb.addEventListener("click", addMovieToDatabase);
      figure.appendChild(buttonDb);
    }

    li.appendChild(figure);
    ul.appendChild(li);
    div.appendChild(ul);
  }
}


// Function that adds a movie to the database (used by author)
/**
 * Authors tool to add movies easily to the database.
 */
function addMovieToDatabase() {
  if(cacheMovieData != null) {
    let movieData = JSON.stringify(cacheMovieData);
    console.log("movie data: " + movieData);
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        var response = xhr.responseText;
        //console.log(response);
        alert(response);
      }
    };

    let uri = "http://localhost:8080/saveDataToDb"

    xhr.open('POST', uri, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(movieData);
  }
  else {
    console.log("There is no point to save nothing.")
  }
}