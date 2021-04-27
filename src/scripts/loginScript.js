document.addEventListener('DOMContentLoaded',() => {
  const loginForm = document.querySelector("#login");
  const createAccountForm = document.querySelector("#createAccount");

  document.querySelector("#linkCreateAccount").addEventListener('click', e => {
    e.preventDefault();
    loginForm.classList.add("form-hidden");
    createAccountForm.classList.remove("form-hidden");
  });

  document.querySelector("#linkLogin").addEventListener('click', e =>  {
    e.preventDefault();
    loginForm.classList.remove("form-hidden");
    createAccountForm.classList.add("form-hidden");
  });

  document.querySelector("#linkHome").addEventListener('click', e => {
    e.preventDefault();
    openHome();

  });
  
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    let username = loginForm.querySelector("#loginUsername").value;
    let password = loginForm.querySelector("#loginPassword").value;

    accountValidate(username, password, loginForm);
  });

  createAccountForm.addEventListener('submit', e => {
    e.preventDefault();

    // AJAX logic here

    // Error message when passwords doesn't matchup

    // Error message when username is too short or too long
  });

  document.querySelectorAll(".form-input").forEach(inputElement => {
    inputElement.addEventListener("blur", e => {
      if (e.target.id === "signupUsername" && e.target.value.length > 0 && e.target.value.length < 4) {
        setInputError(inputElement, "Username must be at least 4 characters in length");
      }

    });

    inputElement.addEventListener("input", e => {
      clearInputError(inputElement);
    });
  });
});

// Sets the forms message
function setFormMessage(formElement, type, message) {
  const msgElement = formElement.querySelector(".form-message");

  msgElement.textContent = message;
  msgElement.classList.remove("form-message-success", "form-message-error");
  msgElement.classList.add("form-message-$(type)");
};

// Set the error message of input
function setInputError(inputElement, message) {
  inputElement.classList.add("form-input-error");
  inputElement.parentElement.querySelector(".form-input-error-message").textContent = message;
};

// Clears the error message when user continues typing.
function clearInputError(inputElement) {
  inputElement.classList.remove("form-input-error");
  inputElement.parentElement.querySelector(".form-input-error-message").textContent = "";
};

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
};
