<?php

    include "../db.php"; // Database connection
    include "../utils/functions.php"; // Utility functions
    include "../utils/cart.php"; // Cart functions
    include "../utils/authentication.php"; // Authentication functions

?>

<?php

    $token = $_COOKIE["_csfr"] ?? ""; // Gets the token from the cookies
    $tokenInfo = validateAuthentication($conn, $token); // Validates the token

    $_POST = json_decode(file_get_contents("php://input"), true); // Gets the POST data

    $id = $_POST["id"] ?? ""; // Gets the id of the product

    $id = preg_replace('#[^a-z 0-9?!]#i', '', $id); // Removes special characters from the id

    $productQuery = "SELECT * FROM products WHERE id = '$id'"; // Query to get the product
    $result = mysqli_query($conn, $productQuery); // Executes the query

    $productRow = mysqli_fetch_array($result); // Get the product row

    if (!$productRow) { // If the product does not exist

        echo json_encode([ // Returns an error
            'type' => 'error',
            'status' => 'product_not_found',
            'code' => 404,
            'message' => 'The product was not found',
        ]);

        return;
        
    };

    $productResponse = [ // Returns the product
        'type' => 'success',
        'status' => 'product_found',
        'code' => 200,
        'message' => 'The product was found',
        'product' => [
            'id' => $productRow['id'],
            'name' => $productRow['name'],
            'description' => $productRow['description'],
            'specs' => $productRow['specs'],
            'price' => $productRow['price'],
            'type' => $productRow['type'],
            'seller' => $productRow['seller'],
            'imagePath' => $productRow['img_path']
        ]
    ];

    // Checks if the user is logged in and if the product is in the cart

    if ($tokenInfo['code'] == 200) {
        $userCart = getUserCart($conn, $tokenInfo['user']['id']); // Gets the user cart
        
        if (in_array($productRow['id'], array_column($userCart['products'], 'id'))) {
            $productResponse['product']['inCart'] = true;
            $productResponse['product']['quantity'] = $userCart['products'][array_search($productRow['id'], array_column($userCart['products'], 'id'))]['quantity'];
        } else {
            $productResponse['product']['inCart'] = false;
        };
    };

    echo json_encode($productResponse); // Returns the product
    return;

?>