<?php

    // Valides an authentication token
    function validateAuthentication($conn, $token) {

        if (!$token) { // If the token is not set
            
            return [ // Returns an unauthorized response
                'type' => 'error', 'status' => 'unauthorized', 'code' => 401, 'message' => 'Unauthorized.', 'deleteToken' => false
            ];

        };

        $tokenQuery = "SELECT * FROM tokens WHERE token = '$token'"; // Gets the token from the database
        $tokenResult = mysqli_query($conn, $tokenQuery); // Executes the query

        if (mysqli_num_rows($tokenResult) == 0) { // If the token does not exist
            
            return [ // Returns an unauthorized response
                'type' => 'error', 'status' => 'unauthorized', 'code' => 401, 'message' => 'Unauthorized.', 'deleteToken' => true
            ];

        };

        $tokenRow = mysqli_fetch_array($tokenResult); // Get the token row

        if (time() > strtotime($tokenRow['expire_date'])) { // If the token is expired

            return [ // Returns an unauthorized response
                'type' => 'error', 'status' => 'unauthorized', 'code' => 401, 'message' => 'Unauthorized.', 'deleteToken' => true
            ];

        };

        $userQuery = "SELECT * FROM users WHERE id = " . $tokenRow['user_id']; // Gets the user from the database
        $userResult = mysqli_query($conn, $userQuery); // Executes the query

        if (mysqli_num_rows($userResult) == 0) { // If the user does not exist

            return [ // Returns an unauthorized response
                'type' => 'error', 'status' => 'unauthorized', 'code' => 401, 'message' => 'Unauthorized.', 'deleteToken' => true
            ];

        };

        $userRow = mysqli_fetch_array($userResult); // Gets the user row

        return [ // Returns an unauthorized response
            'type' => 'success',
            'status' => 'account_found',
            'code' => 200,
            'message' => 'Account Found.',
            'deleteToken' => false,
            'user' => [
                'id' => $userRow['id'],
                'firstName' => $userRow['first_name'],
                'lastName' => $userRow['last_name'],
                'email' => $userRow['email']
            ],
            'token' => [
                'expireDate' => $tokenRow['expire_date']
            ]
        ];

    };

?>