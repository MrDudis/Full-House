
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
<div class="search-results-card">
    <div class="search-results-loading-card-image">
            <div class="shimmer loading-card-image"></div>
    </div>
            
    <div class="search-results-loading-card-content">
            <div class="shimmer loading-card-text-large"></div>
            <div class="shimmer loading-card-text-middle"></div>
            <div class="shimmer loading-card-text-small"></div>
            <div class="shimmer loading-card-text-small"></div>
    </div>
</div>
`;

async function getSearchResults(divId, amount) {

    // Get the search query and the type of search

    const urlParams = new URLSearchParams(window.location.search);

    const queryString = urlParams.get('query');
    const type = urlParams.get('type');

    if (!queryString && !type) { // Check if the query string or type are valid
        window.location.href = "/listings";
        return;
    };

    // Set the searching text and input values with query

    let searchTitle = document.getElementById("search-results-category-title-text");
        
    if (queryString) {
        searchTitle.innerHTML = `Search results for "${queryString}"...`;
    } else {
        searchTitle.innerHTML = `Search results for ${typeDict[type]}...`;
    };

    let searchInput = document.getElementById("navbar-search-input");
    let searchInputMobile = document.getElementById("navbar-mobile-search-input");

    searchInput.value = queryString;
    searchInputMobile.value = queryString;

    // Set the loading cards

    // Gets the search results div and clears it
    let searchProductsDiv = document.getElementById(divId);
    searchProductsDiv.innerHTML = "";

    for (let i = 0; i < 20; i++) { // Set the loading cards (20 cards)
        searchProductsDiv.innerHTML += loadingCard;
    };

    // Get the search results

    let headers = { // Set the headers
        "Content-Type": "application/json"
    };

    let data = { // Set the data
        query: queryString,
        type: type ?? "all",
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

        setProductsDiv(divId, json.products);

        if (json.products.length == 0) {
            let noResultsDiv = document.getElementById("search-no-results");

            noResultsDiv.style.display = "block";
            searchProductsDiv.style.display = "none";
        };

    } else {

        let noResultsDiv = document.getElementById("search-no-results");

        noResultsDiv.style.display = "block";
        searchProductsDiv.style.display = "none";

    };

    return;

}

function setProductsDiv(divId, products) {

    let searchProductsDiv = document.getElementById(divId);
    searchProductsDiv.innerHTML = "";

    for (let product of products) {

        let priceMultiplier = Math.floor(Math.random() * 6) + 4;

        let productPrice = (product.price / 100).toString().replace(".", ",");
        productPrice = productPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        let extraPrice = ((product.price / 100) + (priceMultiplier * 100)).toString().replace(".", ",");
        extraPrice = extraPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        searchProductsDiv.innerHTML += `
        
        <div class="search-results-card" onclick="fadeOut('/products/view?p=${product.id}', '0.15s')"> <!-- Search Result Product Card -->

            ${product.inCart ? `
            <div class="search-results-card-incart">
                <div class="search-results-card-incart-box">
                    <p class="search-results-card-incart-text">IN CART</p>
                </div>
            </div>
            ` : ""}

            <div class="search-results-card-image"> <!-- Search Result Product Card Image -->
                <img src="${product.imagePath}" alt="${product.name}" width="160" height="160"> <!-- Product Image -->
            </div>

            <div class="search-results-card-content"> <!-- Search Result Product Card Content -->
                <p class="search-results-card-title">${product.name}</p> <!-- Product Title -->
                <p class="search-results-card-type">in ${typeDict[product.type]}</p> <!-- Product Type -->
                <p class="search-results-card-cut-price">R$ ${extraPrice}</p> <!-- Cut Product Price -->
                <p class="search-results-card-price">R$ ${productPrice}</p> <!-- Product Price -->
            </div>
        </div>

        `;

    }

    return;

}