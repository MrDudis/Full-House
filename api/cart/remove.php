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

    $_POST = json_decode(file_get_contents("php://input"), true); // Gets the POST data

    $productId = $_POST["productId"]; // Gets the product id from the POST data

    if (!$productId) {
        echo getJSONResponse('error', 'product_id_required', 400, 'A product id is required.'); // Returns an error
        return;
    };

    $productId = preg_replace('/[^0-9\-]/', '', $productId); // Sanitizes the product id

    $deleteQuery = "DELETE FROM cart WHERE `user_id` = " . $tokenInfo['user']['id'] . " AND `product_id` = '$productId'"; // Query to delete the product from the cart
    $deleteResult = mysqli_query($conn, $deleteQuery); // Executes the query

    if (!$deleteResult) { // If the query failed
        echo getJSONResponse('error', 'product_not_removed', 500, 'Product not removed.'); // Returns an error
        return;
    };

    echo getJSONResponse('success', 'product_removed', 200, 'Product removed.'); // Returns a success message
    return;

?>