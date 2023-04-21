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

    $productId = $_POST["productId"] ?? "-1"; // Gets the product id from the POST data
    $quantity = $_POST["quantity"] ?? 1; // Gets the quantity from the POST data

    if (!is_numeric($quantity) || $quantity < 1 || $quantity > 50) { // If the quantity is invalid
        echo getJSONResponse('error', 'invalid_quantity', 400, 'Invalid quantity.'); // Returns an error
        return;
    };

    $productQuery = "SELECT * FROM products WHERE id = '$productId'"; // Query to get the product
    $productResult = mysqli_query($conn, $productQuery); // Executes the query

    if (mysqli_num_rows($productResult) == 0) { // If the product does not exist
        echo getJSONResponse('error', 'product_not_found', 404, 'Product not found.'); // Returns an error
        return;
    };

    $cartQuery = "SELECT * FROM cart WHERE `user_id` = " . $tokenInfo['user']['id'] . " AND `product_id` = '$productId'"; // Query to get the cart product
    $cartResult = mysqli_query($conn, $cartQuery); // Executes the query

    if (mysqli_num_rows($cartResult) == 0) { // If the product is not in the cart

        $insertQuery = "INSERT INTO cart (`user_id`, `product_id`, `quantity`) VALUES (" . $tokenInfo['user']['id'] . ", '$productId', '$quantity')"; // Query to insert the product in the cart
        $insertResult = mysqli_query($conn, $insertQuery); // Executes the query

        if (!$insertResult) { // If the query failed
            echo getJSONResponse('error', 'product_not_added', 500, 'Failed to add product to your cart.'); // Returns an error
            return;
        };

        echo json_encode([ // Returns a success message
            'type' => 'success',
            'status' => 'product_added',
            'code' => 200,
            'message' => 'Product added.',
            'product' => [
                'id' => $productId,
                'quantity' => $quantity
            ]
        ]);

        return;

    } else { // If the product is in the cart

        $updateQuery = "UPDATE cart SET quantity = " . ($quantity) . " WHERE user_id = " . $tokenInfo['user']['id'] . " AND product_id = '$productId'"; // Query to update the product quantity in the cart
        $updateResult = mysqli_query($conn, $updateQuery); // Executes the query

        if (!$updateResult) { // If the query failed
            echo getJSONResponse('error', 'product_not_updated', 500, 'Failed to update product in your cart.'); // Returns an error
            return;
        };

        echo json_encode([ // Returns a success message
            'type' => 'success',
            'status' => 'product_updated',
            'code' => '200',
            'message' => 'Product updated.',
            'product' => [
                'id' => $productId,
                'quantity' => $quantity
            ]
        ]);

        return;

    };

?>