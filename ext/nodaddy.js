var nodaddy = {
    init: function() {
        console.log("NoDaddy: initiating...");
        
        var isGoDaddy = this.storage.get("isGoDaddy"),
            lastCheck = this.storage.get("lastCheck");
        
        if (lastCheck && lastCheck < ((new Date().getTime() / 1000) - 3600)) {
            isGoDaddy = null;
        }
        
        switch (isGoDaddy) {
            case null: 
                var xhr = new XMLHttpRequest();
                xhr.open("GET", "http://who.is/whois/" + window.location.hostname, true);
                
                xhr.onreadystatechange = function requestOnReadyStateChange() {
                    if (xhr.readyState != 4) return;
                    if (xhr.status == 200 && xhr.responseText.match(nodaddy.regex)) {
                        nodaddy.storage.set("lastCheck", new Date().getTime() / 1000);
                        return nodaddy.badEgg();
                    } else if (xhr.status == 200) {
                        nodaddy.storage.set("lastCheck", new Date().getTime() / 1000);
                        return nodaddy.goodEgg();
                    } else {
                        return nodaddy.error();
                    }
                }
                xhr.send(null);
                break;
            case true:
                return nodaddy.badEgg();
            case false:
                return nodaddy.goodEgg();
        }
    },
    
    regex: new RegExp("/(registrar\.godaddy\.com|whois\.godaddy.com)/"),
    badEgg: function() {
        console.log("NoDaddy: Oh noes! This site is registered with GoDaddy!");
        if (this.storage.get("ignore") === true) return;
        
        var warning = document.getElementById("nodaddy"),
            closeButton = document.getElementById("nodaddy-close-button");
        
        if (!warning) {
            console.log("NoDaddy: creating warning div");
            warning = document.createElement("div");
            closeButton = document.createElement("div");
            document.getElementsByTagName("body")[0].appendChild(warning);
        }
        
        warning.setAttribute("id", "nodaddy");
        window.setTimeout(function() {
            warning.className = "nodaddy-warning";
        }, 200);
        warning.innerHTML = "This domain name (" + window.location.hostname + ") is registered through GoDaddy.";
        
        closeButton.setAttribute("id", "nodaddy-close-button");
        closeButton.innerHTML = "Close";
        warning.appendChild(closeButton);
        closeButton.addEventListener("click", function() {
            nodaddy.storage.set("ignore", true);
            warning.className = "";
        });
        
        this.storage.set("isGoDaddy", true);
    },
    goodEgg: function() {
        console.log("NoDaddy: This domain name is not registered through GoDaddy.");
        this.storage.set("isGoDaddy", false);
    },
    error: function() {
        console.log("NoDaddy: Unable to successfully look up WHOIS dataa.");
    },
    
    params: {
        isGoDaddy: null, 
        lastCheck: null,
        ignore: null
    },
    storage: {
        set: function(key, value) {
            nodaddy.params[key] = value;
            return window.localStorage.setItem("nodaddy:" + key, JSON.stringify(value));
        },
        get: function(key) {
            if (typeof nodaddy.params[key] !== "undefined" && nodaddy.params[key] !== null) {
                return nodaddy.params[key];
            }
            var value = JSON.parse(window.localStorage.getItem("nodaddy:" + key));
            nodaddy.params[key] = value;
            return value;
        }
    }
};

nodaddy.init();

