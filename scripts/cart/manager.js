async function addToCart(productId) {

    // Get quantity input element
    let quantityInput = document.getElementById("product-quantity-input");

    // Get the quantity
    let quantity = parseInt(quantityInput?.value) == NaN ? 1 : parseInt(quantityInput.value);

    // Check if the quantity is valid
    if (quantity < 1) {
        quantity = 1;
    };

    if (quantity > 50) {
        quantity = 50;
    };

    let headers = { // Set the headers
        "Content-Type": "application/json"
    };

    let data = { // Set the data
        productId: productId,
        quantity: quantity
    };

    // Send the request
    let response = await fetch("/api/cart/update.php", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data)
    });

    let json = await response.json().catch(() => { }); // Get the response

    if (!json?.code) { // Check if the response is valid
        return false;
    };

    return json;

}

async function updateCartQuantity(productId, quantityInputId = "product-quantity-input") {

    if (!productId) {
        return;
    };

    // Get quantity input element
    let quantityInput = document.getElementById(quantityInputId);

    // Get the quantity
    let quantity = parseInt(quantityInput?.value) == NaN ? 1 : parseInt(quantityInput.value);

    // Check if the quantity is valid
    if (quantity < 1) {
        quantity = 1;
    };

    if (quantity > 50) {
        quantity = 50;
    };

    let headers = { // Set the headers
        "Content-Type": "application/json"
    };

    let data = { // Set the data
        productId: productId,
        quantity: quantity
    };

    // Send the request
    let response = await fetch("/api/cart/update.php", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data)
    });

    let json = await response.json().catch(() => { }); // Get the response

    if (!json?.code) { // Check if the response is valid
        return;
    };

    if (json.code == 401) {
        fadeOut("/auth/signin?redirect_url=/products/view?p=" + productId, "0.15s");
        return;
    };

    if (json.code == 200) { // Check if the response is successful and if it is, redirect the user to the home page

        if (typeof setCartDetails === "function") {
            setCartDetails(json.product);
        } else if (typeof updateCartCache === "function") {
            updateCartCache(json.product);
        } else {
            window.location.reload();
        }; 

    };

    return;

}

function productQuantityModifierButton(amount, quantityInputId = "product-quantity-input") {

    let quantityInput = document.getElementById(quantityInputId);

    let quantity = parseInt(quantityInput?.value) == NaN ? 1 : parseInt(quantityInput.value);
    quantity += amount;

    if (quantity < 1) { return; };
    if (quantity > 50) { return; };

    quantityInput.value = quantity;
    quantityInput.onchange();
    
    return;

};

async function removeFromCart(productId) {

    let headers = { // Set the headers
        "Content-Type": "application/json"
    };

    let data = { // Set the data
        productId: productId
    };

    // Send the request
    let response = await fetch("/api/cart/remove.php", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data)
    });

    let json = await response.json().catch(() => { }); // Get the response

    if (!json?.code) { // Check if the response is valid
        return false;
    };

    return json;

}