async function SignInSubmit() {
    emitError(""); // Clears the error message

    // Get the form button
    let submitButton = document.getElementById("submit");

    // Set the button as disabled for loading
    submitButton.disabled = true;

    // Get the values from the form
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let rememberMe = document.getElementById("remember").checked;

    // Check if the fields are empty
    if (email == "" || password == "") {
        submitButton.disabled = false;
        return emitError("E-mail and password are required.");
    };

    let headers = { // Set the headers
        "Content-Type": "application/json"
    };

    let data = { // Set the data
        email: email,
        password: password,
        rememberMe: rememberMe
    };

    // Send the request
    let response = await fetch("/api/auth/signin.php", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data)
    });

    let json = await response.json().catch(() => {}); // Get the response

    if (!json?.code) { // Check if the response is valid
        submitButton.disabled = false;
        return emitError("Internal server error. Try again later.");
    };

    if (json.code == 200) { // Check if the response is successful and if it is, redirect the user to the home page
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect_url');

        submitButton.disabled = false;
        return fadeOut(redirectUrl ?? '/listings', '0.2s');
    } else {
        submitButton.disabled = false;
        return emitError(json?.message ?? "Internal server error. Try again later."); // If the response is not successful, display the error message
    };

}

function emitError(message) {

    // Get the error box and the error message
    let errorBox = document.getElementById("form-error-div");
    let error = document.getElementById("form-error-message");

    // Hide the error box
    errorBox.style.display = "none";
    errorBox.style.visibility = "hidden";

    // Set the error message
    error.innerHTML = message;

    // Show the error box with a fade in effect
    setTimeout(() => {

        if (message != "") { // Check if the error message is empty and if it is not, show the error box
            errorBox.style.display = "block";
            errorBox.style.visibility = "visible";

            errorBox.style.animation = "fadeIn ease 1s";
            errorBox.style["animation-fill-mode"] = "forwards";
        };

    }, 200);

    return;
};