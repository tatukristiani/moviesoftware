var json;
(function () {
  let list = document.getElementById("movieList");
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      list.innerHTML = "";
      json = xhr.responseText;
      //console.log(json);
      populateMovieList(json);

    }
    else if(xhr.status == 404 || xhr.status == 500) {
      list.innerHTML = "Something went wrong! No movies found!";
    }
  };

  xhr.open("GET", "http://localhost:8080/home", true);
  xhr.send();

})();

// Function that populates movieList on homepage with movies in the database.
function populateMovieList(json) {
  let list = document.getElementById("movieList");
  var parsedJson = JSON.parse(json);

  let uoList = document.createElement("ul");
  uoList.className = "homePageMovieList";

  for(let i = 0; i < parsedJson.length; i++) {
    let li = document.createElement("li");
    let figure = document.createElement("figure");
    let image = document.createElement("img");
    image.src = parsedJson[i].poster;
    image.alt = parsedJson[i].name;
    image.className = "image";

    // Create movie information
    let movieInfo = document.createElement("div");
    movieInfo.innerHTML = jsonToMovieInfo(parsedJson[i]);
    movieInfo.className = "imageInfo";

    // Create a button for adding to "My movies"
    let button = document.createElement("button");
    button.className = "add-movie-button";
    button.innerHTML = "I've seen this!";
    button.addEventListener('click', e => {
      var dataForServer = sessionStorage.getItem("username");
      saveToUserDatabase(parsedJson[i], dataForServer);
    });


    figure.appendChild(image);
    figure.appendChild(movieInfo);
    figure.appendChild(button);
    li.appendChild(figure);
    uoList.appendChild(li);
  }
  list.appendChild(uoList);
}