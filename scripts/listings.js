const typeDict = {
    "cpu": "Processors",
    "gpu": "Graphics Cards",
    "motherboard": "Motherboards",
    "ram": "RAM",
    "storage": "Storage",
    "psu": "Power Supplies",
    "cooler": "Coolers"
};

const categoryDivs = [
    {
        title: "New Arrivals",
        divId: "products-div-new-arrivals",
        amount: 20,
        type: "all",
        order: "new"
    },
    {
        title: "Most Popular",
        divId: "products-div-most-popular",
        amount: 20,
        type: "all",
        order: "popular"
    },
    {
        title: "Processors",
        divId: "products-div-cpu",
        amount: 20,
        type: "cpu",
        order: "random"
    },
    {
        title: "Graphics Cards",
        divId: "products-div-gpu",
        amount: 20,
        type: "gpu",
        order: "random"
    },
    {
        title: "Motherboards",
        divId: "products-div-motherboards",
        amount: 20,
        type: "motherboard",
        order: "random"
    },
];

const loadingCard = `
<div class="featured-product-card">
    <div class="featured-loading-card-image">
            <div class="shimmer loading-card-image"></div>
    </div>
            
    <div class="featured-loading-card-content">
            <div class="shimmer loading-card-text-large"></div>
            <div class="shimmer loading-card-text-middle"></div>
            <div class="shimmer loading-card-text-small"></div>
            <div class="shimmer loading-card-text-small"></div>
    </div>
</div>
`;

async function loadListsOfProducts(divId) {

    // Get the main products div
    let allProductsDiv = document.getElementById(divId);
    if (!allProductsDiv) { return; }; // Check if the div exists

    // Clears the div
    allProductsDiv.innerHTML = "";

    // For all category divs to load, create loading cards

    for (let categoryDiv of categoryDivs) {

        let loadingCards = "";

        for (let i = 0; i < categoryDiv.amount; i++) {
            loadingCards += loadingCard;
        };

        allProductsDiv.innerHTML += `
        
        <div class="featured-products-category-div">

            <div class="featured-products-category-title"> <!-- Featured Products Category Title -->
                <p class="featured-products-category-title-text">${categoryDiv.title}</p>
            </div>

            <div class="featured-products-category-flexbox" id="${categoryDiv.divId}"> <!-- Featured Products Category Flexbox -->
                ${loadingCards}
            </div>

        </div>
        
        `;

    };

    // Load the products using the filters

    for (let categoryDiv of categoryDivs) {

        getProducts(categoryDiv.amount, categoryDiv.type, categoryDiv.order).then(products => { // Get the products

            let categoryProductsDiv = document.getElementById(categoryDiv.divId); // Get the div to put the products in

            if (!products) { // If there are no products, show error message

                categoryProductsDiv.innerHTML = `
                    <div class="featured-products-category-error">
                        <p class="featured-products-category-error-title">An error occurred while loading the products.</p>
                        <p class="featured-products-category-error-description">Try again later...</p>
                        <p class="featured-products-category-error-code">ERR_CODE: 500</p>
                    </div>
                `;

                return; 

            } else { // If there are products, show them

                categoryProductsDiv.innerHTML = products;

            };

        }).catch(() => { });

    };

    return;

}

async function getProducts(amount, type, order) {

    let headers = { // Set the headers
        "Content-Type": "application/json"
    };

    let data = { // Set the data
        type: type ?? "all",
        order: order ?? "random",
        limit: amount
    };

    // Send the request
    let response = await fetch("/api/products/search.php", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data)
    });

    let json = await response.json().catch(() => { }); // Get the response
    
    if (!json?.code) { // Check if the response is valid
        return false;
    };

    if (json.code == 200) { // Check if the response is successful and if it is, redirect the user to the home page

        if (json.products?.length != 0) {
            return getProductsDiv(json.products); // Return the products div
        } else {

            return `
            <div class="featured-products-category-error">
                <p class="featured-products-category-error-title">No products found.</p>
                <p class="featured-products-category-error-code" style="text-align: center;">ERR_CODE: 404</p>
            </div>
            `; // Return the error div

        };

    };

    return false;

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
        
        <div class="featured-product-card" onclick="fadeOut('/products/view?p=${product.id}', '0.15s')"> <!-- Featured Product Card -->

            ${product.inCart ? `
            <div class="featured-product-card-incart">
                <div class="featured-product-card-incart-box">
                    <p class="featured-product-card-incart-text">IN CART</p>
                </div>
            </div>
            ` : ""}

            <div class="featured-product-card-image"> <!-- Featured Product Card Image -->
                <img src="${product.imagePath}" alt="${product.name}" width="160" height="160"> <!-- Product Image -->
            </div>

            <div class="featured-product-card-content"> <!-- Featured Product Card Content -->
                <p class="featured-product-card-title">${product.name}</p> <!-- Product Title -->
                <p class="featured-product-card-type">in ${typeDict[product.type]}</p> <!-- Product Type -->
                <p class="featured-product-card-cut-price">R$ ${extraPrice}</p> <!-- Cut Product Price -->
                <p class="featured-product-card-price">R$ ${productPrice}</p> <!-- Product Price -->
            </div>
        </div>

        `;

    }

    return productsHtml;

}