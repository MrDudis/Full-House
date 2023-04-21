let signedin = false;
let userInformation = {};

async function getNavbarSignin() { // for navbar

    // Send the request
    let response = await fetch("/api/auth/account.php", {
        method: "GET"
    });

    let json = await response.json().catch(() => { }); // Get the response

    if (json?.code == 200) { // Check if the response is successful and if it is, redirect the user to the home page

        // Get the user's data
        let user = json.user;

        signedin = true;
        userInformation = user;

        setNavbarInformation(user);
        getNavbarProductsCount();

    } else if (json?.code == 401) { // Check if the response is unauthorized

        signedin = false;
        userInformation = {};

        setNavbarInformation(null);
        setNavbarProductsCount(0);
    };

    return;

}

function setNavbarInformation(user) {

    // Get the navbar elements
    let loadingNavbar = document.getElementById("navbar-account-loading");
    let loadingMobileNavbar = document.getElementById("navbar-mobile-account-loading");

    let signedOffNavbar = document.getElementById("navbar-account-signedout");
    let signedInNavbar = document.getElementById("navbar-account-signedin");
    let userName = document.getElementById("navbar-account-name");

    let signedOffMobileNavbar = document.getElementById("navbar-mobile-account-signedout");
    let signedInMobileNavbar = document.getElementById("navbar-mobile-account-signedin");
    let userNameMobile = document.getElementById("navbar-mobile-account-name");

    // Remove the loading elements
    loadingNavbar.style.display = "none";
    loadingMobileNavbar.style.display = "none";

    if (!user) { // Check if the user is signed in

        signedOffNavbar.style.display = "flex";
        signedOffMobileNavbar.style.display = "flex";

        signedInNavbar.style.display = "none";
        signedInMobileNavbar.style.display = "none";

        userName.innerHTML = "Name";
        userNameMobile.innerHTML = "Name";

    } else {

        signedOffNavbar.style.display = "none";
        signedOffMobileNavbar.style.display = "none";

        signedInNavbar.style.display = "flex";
        signedInMobileNavbar.style.display = "flex";

        userName.innerHTML = `${user.firstName} ${user.lastName}`;
        userNameMobile.innerHTML = `${user.firstName} ${user.lastName}`;

    };

    return;

};

function navbarAccountButton() { // Mobile navbar account button redirect

    if (signedin) {
        fadeOut("/me/account", "0.2s");
    } else {
        fadeOut("/auth/signin", "0.2s");
    };

};

// Hit enter to search

function hitEnterEvent(id) {

    const input = document.getElementById(id);

    input.addEventListener('keypress', function (event) {

        if (event.key == "Enter") { 
            search();
        };

    });

};

// Search function for the navbar

function search() {

    // Get the search input
    let searchInput = document.getElementById("navbar-search-input");
    let searchInputMobile = document.getElementById("navbar-mobile-search-input");

    // Get the search query
    let queryString = searchInput.value;
    let queryStringMobile = searchInputMobile.value;

    // Check if the search query is empty
    if (queryString == "") {
        queryString = queryStringMobile; // If it is, set the search query to the mobile search query
    };

    // Check if the search query is empty
    if (queryString == "") {
        return; // If it is, return
    };

    // Redirect the user to the search page
    fadeOut(`/products/search?query=${queryString}`, "0.15s");

}

// Get navbar products count

async function getNavbarProductsCount() {

    // Send the request
    let response = await fetch("/api/cart/get.php", {
        method: "GET"
    });

    let json = await response.json().catch(() => { }); // Get the response

    if (!json?.code) { // Check if the response is valid
        return;
    };

    if (json.code == 200) { // Check if the response is successful and if it is, redirect the user to the home page

        // Get the cart's data
        let cart = json;
        let cartProductsCount = cart.products.length;

        setNavbarProductsCount(cartProductsCount);

    };

    return;

};

function setNavbarProductsCount(count) {

    // Get the navbar elements
    let navbarProductsCount = document.getElementById("navbar-cart-products-count");
    let navbarProductsCountMobile = document.getElementById("navbar-mobile-cart-products-count");

    // Set the cart's products count
    navbarProductsCount.innerHTML = `${count} product` + (count == 1 ? "" : "s");
    navbarProductsCountMobile.innerHTML = `${count} product` + (count == 1 ? "" : "s");

    return;

}