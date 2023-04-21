function fadeOut(href, time) {
    
    document.querySelector("body").style.animation = `fadeOut ${time}`;
    document.querySelector("body").style["animation-fill-mode"] = "both";
    
    if (window.innerWidth < 768) { // Check if the screen is mobile
        time = "0s"; // Set the time to 0 seconds
    };

    setTimeout(function() {
        window.location.href = href;
    }, time.replace("s", "") * 1000);

}

window.addEventListener("pageshow", function(evt) {

    if (evt.persisted) {
        window.location.reload();
    };

}, false);