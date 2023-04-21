<?php

    include "../db.php"; // Database connection
    include "../utils/functions.php"; // Utility functions
    include "../utils/authentication.php"; // Authentication functions

?>

<?php

    $token = $_COOKIE["_csfr"] ?? ""; // Gets the token from the cookies

    $tokenInfo = validateAuthentication($conn, $token); // Validates the token

    if ($tokenInfo['code'] == 401) { // If the token is invalid

        if ($tokenInfo['deleteToken']) { // If it was requested to delete the token from cookies
            deleteToken($token, $conn, true, true); // Deletes the token from the cookies
        };

        echo getJSONResponse('error', 'unauthorized', 401, 'Unauthorized.'); // Returns an error
        return;
    };

    echo json_encode([
        'type' => 'account_found',
        'status' => 'success',
        'code' => 200,
        'message' => 'User authenticated.',
        'user' => $tokenInfo['user'],
        'token' => $tokenInfo['token']
    ]);

    return;

?>