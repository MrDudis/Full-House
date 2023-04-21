<?php

    include "../db.php"; // Database connection
    include "../utils/functions.php"; // Utility functions

?>

<?php

    $token = $_COOKIE["_csfr"] ?? ""; // Gets the token from the cookies

    if (!$token) { // If the token is not set
        echo getJSONResponse('success', 'ok', 200, 'Signed out successfully.'); // Returns an error
        return;
    };

    $tokenQuery = "DELETE FROM tokens WHERE token = '$token'"; // Gets the token from the database
    $result = mysqli_query($conn, $tokenQuery); // Executes the query

    if (!$result) { // If the query failed
        echo getJSONResponse('error', 'internal_server_error', 500, 'Internal server error. Try again later.'); // Returns an error
        return;
    };

    echo getJSONResponse('success', 'ok', 200, 'Signed out successfully.'); // Returns an error
    return;

?>