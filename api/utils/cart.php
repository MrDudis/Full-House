<?php

    // Gets the user's cart products ids
    function getUserCart($conn, $userId) {

        $cartQuery = "SELECT * FROM cart WHERE `user_id` = " . $userId; // Gets the user from the database
        $cartResult = mysqli_query($conn, $cartQuery); // Executes the query
    
        $cartProducts = []; // Array of products

        while ($cartRow = mysqli_fetch_array($cartResult)) { // Gets the cart products rows

            $productQuery = "SELECT * FROM products WHERE `id` = " . $cartRow['product_id']; // Gets the product from the database
            $productResult = mysqli_query($conn, $productQuery); // Executes the query
                
            if (mysqli_num_rows($productResult) == 0) { // If the product does not exist
                continue; // Skips the product
            };
    
            // Get one row from the result
            $productRow = mysqli_fetch_array($productResult);
    
            $product = [ // Product object
                'id' => $productRow['id'],
                'quantity' => $cartRow['quantity'],
                'name' => $productRow['name'],
                'description' => $productRow['description'],
                'specs' => $productRow['specs'],
                'price' => $productRow['price'],
                'type' => $productRow['type'],
                'seller' => $productRow['seller'],
                'imagePath' => $productRow['img_path'],
            ];
                
            array_push($cartProducts, $product); // Pushes the product to the array of products
    
        };
    
        return [ // Cart object
            'type' => 'success',
            'status' => 'cart_found',
            'code' => 200,
            'message' => 'The cart was found',
            'products' => $cartProducts,
        ];

    };

?>