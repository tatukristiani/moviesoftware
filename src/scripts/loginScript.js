/**
 * The login / register page has a type of "DOMContentLoaded"-eventlistener that activates all the eventlisteners for the login / register page.
 */
document.addEventListener('DOMContentLoaded',() => {
  const loginForm = document.querySelector("#login");
  const createAccountForm = document.querySelector("#createAccount");

  // When the "Don't have an account? Create one!" Link is clicked changes the login/register forms classes.
  document.querySelector("#linkCreateAccount").addEventListener('click', e => {
    e.preventDefault();
    loginForm.classList.add("form-hidden");
    createAccountForm.classList.remove("form-hidden");
  });

  // When the "Already have an account? Sign in." Link is clicked changes the login/register forms classes.
  document.querySelector("#linkLogin").addEventListener('click', e =>  {
    e.preventDefault();
    loginForm.classList.remove("form-hidden");
    createAccountForm.classList.add("form-hidden");
  });

  // Opens the index.html page when "Continue without login in" link is clicked.
  document.querySelector("#linkHome").addEventListener('click', e => {
    e.preventDefault();
    openHome();

  });

  // On login forms submit -> calls  the accountValidate()-function.
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    let username = loginForm.querySelector("#loginUsername").value;
    let password = loginForm.querySelector("#loginPassword").value;

    accountValidate(username, password, loginForm);
  });

  // On create account form submit -> calls the createAccount()-function.
  createAccountForm.addEventListener('submit', e => {
    e.preventDefault();
    let username = createAccountForm.querySelector("#signupUsername").value;
    let password = createAccountForm.querySelector("#signupPassword").value;
    let confirmPassword = createAccountForm.querySelector("#signupPasswordConfirm").value;

    createAccount(username, password, confirmPassword, createAccountForm);
  });

  // Input elements like for the username and password for create account form has eventlisteners that indicate errors for the user.
  document.querySelectorAll(".form-input").forEach(inputElement => {
    inputElement.addEventListener("blur", e => {
      if (e.target.id === "signupUsername" && e.target.value.length > 0 && e.target.value.length < 4) {
        setInputError(inputElement, "Username must be at least 4 characters in length");
      }
      if(e.target.id === "signupPassword" && e.target.value.length > 0 && e.target.value.length < 4) {
        setInputError(inputElement, "Password must be at least 4 charachters in length");
      }
      if(e.target.id === "signupPasswordConfirm") {
        let pass = createAccountForm.querySelector("#signupPassword").value;
        if(pass !== e.target.value) {
          setInputError(inputElement, "Your passwords don't match!");
        }
      }
    });

    // Clears the error messages after the user starts typing on that input element and form message for the createAccountForm.
    inputElement.addEventListener("input", e => {
      clearInputError(inputElement);
      clearFormMessage(createAccountForm);
    });
  });
});

/**
 * Function sets a given message to a specified form with a type.
 * @param formElement Form where the message is going to go.
 * @param type Success/Error-types, types are told to the function simply with either "error" or "success"
 * @param message Message that is going to the form.
 */
function setFormMessage(formElement, type, message) {
  const msgElement = formElement.querySelector(".form-message");

  msgElement.textContent = message;
  msgElement.classList.remove("form-message-success", "form-message-error");
  msgElement.classList.add("form-message-$(type)");
};

/**
 * Clears the specified forms .form-message.
 * @param formElement The element where the message is being cleared.
 */
function clearFormMessage(formElement) {
  formElement.querySelector(".form-message").textContent = '';
}

/**
 * Clears the inputs from a specified form.
 * @param formElement The form where the input are being cleared.
 */
function clearInputs(formElement) {
  formElement.querySelectorAll(".form-input").forEach(element => {
    element.value = '';
  })
}

/**
 * Sets an error message for an input.
 * @param inputElement Specified input element where the message is supposed to go.
 * @param message The message that users wants to give.
 */
function setInputError(inputElement, message) {
  inputElement.classList.add("form-input-error");
  inputElement.parentElement.querySelector(".form-input-error-message").textContent = message;
};

// Clears the error message when user continues typing.
/**
 * Clears an input error from a specified input element.
 * @param inputElement The specified input element that need to be cleared.
 */
function clearInputError(inputElement) {
  inputElement.classList.remove("form-input-error");
  inputElement.parentElement.querySelector(".form-input-error-message").textContent = "";
};

/**
 * Function sends a POST-request to the server that sends a response back and it can be of values: true or false. True meaning that the user has an account and gave the right credentials, false meaning the opposite.
 * @param username Users usename that is being validated.
 * @param password Users password that is being validated.
 * @param loginForm The loginform, where the response is going to show up.
 */
function accountValidate(username, password, loginForm) {
  let account = {
    username: username,
    password: password
  };
  let dataToSend = JSON.stringify(account);
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if(xhr.readyState == 4 && xhr.status == 200) {
      let response = xhr.responseText;
      console.log("Response from server: " + response);

      let jsonObj = JSON.parse(response);
      console.log(jsonObj);

      if(jsonObj == true) {
        sessionStorage.setItem("username", username);
        openHome();
      }
      else {
        // Error message, if username and password doesn't match then send an error message.
        setFormMessage(loginForm, "error", "Invalid username/password combination");
      }
    }
  };
  let uri = "http://localhost:8080/accountValidate";

  xhr.open('POST', uri, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(dataToSend);
}

/**
 * Function creates an account for the user. The response from the server can be of type: true, false or a string. True meaning that the account was created, false meaning that there was an error with the database.
 * and a string when the username is already taken or password/username is/are too short.
 * @param username Username the user has given.
 * @param password password the user has given.
 * @param confirmPassword Confirmation of the password the user has given.
 * @param createForm The form where the account was created.
 */
function createAccount(username, password, confirmPassword, createForm) {
  // Checks one more time that the user has entered the same password twice.
  if (password !== confirmPassword) {
    setFormMessage(createForm, "error",
        "Your passwords didn't match. Try again.");
  } else {
    let user = {
      username: username,
      password: password
    };

    let dataToSend = JSON.stringify(user);
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        let response = xhr.responseText;
        console.log("Response from server: " + response);
        let jsonObj = JSON.parse(response);
        //console.log(jsonObj);

        if (jsonObj == true) {
          sessionStorage.setItem("username", username);
          openHome();
        } else if(jsonObj == false) {
          setFormMessage(createForm, "error",
              "There was a problem with the database, couldn't create an account.");
        } else {
          setFormMessage(createForm, "error", jsonObj.response);
          clearInputs(createForm);
        }
      }
    };

    let uri = "http://localhost:8080/createAccount";

    xhr.open('POST', uri, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(dataToSend);
  }
}

