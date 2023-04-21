let urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('p');

const typeDict = {
    "cpu": "Processors",
    "gpu": "Graphics Cards",
    "motherboard": "Motherboards",
    "ram": "RAM",
    "storage": "Storage",
    "psu": "Power Supplies",
    "cooler": "Coolers"
};

const loadingCard = `
<div class="related-product-card">
    <div class="related-products-loading-card-image">
            <div class="shimmer loading-card-image"></div>
    </div>
            
    <div class="related-products-loading-card-content">
            <div class="shimmer loading-card-text-large"></div>
            <div class="shimmer loading-card-text-middle"></div>
            <div class="shimmer loading-card-text-small"></div>
            <div class="shimmer loading-card-text-small"></div>
    </div>
</div>
`;

async function getProductDetails() {

    if (!productId) {
        window.location.href = "/listings";
        return;
    };

    let headers = { // Set the headers
        "Content-Type": "application/json"
    };

    let data = { // Set the data
        id: productId
    };

    // Send the request
    let response = await fetch("/api/products/get.php", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data)
    });

    let json = await response.json().catch(() => { }); // Get the response

    if (json?.code == 200) { // Check if the response is successful and if it is, redirect the user to the home page
        
        setProductDetails(json.product);

        if (json.product.inCart) {
            setCartDetails({ id: json.product.id, quantity: json.product.quantity });
        } else {
            setCartDetails(null);
        };

        return;

    } else if (json?.code == 404) { // Check if the response is not found and if it is, redirect the user to the home page

        window.location.href = "/listings";
        return;

    } else {

        return;

    };

}

function setProductDetails(product) {

    // Set the page title and description
    document.title = product.name + " - Full House";
    document.description = product.description;

    // Get product related elements
    let productImage = document.getElementById("product-image");
    let productName = document.getElementById("product-name");
    let productType = document.getElementById("product-type");
    let productSeller = document.getElementById("product-seller");
    let productPriceCutElement = document.getElementById("product-price-cut");
    let productPriceElement = document.getElementById("product-price");
    let productDescription = document.getElementById("product-description");

    // Format the product price

    let productPrice = (product.price / 100).toString().replace(".", ",");
    productPrice = productPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    let priceMultiplier = Math.floor(Math.random() * 6) + 4;

    let extraPrice = ((product.price / 100) + (priceMultiplier * 100)).toString().replace(".", ",");
    extraPrice = extraPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Set the product elements styles and values

    productImage.innerHTML = `<img id="product-image" src="${product.imagePath}" alt="${product.name} Image" width="300" height="300">`;
    productName.innerHTML = product.name;
    productType.innerHTML = typeDict[product.type];
    productSeller.innerHTML = "by " + product.seller;
    productPriceCutElement.innerHTML = "R$ " + extraPrice;
    productPriceElement.innerHTML = "R$ " + productPrice;
    productDescription.innerHTML = product.description;

    // Set the product specifications table

    let lines = product.specs.split(";");
    let rows = [];

    for (let line of lines) {
        line = line.split(":");

        if (line[0] && line[1]) {
            rows.push({ name: line[0], value: line[1] });
        };
    };

    let loadingSpecsTable = document.getElementById("loading-specs-table");
    loadingSpecsTable.style.display = "none";

    let specsTable = document.getElementById("specs-table");
    
    for (let row of rows) {

        let tr = document.createElement("tr");
        tr.classList.add("product-specifications-table-table-tr");

        let thName = document.createElement("th");
        thName.classList.add("product-specifications-table-table-th");

        let tdValue = document.createElement("td");
        tdValue.classList.add("product-specifications-table-table-td");

        thName.innerHTML = row.name;
        tdValue.innerHTML = row.value;

        tr.appendChild(thName);
        tr.appendChild(tdValue);

        specsTable.appendChild(tr);

    };

    return;

}

