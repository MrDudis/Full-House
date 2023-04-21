<?php

    include "../db.php"; // Database connection
    include "../utils/functions.php"; // Utility functions
    include "../utils/cart.php"; // Cart functions
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

    // Gets the cart details from the POST data
    $productsId = $_POST["productsId"];
    $totalPrice = $_POST["totalPrice"];

    $userCart = getUserCart($conn, $tokenInfo['user']['id']); // Gets the user's cart

    // Check to see if the user cart matches the cart details from the POST data

    if (count($userCart['products']) != count($productsId)) { // If the number of products doesn't match
        echo getJSONResponse('error', 'invalid_cart', 400, 'Your cart has been modified since you started the checkout process. Review your cart and try again.'); // Returns an error
        return;
    };

    $totalCartPrice = 0; // Total cart price

    foreach ($userCart['products'] as $product) { // For each product in the user's cart
        $totalCartPrice += $product['price'] * $product['quantity']; // Adds the product price to the total cart price

        if (!in_array($product['id'], $productsId)) { // If the product id is not in the products id array
            echo getJSONResponse('error', 'invalid_cart', 400, 'Your cart has been modified since you started the checkout process. Review your cart and try again.'); // Returns an error
            return;
        };
    };

    if ($totalCartPrice != $totalPrice) { // If the total cart price doesn't match the total price from the POST data
        echo getJSONResponse('error', 'invalid_cart', 400, 'Your cart has been modified since you started the checkout process. Review your cart and try again.'); // Returns an error
        return;
    };

    // If the user cart matches the cart details from the POST data, continue the checkout process

    // Get the payment details from the POST data
    $cardNumber = $_POST["payment"]["cardNumber"];
    $cardCVC = $_POST["payment"]["cardCVC"];
    $cardHolder = $_POST["payment"]["cardHolderName"];
    $cardExpiry = $_POST["payment"]["cardExpiry"];
    
    // Sanitize the payment details

    $cardNumber = preg_replace('/[^0-9]/', '', $cardNumber);
    $cardCVC = preg_replace('/[^0-9]/', '', $cardCVC);

    // Validate the payment details

    if (strlen($cardNumber) != 16) { // If the card number is not 16 characters long
        echo getJSONResponse('error', 'invalid_card_number', 400, 'The card number is invalid.'); // Returns an error
        return;
    };

    if (strlen($cardHolder) < 2 || preg_match('/[\'"^£$%&*;:()}{#~?<>,|=_¬]/', $cardHolder)) { // If the card holder name is less than 2 characters long
        echo getJSONResponse('error', 'invalid_card_holder_name', 400, 'The card holder name is invalid.'); // Returns an error
        return;
    };

    if (strlen($cardExpiry) != 5 || preg_match('/[\'"^£$%&*;:()}{#~?<>,|=_¬]/', $cardExpiry)) { // If the card expiration date is not 5 characters long
        echo getJSONResponse('error', 'invalid_card_expiration_date', 400, 'The card expiration date is invalid.'); // Returns an error
        return;
    };

    if (strlen($cardCVC) != 3) { // If the card cvc is not 3 characters long
        echo getJSONResponse('error', 'invalid_card_cvc', 400, 'The card CVC is invalid.'); // Returns an error
        return;
    };

    // If the payment details are valid, continue the checkout process

    // Get the shipping details from the POST data
    $streetAddress = $_POST["shipping"]["streetAddress"];
    $complement = $_POST["shipping"]["complement"] ?? ""; // Optional
    $postalCode = $_POST["shipping"]["postalCode"];
    $city = $_POST["shipping"]["city"];
    $state = $_POST["shipping"]["state"];
    $country = $_POST["shipping"]["country"];

    // Sanitize the shipping details

    $streetAddress = preg_replace('/[\'"^£$%&*;:()}{#~?<>,|=_¬]/', '', $streetAddress);
    $complement = preg_replace('/[\'"^£$%&*;:()}{#~?<>,|=_¬]/', '', $complement);
    $postalCode = preg_replace('/[^0-9]/', '', $postalCode);
    $city = preg_replace('/[\'"^£$%&*;:()}{#~?<>,|=_¬0-9]/', '', $city);
    $state = preg_replace('/[\'"^£$%&*;:()}{#~?<>,|=_¬0-9]/', '', $state);
    $country = preg_replace('/[\'"^£$%&*;:()}{#~?<>,|=_¬0-9]/', '', $country);

    // Validate the shipping details

    if (strlen($streetAddress) < 8 || strlen($streetAddress) > 256) { // If the street address is less than 8 characters long or more than 256 characters long
        echo getJSONResponse('error', 'invalid_street_address', 400, 'Invalid street address.'); // Returns an error
        return;
    };

    if (strlen($complement) > 128) { // If the complement is more than 128 characters long
        echo getJSONResponse('error', 'invalid_complement', 400, 'Invalid complement.'); // Returns an error
        return;
    };

    if (strlen($postalCode) < 6 || strlen($city) > 16) { // If the postal code is less than 6 characters long or more than 16 characters long
        echo getJSONResponse('error', 'invalid_postal_code', 400, 'Invalid postal code.'); // Returns an error
        return;
    };

    if (strlen($city) < 3 || strlen($city) > 128) { // If the city is less than 3 characters long or more than 128 characters long
        echo getJSONResponse('error', 'invalid_city', 400, 'Invalid city.'); // Returns an error
        return;
    };

    if (strlen($state) < 3 || strlen($state) > 128) { // If the state is less than 3 characters long or more than 128 characters long
        echo getJSONResponse('error', 'invalid_state', 400, 'Invalid state.'); // Returns an error
        return;
    };

    if (strlen($country) < 3 || strlen($country) > 128) { // If the country is less than 3 characters long or more than 128 characters long
        echo getJSONResponse('error', 'invalid_country', 400, 'Invalid country.'); // Returns an error
        return;
    };

    // If the shipping details are valid, continue the checkout process

    // Create the order
    $orderQuery = "INSERT INTO orders (user_id, price, card_number, card_holder, card_expiry, card_cvc, street_address, complement, postal_code, city, state, country) 
    VALUES ('" . $tokenInfo['user']['id'] . "', '$totalCartPrice', '$cardNumber', '$cardHolder', '$cardExpiry', '$cardCVC', '$streetAddress', '$complement', '$postalCode', '$city', '$state', '$country')";

    $orderResult = mysqli_query($conn, $orderQuery);

    if (!$orderResult) { // If the order could not be created
        echo getJSONResponse('error', 'order_creation_failed', 500, 'The order could not be created. Try again later.'); // Returns an error
        return;
    };

    // Get the order ID
    $orderID = mysqli_insert_id($conn);
    
    // Create the order items
    foreach ($userCart['products'] as $cartItem) {
        $orderItemQuery = "INSERT INTO orderItems (order_id, product_id, price, quantity) 
        VALUES ('$orderID', '" . $cartItem['id'] . "', '" . $cartItem['price'] . "', '" . $cartItem['quantity'] . "')";
        
        $orderItemResult = mysqli_query($conn, $orderItemQuery);
    };

    // Delete the cart items

    $deleteCartQuery = "DELETE FROM cart WHERE user_id = '" . $tokenInfo['user']['id'] . "'";
    $deleteCartResult = mysqli_query($conn, $deleteCartQuery);
    
    // If the order was created successfully, return the order ID

    echo json_encode([
        'type' => 'success',
        'status' => 'order_created',
        'code' => 200,
        'message' => 'The order was created successfully.',
        'orderId' => $orderID
    ]);

    return;

?>