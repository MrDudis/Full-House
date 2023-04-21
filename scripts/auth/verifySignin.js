async function checkIfSignedIn() {

    // Send the request
    let response = await fetch("/api/auth/account.php", {
        method: "GET"
    });

    let json = await response.json().catch(() => {}); // Get the response

    if (json?.code == 200) { // Check if the response is successful and if it is, redirect the user to the home page
        window.location.href = "/listings";
    };

};

async function checkIfNotSignedIn(redirectTo) {

    // Send the request
    let response = await fetch("/api/auth/account.php", {
        method: "GET"
    });

    let json = await response.json().catch(() => {}); // Get the response

    if (json?.code == 200) { // Check if the response is successful and if it is, redirect the user to the home page
        return;
    } else if (json?.code == 401) { // Check if the response is unauthorized
        window.location.href = "/auth/signin?redirect_url=" + redirectTo;
    };

    return;
};
