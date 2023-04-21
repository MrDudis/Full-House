let cartProductsId = [];
let productsPrice = 0;

async function getCartProducts() {
    
    // Send the request
    let response = await fetch("/api/cart/get.php", {
        method: "GET"
    });

    let json = await response.json().catch(() => { }); // Get the response

    if (json?.code == 200 && json?.products?.length != 0) { // Check if the response is successful and if it is, redirect the user to the home page

        // Get the user's data
        let cart = json;
        
        cartProductsId = cart.products.map(product => product.id);

        setCartInformation(cart.products);
        
    } else {

        window.location.href = "/me/cart"; // Redirect the user to the cart page because the cart is empty or it failed to load and you can't checkout with an empty cart
        
    };

    return;

};

function setCartInformation(products) {

    // Get the cart products div
    let cartSummary = document.getElementById("cart-list-products");

    let cartTotalPrice = document.getElementById("cart-list-checkout-total-price");
    let checkoutTotalPrice = document.getElementById("order-checkout-total-price");

    // Clear the cart products div
    cartSummary.innerHTML = "";

    let totalPrice = 0;

    // Loop through the products
    for (let product of products) {

        totalPrice += (parseInt(product.price) * parseInt(product.quantity));

        let fullProductPrice = ((parseInt(product.price) * parseInt(product.quantity)) / 100).toString().replace(".", ",");
        fullProductPrice = fullProductPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        cartSummary.innerHTML += `

        <div class="cart-list-product">
            <h2 class="cart-list-product-name">${product.name}${parseInt(product.quantity) == 1 ? "" : ` (${product.quantity}x)`}</h2>
            <h2 class="cart-list-product-price">R$ ${fullProductPrice}</h2>
        </div>

        `;

    };

    productsPrice = 0;
    productsPrice += totalPrice;

    let totalProductPrice = (totalPrice / 100).toString().replace(".", ",");
    totalProductPrice = totalProductPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    cartTotalPrice.innerHTML = `R$ ${totalProductPrice}`;
    checkoutTotalPrice.innerHTML = `R$ ${totalProductPrice}`;

    return;

};

async function submitCheckout() {
    emitError(""); // Clears the error message

    // Get the form elements

    // Get the form button
    let submitButton = document.getElementById("checkout-section-complete-button");

    submitButton.disabled = true;

    // Get payment details
    let cardNumber = document.getElementById("card-number").value;
    let cardCVC = document.getElementById("cvc").value;
    let cardHolderName = document.getElementById("card-holder").value;
    let cardExpiry = document.getElementById("expiry-date").value;

    // Get shipping details
    let streetAddress = document.getElementById("street-address").value;
    let complement = document.getElementById("complement").value;
    let postalCode = document.getElementById("postal-code").value;
    let city = document.getElementById("city").value;
    let state = document.getElementById("state").value;
    let country = document.getElementById("country").value;

    if (cardNumber == "" || cardCVC == "" || cardHolderName == "" || cardExpiry == "" || streetAddress == "" || postalCode == "" || city == "" || state == "" || country == "") {

        submitButton.disabled = false;
        return emitError("All fields are required.");

    };

    let headers = { // Set the headers
        "Content-Type": "application/json"
    };

    let data = { // Set the data
        "productsId": cartProductsId,
        "totalPrice": productsPrice,
        "payment": {
            cardNumber,
            cardCVC,
            cardHolderName,
            cardExpiry
        },
        "shipping": {
            streetAddress,
            complement,
            postalCode,
            city,
            state,
            country
        }
    };

    // Send the request
    let response = await fetch("/api/cart/checkout.php", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data)
    });

    let json = await response.json().catch(() => {}); // Get the response

    if (!json?.code) { // Check if the response is valid
        submitButton.disabled = false;
        return emitError("Internal server error. Try again later.");
    };

    if (json.code == 200) { // Check if the response is successful and if it is, redirect the user to the home page

        setTimeout(() => {
            let checkoutSuccess = document.getElementById("checkout-success");
            checkoutSuccess.style.display = "flex";

            submitButton.disabled = false;
        }, 2500);

        return;

    } else {
        submitButton.disabled = false;
        return emitError(json?.message ?? "Internal server error. Try again later."); // If the response is not successful, display the error message
    };

};

function emitError(message) {

    // Get the error box and the error message
    let errorBox = document.getElementById("checkout-form-error-div");
    let error = document.getElementById("checkout-form-error-message");

    // Hide the error box
    errorBox.style.display = "none";
    errorBox.style.visibility = "hidden";

    // Set the error message
    error.innerHTML = message;

    // Show the error box with a fade in effect
    setTimeout(() => {

        if (message != "") { // Check if the error message is empty and if it is not, show the error box
            errorBox.style.display = "block";
            errorBox.style.visibility = "visible";

            errorBox.style.animation = "fadeIn ease 1s";
            errorBox.style["animation-fill-mode"] = "forwards";
        };

    }, 200);

    return;
};