let user = sessionStorage.getItem("username");
let message = document.querySelector(".message-for-user");
let list = document.getElementById("myMovieList");

var json;

// Gets the specific users data from the database, if the user is logged in.
(function() {
  if(user !== null) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        json = xhr.responseText;
        if(json.length > 0 && json != false) {
          populateMyMovieList(json);
        }
        else {
          message.innerHTML = "You don't have any movies added yet.";
        }

      } else if (xhr.status == 404) {
        message.innerHTML = "Something went wrong! Sorry...";
      }
    };

    let uri = "http://localhost:8080/mymovies?user=" + user;
    xhr.open("GET", uri, true);
    xhr.send();
  }
  else {
    message.innerHTML = "You must be logged in to be able to view your movies.";
  }

})();

function populateMyMovieList(json) {
  let parsedJson = JSON.parse(json);
  var totalMinutesWatched = 0;

  for(let i = 0; i < parsedJson.length; i++) {
    let li = document.createElement("li");
    let figure = document.createElement("figure");
    let img = document.createElement("img");
    img.src = parsedJson[i].poster;
    img.alt = parsedJson[i].name;
    img.className = "image";

    // Create movie information
    let movieInfo = document.createElement("div");
    movieInfo.innerHTML = jsonToMovieInfo(parsedJson[i]);
    movieInfo.className = "imageInfo";
    figure.appendChild(img);
    figure.appendChild(movieInfo);
    li.appendChild(figure);
    list.appendChild(li);
    totalMinutesWatched += parsedJson[i].runtimeMin;
  }
  message.innerHTML = timeConvertToString(totalMinutesWatched);
}