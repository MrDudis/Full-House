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

    $query = $_POST["query"] ?? ""; // Gets the search query from the POST data
    $type = $_POST["type"] ?? "all"; // Gets the search type from the POST data
    $order = $_POST["order"] ?? ""; // Gets the order type from the POST data
    $limit = $_POST["limit"] ?? 20; // Gets the search limit from the POST data

    // Sanitizes the search query and the search type

    $query = preg_replace('#[^a-z 0-9?!]#i', '', $query);
    $type = preg_replace('#[^a-z 0-9?!]#i', '', $type);

    if ($limit > 50) { // If the limit is greater than 50
        $limit = 50; // Sets the limit to 50
    };

    $searchQuery = "SELECT * FROM products WHERE (name LIKE '%$query%' OR description LIKE '%$query%')"; // Query to get the products

    if ($type != "all") { // If the search type is not all
        $searchQuery .= " AND type = '$type'"; // Adds the type to the query
    };

    if ($order == "price") {
        $searchQuery .= " ORDER BY price ASC";
    } else if ($order == "name") {
        $searchQuery .= " ORDER BY name ASC";
    } else if ($order == "new") {
        $searchQuery .= " ORDER BY cast(created_date as INT) DESC";
    } else {
        $searchQuery .= " ORDER BY RAND()";
    };

    $cartIds = []; // Array to store the ids of the products in the cart

    // Checks if the user is logged in and if the products in their cart

    if ($tokenInfo['code'] == 200) {
        $userCart = getUserCart($conn, $tokenInfo['user']['id']); // Gets the user cart
        $cartIds = array_column($userCart['products'], 'id');
    };
    
    $productResults = mysqli_query($conn, $searchQuery); // Executes the query

    $products = []; // Array to store the products

    while ($productRow = mysqli_fetch_array($productResults)) { // Get the products row

        if (count($products) >= $limit) { // If the limit is reached
            break; // Breaks the loop
        };

        $product = [ // Product object
            'id' => $productRow['id'],
            'name' => $productRow['name'],
            'description' => $productRow['description'],
            'specs' => $productRow['specs'],
            'price' => $productRow['price'],
            'type' => $productRow['type'],
            'seller' => $productRow['seller'],
            'imagePath' => $productRow['img_path'],
            'inCart' => in_array($productRow['id'], $cartIds)
        ];

        array_push($products, $product); // Pushes the product to the products array

    };

    // Create responde object
    $response = [
        'type' => 'success',
        'status' => 'products_found',
        'code' => 200,
        'message' => 'Products found.',
        'products' => $products
    ];

    echo json_encode($response); // Returns the products array as a JSON string
    return;

?>