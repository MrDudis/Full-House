let cartCache = null;

async function getCartProducts() {
    
    // Send the request
    let response = await fetch("/api/cart/get.php", {
        method: "GET"
    });

    let json = await response.json().catch(() => { }); // Get the response

    if (json?.code == 200) { // Check if the response is successful and if it is, redirect the user to the home page

        // Get the user's data
        let cart = json;
        cartCache = cart.products;

        setCartInformation(cart.products);
        
    } else {

        setCartInformation(null);
        
    };

    return;

};

function updateCartCache(cartProduct) {

    if (!cartProduct) { return; };
    
    let cartProductIndex = cartCache?.findIndex((cartProductCache) => {
        return cartProductCache.id == cartProduct.id;
    });

    if (cartProductIndex == -1) { return; };

    cartCache[cartProductIndex].quantity = cartProduct.quantity;

    setCartInformation(cartCache);
    return;
    
};

function removeFromCartCache(productId) {

    if (!productId) { return; };
    
    let cartProductIndex = cartCache?.findIndex((cartProductCache) => {
        return cartProductCache.id == productId;
    });

    if (cartProductIndex == -1) { return; };

    cartCache.splice(cartProductIndex, 1);

    setCartInformation(cartCache);
    return;
    
}

function setCartInformation(products) {

    // Get the cart products div
    let cartProducts = document.getElementById("cart-products");
    let cartSummary = document.getElementById("cart-list-products");

    let cartTotalPrice = document.getElementById("cart-list-checkout-total-price");
    let checkoutButton = document.getElementById("checkout-button");

    // Clear the cart products div
    cartProducts.innerHTML = "";
    cartSummary.innerHTML = "";

    // If products is null, get the products from the cache and if there is no cache, return
    if (!products && cartCache) { products = cartCache; } else if (!products && !cartCache) { 
        
        cartProducts.innerHTML = `
                <div class="cart-product">

                    <div class="cart-product-details">
        
                        <div class="cart-product-text">
                            <p class="cart-message-title" style="margin-top: 10px;">An error occured while loading your cart.</p>
                            <p class="cart-message-description" style="margin-bottom: 10px;">Try again later...</p>
                        </div>
        
                    </div>
        
        
                </div>
        `;

        cartSummary.innerHTML = `
                <div class="cart-list-product">
                    <h2 class="cart-list-product-name"></h2>
                    <h2 class="cart-list-product-price">Failed to load your products.</h2>
                </div>
        `;

        cartTotalPrice.innerHTML = `R$ --`;
        checkoutButton.disabled = true;

        return;

    };

    if (products.length == 0) { // Check if the user has products in the cart

        cartProducts.innerHTML = `
                <div class="cart-product">

                    <div class="cart-product-details">
        
                        <div class="cart-product-text">
                            <p class="cart-message-title" style="margin-top: 10px;">Your cart is empty.</p>
                            <p class="cart-message-description" style="margin-bottom: 10px;">Visit our products page and search for the perfect products for you!</p>
                        </div>
        
                    </div>
        
        
                </div>
        `;

        cartSummary.innerHTML = `
                <div class="cart-list-product">
                    <h2 class="cart-list-product-name"></h2>
                    <h2 class="cart-list-product-price">Your cart is empty.</h2>
                </div>
        `;

        cartTotalPrice.innerHTML = `R$ --`;
        checkoutButton.disabled = true;

        return;

    };

    // Create a variable to store the cart products html
    let cartProductsHtml = "";
    let cartSummaryHtml = "";

    let totalPrice = 0;

    // Loop through the products
    for (let product of products) {

        totalPrice += (parseInt(product.price) * parseInt(product.quantity));

        let productPrice = (parseInt(product.price) / 100).toString().replace(".", ",");
        productPrice = productPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        cartProductsHtml += `

        <div class="cart-product ${product.disabled ? 'cart-product-disabled' : ''}" id="cart-product-id-${product.id}"> <!-- Replicable Div for multiple products (the actual box) -->

            <div class="cart-product-details"> <!-- Right Side DIV -->

                <div class="cart-product-image">
                    <img src="${product.imagePath}" alt="${product.name} Image" width="100" height="100">
                </div>

                <div class="cart-product-text">
                    <p class="cart-product-name" onclick="fadeOut('/products/view?p=${product.id}', '0.15s')">${product.name}</p>
                    <p class="cart-product-price">R$ ${productPrice}</p>
                </div>

            </div>

            <div class="cart-product-manager"> <!-- Left Side DIV -->

                <div class="cart-product-quantity">
                    <h2 class="cart-product-quantity-text">Quantity</h2>
                    <button class="cart-product-quantity-button" onclick="productQuantityModifierButton(-1, \`product-id-${product.id}-quantity-input\`)">-</button>
                    <input class="cart-product-quantity-input" id="product-id-${product.id}-quantity-input" type="text" value="${product.quantity}" onchange="updateCartQuantity(${product.id}, \`product-id-${product.id}-quantity-input\`)">
                    <button class="cart-product-quantity-button" onclick="productQuantityModifierButton(+1, \`product-id-${product.id}-quantity-input\`)">+</button>
                </div>

                <div class="cart-product-remove">
                    <button class="cart-product-remove-button" onclick="removeFromCartButtonHandler(${product.id})"><img class="cart-product-remove-image" src="/images/icons/remove.png" alt="Remove" width="25" height="25"></button>
                </div>

            </div>

        </div>

        `;

        let fullProductPrice = ((parseInt(product.price) * parseInt(product.quantity)) / 100).toString().replace(".", ",");
        fullProductPrice = fullProductPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        cartSummaryHtml += `

        <div class="cart-list-product">
            <h2 class="cart-list-product-name">${product.name}${parseInt(product.quantity) == 1 ? "" : ` (${product.quantity}x)`}</h2>
            <h2 class="cart-list-product-price">R$ ${fullProductPrice}</h2>
        </div>

        `;

    };

    cartProducts.innerHTML = cartProductsHtml; // Set the cart products div html
    cartSummary.innerHTML = cartSummaryHtml; // Set the cart summary div html

    let totalProductPrice = (totalPrice / 100).toString().replace(".", ",");
    totalProductPrice = totalProductPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    cartTotalPrice.innerHTML = `R$ ${totalProductPrice}`;

    checkoutButton.disabled = false;

    return;

};

