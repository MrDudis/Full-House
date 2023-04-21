<?php

    include "../db.php"; // Database connection
    include "../utils/functions.php"; // Utility functions

?>

<?php

    $_POST = json_decode(file_get_contents("php://input"), true); // Decodes the JSON data from the request body
    
    // Gets all the data from the request body

    $firstName = $_POST["firstName"] ?? ""; // Gets the first name from the request body
    $lastName = $_POST["lastName"] ?? ""; // Gets the last name from the request body
    $cpf = $_POST["cpf"] ?? ""; // Gets the CPF from the request body
    $email = $_POST["email"] ?? ""; // Gets the email from the request body
    $password = $_POST["password"] ?? ""; // Gets the password from the request body

    // Validates and sanitizes the data

    if (strlen($firstName) < 2 || strlen($firstName) > 64) { // If the first name is invalid
        echo getJSONResponse('error', 'invalid_first_name', 400, 'First name must be between 2 and 64 characters.'); // Returns an error
        return;
    };

    if (strlen($lastName) < 2 || strlen($lastName) > 64) { // If the last name is invalid
        echo getJSONResponse('error', 'invalid_last_name', 400, 'Last name must be between 2 and 64 characters.'); // Returns an error
        return;
    };

    $cpf = preg_replace('#[^0-9?!]#i', '', $cpf); // Removes special characters from the cpf

    if (strlen($cpf) != 11) { // If the CPF is invalid
        echo getJSONResponse('error', 'invalid_cpf', 400, 'CPF must be 11 characters.'); // Returns an error
        return;
    };

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 128) { // If the email is invalid
        echo getJSONResponse('error', 'invalid_email', 400, 'Invalid e-mail address.'); // Returns an error
        return;
    };

    if (preg_match('/[\'"^£$%&*;:()}{#~?<>,|=_¬-]/', $email)) { // If the email has special characters
        echo getJSONResponse('error', 'invalid_email', 400, 'Invalid e-mail address.'); // Returns an error
        return;
    };

    if (strlen($password) < 7) { // If the password is invalid
        echo getJSONResponse('error', 'invalid_password', 400, 'Password must have at least 7 characters.'); // Returns an error
        return;
    };

    // Checks if the e-mail is already in use

    $emailQuery = "SELECT * FROM users WHERE email = '$email'"; // Query to get the user
    $result = mysqli_query($conn, $emailQuery); // Executes the query

    if (mysqli_num_rows($result) > 0) { // If the email is already in use
        echo getJSONResponse('error', 'email_taken', 400, 'E-mail address is already taken.'); // Returns an error
        return;
    };

    // Hashes the password

    $password = hash('sha256', $password);

    // Inserts the user into the database

    $userQuery = "INSERT INTO users(first_name, last_name, cpf, email, password) VALUES ('$firstName', '$lastName', '$cpf', '$email', '$password')"; // Query to insert the user into the database
    $result = mysqli_query($conn, $userQuery); // Executes the query

    if (!$result) { // If the query failed
        echo getJSONResponse('error', 'internal_server_error', 500, 'Internal server error. Try again later.'); // Returns an error
        return;
    };

    // Signup was successful, so we can now sign the user in.

    $userQuery = "SELECT * FROM users WHERE email = '$email' AND password = '$password'"; // Query to get the user
    $userResult = mysqli_query($conn, $userQuery); // Executes the query

    if (mysqli_num_rows($userResult) == 0) { // If the user was not found
        echo getJSONResponse('error', 'internal_server_error', 500, 'Internal server error. Try again later.'); // Returns an error
        return;
    };

    $userRow = mysqli_fetch_array($userResult);

    $token = bin2hex(random_bytes(32)); // Generates a random token

    $time = time() + ((86400 * 30) * 3); // Sets the expiration time to 3 months from now
    $expires = date("Y-m-d H:i:s", $time); // Converts the expiration time to a date

    $tokenQuery = "INSERT INTO tokens(user_id, token, expire_date) VALUES ('$userRow[0]', '$token', '$expires')"; // Query to insert the token into the database
    $tokenResult = mysqli_query($conn, $tokenQuery); // Executes the query

    if (!$tokenResult) { // If the query failed
        echo getJSONResponse('error', 'internal_server_error', 500, 'Internal server error. Try again later.'); // Returns an error
        return;
    };
    
    setcookie("_csfr", $token, $time, "/"); // Sets the token cookie

    echo getJSONResponse('success', 'signup_success', 200, 'Signed up successfully.'); // Returns a success message
    return;

?>