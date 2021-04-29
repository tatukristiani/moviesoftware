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
    let username = createAccountForm.querySelector("#signupUsername").value;
    let password = createAccountForm.querySelector("#signupPassword").value;
    let confirmPassword = createAccountForm.querySelector("#signupPasswordConfirm").value;

    createAccount(username, password, confirmPassword, createAccountForm);
  });

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

    inputElement.addEventListener("input", e => {
      clearInputError(inputElement);
      clearFormMessage(createAccountForm);
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

function clearFormMessage(formElement) {
  formElement.querySelector(".form-message").textContent = '';
}

function clearInputs(formElement) {
  formElement.querySelectorAll(".form-input").forEach(element => {
    element.value = '';
  })
}

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

function createAccount(username, password, confirmPassword, createForm) {
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
          // Error message, if username and password doesn't match then send an error message.
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

