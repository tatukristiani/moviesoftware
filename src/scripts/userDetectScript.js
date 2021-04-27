(function () {
  let welcome = document.getElementById("welcomeUser"); // Welcome text.
  let loginNavigation = document.getElementById("loginNavigation"); // Login / Register nav item
  let user = sessionStorage.getItem("username"); // User that is logged in, if logged in

  // If there is a user currently logged in, show welcome text and change the nav item of Login/Register -> Logout
  if(user != null) {
    welcome.innerHTML = "Welcome, " + user + " !";
    loginNavigation.innerHTML = "LOGOUT";
    loginNavigation.href = window.location.href;

    document.querySelector("#loginNavigation").addEventListener("click", e => {
      sessionStorage.clear();
    });
  }
})();


