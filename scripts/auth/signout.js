async function signOut() {

    // Send the request
    await fetch("/api/auth/signout.php", {
        method: "GET"
    });

    document.cookie = "_csfr=; Max-Age=-99999999; path=/;"; // Delete the CSRF token cookie

    location.reload(); // Reload the page, signed out

}