async function removeFromCartButtonHandler(productId) {

    // Get the cart product div
    let removingProductDiv = document.getElementById(`cart-product-id-${productId}`);

    // Get the product index on the cache
    let cartProductIndex = cartCache?.findIndex((cartProductCache) => {
        return cartProductCache.id == productId;
    });

    // If the product is on the cache, set it as disabled
    if (cartProductIndex != -1) { cartCache[cartProductIndex].disabled = true; };

    // Set the product div as disabled
    removingProductDiv.classList.add("cart-product-disabled");

    // Send the request to remove the product from the cart
    let response = await removeFromCart(productId);
    
    if (response?.code == 401) { // If the user is not logged in, redirect to the login page
        return fadeOut("/auth/signin?redirect_url=/me/cart", "0.15s");
    };

    if (response?.code == 200) { // If the product was removed successfully, update the cart
        removeFromCartCache(productId);
        getNavbarProductsCount();

        return;
    };

    // If the product was not removed successfully, set the product div as enabled

    // Update the product index (in case it was changed)
    cartProductIndex = cartCache?.findIndex((cartProductCache) => {
        return cartProductCache.id == productId;
    });

    // If the product is on the cache, set it as enabled
    if (cartProductIndex != -1) { cartCache[cartProductIndex].disabled = false; };

    // Set the product div as enabled
    removingProductDiv.classList.remove("cart-product-disabled");

    return;

};