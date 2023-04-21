<?php

    include "../db.php"; // Database connection
    include "../utils/functions.php"; // Utility functions

?>

<?php

    $_POST = json_decode(file_get_contents("php://input"), true); // Gets the POST data

    // Gets all the data from the request body

    $email = $_POST["email"] ?? ""; // Gets the email from the POST data
    $password = $_POST["password"] ?? ""; // Gets the password from the POST data
    $rememberMe = $_POST["rememberMe"] ?? false; // Gets the rememberMe value from the POST data

    // Validates and sanitizes the data

    if (preg_match('/[\'"^£$%&*;:()}{#~?<>,|=_¬]/', $email)) { // If the email has special characters
        echo getJSONResponse('error', 'invalid_credentials', 401, 'Invalid credentials.'); // Returns an error
        return;
    };

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { // If the email is not valid
        echo getJSONResponse('error', 'invalid_credentials', 401, 'Invalid credentials.'); // Returns an error
        return;
    }

    // Hashes the password

    $password = hash('sha256', $password);

    // Checks if the user exists

    $userQuery = "SELECT * FROM users WHERE email = '$email' AND password = '$password'"; // Query to get the user
    $userResult = mysqli_query($conn, $userQuery); // Executes the query

    if (mysqli_num_rows($userResult) == 0) { // If the user does not exist
        echo getJSONResponse('error', 'invalid_credentials', 401, 'Invalid credentials.'); // Returns an error
        return;
    };

    $userRow = mysqli_fetch_array($userResult); // Gets the user row

    $token = bin2hex(random_bytes(32)); // Generates a random token

    if ($rememberMe) { // If the user wants to be remembered

        $time = time() + ((86400 * 30) * 3); // Sets the token expiration time to 3 months
        $expires = date("Y-m-d H:i:s", $time); // Sets the token expiration time to 3 months

    } else { // If the user doesn't want to be remembered

        $time = 0; // Sets the token expiration time to 0
        $expires = date("Y-m-d H:i:s", time() + (86400 * 3)); // Sets the token expiration time to 3 days

    };

    // Inserts the token into the database

    $tokenQuery = "INSERT INTO tokens(user_id, token, expire_date) VALUES ('$userRow[0]', '$token', '$expires')"; // Query to insert the token into the database
    $tokenResult = mysqli_query($conn, $tokenQuery); // Executes the query

    if (!$tokenResult) { // If the query failed
        echo getJSONResponse('error', 'internal_server_error', 500, 'Internal server error. Try again later.'); // Returns an error
        return;
    };
        
    setcookie("_csfr", $token, $time, "/"); // Sets the token in the cookies

    echo getJSONResponse('success', 'signin_success', 200, 'Successfully signed in.'); // Returns a success
    return;

?>