function setCartDetails(product) {

    // Get cart related elements
    let addToCartButton = document.getElementById("product-button-addtocart");
    let removeFromCartButton = document.getElementById("product-button-removefromcart");
    let loadingButton = document.getElementById("product-button-loading");

    let cartQuantity = document.getElementById("product-quantity-input");

    addToCartButton.onclick = () => { addToCartButtonHandler(product?.id ?? productId) };
    removeFromCartButton.onclick = () => { removeFromCartButtonHandler(product?.id ?? productId) };

    if (product?.id) {
        cartQuantity.onchange = () => { updateCartQuantity(product.id) };
    } else {
        cartQuantity.onchange = () => { };
    };

    loadingButton.style.display = "none";

    if (product) {

        // Set the cart elements styles and values
        addToCartButton.style.display = "none";
        removeFromCartButton.style.display = "block";

        cartQuantity.value = product.quantity;

    } else {

        // Reset the cart elements styles and values
        addToCartButton.style.display = "block";
        removeFromCartButton.style.display = "none";

        cartQuantity.value = 1;

    };

    return;

}

async function getRelatedProducts(divId, amount) {

    // Set loading cards
    let relatedProductsDiv = document.getElementById(divId);
    relatedProductsDiv.innerHTML = "";

    for (let i = 0; i < 10; i++) {  // Set the loading cards (10 cards)
        relatedProductsDiv.innerHTML += loadingCard;
    };

    let headers = { // Set the headers
        "Content-Type": "application/json"
    };

    let data = { // Set the data
        limit: amount
    };

    // Send the request
    let response = await fetch("/api/products/search.php", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data)
    });

    let json = await response.json().catch(() => { }); // Get the response

    if (json?.code == 200) { // Check if the response is successful and if it is, redirect the user to the home page

        let productsList = getProductsDiv(json.products);
        relatedProductsDiv.innerHTML = productsList;

    };

}

function getProductsDiv(products) {

    let productsHtml = "";

    for (let product of products) {

        let priceMultiplier = Math.floor(Math.random() * 6) + 4;

        let productPrice = (product.price / 100).toString().replace(".", ",");
        productPrice = productPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        let extraPrice = ((product.price / 100) + (priceMultiplier * 100)).toString().replace(".", ",");
        extraPrice = extraPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        productsHtml += `
        
        <div class="related-product-card" onclick="fadeOut('/products/view?p=${product.id}', '0.15s')"> <!-- Related Product Card -->

            ${product.inCart ? `
            <div class="related-product-card-incart">
                <div class="related-product-card-incart-box">
                    <p class="related-product-card-incart-text">IN CART</p>
                </div>
            </div>
            ` : ""}

            <div class="related-product-card-image"> <!-- Related Product Card Image -->
                <img src="${product.imagePath}" alt="${product.name}" width="160" height="160"> <!-- Product Image -->
            </div>

            <div class="related-product-card-content"> <!-- Related Product Card Content -->
                <p class="related-product-card-title">${product.name}</p> <!-- Product Title -->
                <p class="related-product-card-type">in ${typeDict[product.type]}</p> <!-- Product Type -->
                <p class="related-product-card-cut-price">R$ ${extraPrice}</p> <!-- Cut Product Price -->
                <p class="related-product-card-price">R$ ${productPrice}</p> <!-- Product Price -->
            </div>
        </div>

        `;

    }

    return productsHtml;

};

async function addToCartButtonHandler(productId) {

    let addToCartButton = document.getElementById("product-button-addtocart");

    addToCartButton.disabled = true;
    
    let response = await addToCart(productId);
    
    if (response?.code == 401) {
        return fadeOut("/auth/signin?redirect_url=/products/view?p=" + productId, "0.15s");
    };

    if (response?.code == 200) {
        return window.location.reload();
    };

    addToCartButton.disabled = false;
    
};

async function removeFromCartButtonHandler(productId) {

    let removeFromCartButton = document.getElementById("product-button-removefromcart");

    removeFromCartButton.disabled = true;
    
    let response = await removeFromCart(productId);
    
    if (response?.code == 401) {
        return fadeOut("/auth/signin?redirect_url=/products/view?p=" + productId, "0.15s");
    };

    if (response?.code == 200) {
        return window.location.reload();
    };

    removeFromCartButton.disabled = false;
    
};