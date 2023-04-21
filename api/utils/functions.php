<?php

    // Forms a response object
    function getJSONResponse($type, $status, $code, $message) {

       $response = [ // Response object
            'type' => $type,
            'status' => $status,
            'code' => $code,
            'message' => $message
        ];

        return json_encode($response); // Returns the response object as a JSON string

    };

?>

<?php

    // Deletes the user's token from the database and/or cookies
    function deleteToken($token, $conn, $deleteFromCookies, $deleteFromDatabase) {

        if ($deleteFromCookies && isset($_COOKIE['_csfr'])) { // If it was requested to delete the token from cookies

            unset($_COOKIE['_csfr']); // Delete the token from cookies
            setcookie('_csfr', '', time() - 3600, '/'); // Delete the token from cookies
            
        };

        if ($deleteFromDatabase) { // If it was requested to delete the token from the database
            
            $tokenQuery = "DELETE FROM tokens WHERE token = '$token'"; // Query to delete the token from the database
            mysqli_query($conn, $tokenQuery); // Delete the token from the database
            
        };

    };

?>