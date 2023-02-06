"use strict";

/*  API KEY:
    https://openweathermap.org/api
    --> Current Weather Data

    API DOC:
    https://openweathermap.org/current
*/

const OPTIONS = {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
}

const API_VERSION = "2.5";
const API_KEY = "HIER API KEY !!!!"; // <------ API KEY
const COUNTRY = "de";
const UNITS = "metric";

const INPUT_WRAPPER = document.querySelector("div#inputWrapper");
const INPUT = INPUT_WRAPPER.querySelector("input#inputPlz");
const BUTTON = INPUT_WRAPPER.querySelector("button#btnPlz");
const CONTAINER = document.querySelector("div#wetterData");

let jsonObj;


initWeatherPanel();

/**
 * Intialisieren beim ersten Aufruf
 */
function initWeatherPanel() {

    // Prüft ob Daten im LocalStorage existieren.
    let storage = localStorage.getItem("usrWeatherData");
    if (storage != undefined && storage != null) {
        console.log("Daten vom LocalStorage geladen.")
        jsonObj = JSON.parse(storage);
    } else {
        jsonObj = {
            locations: []
        }
    }

    // Prüft ob Wetterdaten existieren, falls ja erzeuge Wettereinträge DOM
    if (jsonObj.locations.length == 0) {
        createEmptyMessage();
    } else {
        for (let i = 0; i < jsonObj.locations.length; i++) {
            let zipcode = jsonObj.locations[i].zipCode;
            addWeatherItem(zipcode);
        }
        createRefreshBtn();
    }

    // Listener Button : Wetterdaten hinzufügen
    BUTTON.addEventListener("click", function () {
        let input = INPUT.value;
        if (!isLocationSet(input)) {
            addWeatherItem(input);
        }
    });

    // Listener Button : Eingabe prüfen / Fehler ausgeben wenn Eingabe nicht OK
    INPUT.addEventListener("keyup", showAlertsInputPlz);

    if (INPUT.value.length == 5 && !isNaN(INPUT.value)) {
        BUTTON.removeAttribute('disabled');
    } else {
        BUTTON.setAttribute("disabled", "disabled");
    }

    console.log(jsonObj);
}


/**
 * Prüft ob eine Location(PLZ) bereits gesetzt wurde
 * @param {*} zipcode 
 * @returns 
 */
function isLocationSet(zipcode) {
    let locations = jsonObj.locations;
    for (let i = 0; i < locations.length; i++) {
        if (locations[i].zipCode == zipcode) {
            return true;
        }
    }
    return false;
}

/**
 * Fragt Wetter API nach aktuellen Wetterdaten für PLZ ab
 * @param {*} zipcode 5 Zahlen
 */
function loadWeatherData(zipcode) {
    let apiUrl = "http://api.openweathermap.org/data/" + API_VERSION + "/weather?zip=" + zipcode + ","
        + COUNTRY + "&units=" + UNITS + "&lang=" + COUNTRY + "&appid=" + API_KEY;
    let xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status != 200) {
            console.log("XHR: Verarbeitungsfehler");
            return;
        }

        console.log("Daten von API geladen: " + zipcode);
        // console.log("URL: " + apiUrl);

        let jsonData = xhr.response;

        let newLocation = {
            zipCode: zipcode,
            weather: jsonData
        }
        jsonObj.locations.push(newLocation);

        localStorage.clear();
        localStorage.setItem("usrWeatherData", JSON.stringify(jsonObj));

        createWeatherItem(newLocation);
        updateEmtpyMessage();
    }
    xhr.open("GET", apiUrl);
    xhr.responseType = "json";
    xhr.send();
}


/**
 * Erstellt Wettereintrag für PLZ. Wenn PLZ bereits abgerufen ist, wird der Wettereintrag
 * anhand der gespeicherten Daten erzeugt. Andernfalls wird die Wetter-API abgefragt und anhand der
 * abgerufen Daten der Wettereintrag erstellt.
 * @param {*} zipcode 5 Zahlen
 */
function addWeatherItem(zipcode) {
    if (!isLocationSet(zipcode)) {
        loadWeatherData(zipcode);
    } else {
        for (let i = 0; i < jsonObj.locations.length; i++) {
            if (jsonObj.locations[i].zipCode == zipcode) {
                createWeatherItem(jsonObj.locations[i]);
            }
        }
    }
    createRefreshBtn();
    deleteEmptyMessage();
}


/**
 * Erstellt den DOM für einen Wettereintrag und fügt diesen der Liste zu
 * @param {JSON} json Wetterobjekt
 */
function createWeatherItem(json) {
    let item = document.createElement("div");
    item.className = "item item-" + json.zipCode;

    let insTs = new Date().toLocaleString("de-DE", OPTIONS) + " Uhr";

    item.innerHTML = '<div class="title"><img height="50" width="50"/><h2></h2><a href="" class="btn removeItem"><i class="bi bi-trash-fill"></i></a></div><div class="row"> <div class="col-md-3"> <div class="panel"> <label class="text-truncate mb-0">Aktuell</label> <span class="data temp"></span> </div></div><div class="col-md-3"> <div class="panel"> <label class="text-truncate mb-0">Minimal</label> <span class="data temp_min"></span> </div></div><div class="col-md-3"> <div class="panel"> <label class="text-truncate mb-0">Maximal</label> <span class="data temp_max"></span> </div></div><div class="col-md-3"> <div class="panel"> <label class="text-truncate mb-0">Gefühlt</label> <span class="data feels_like"></span> </div></div><div class="col-md-3"> <div class="panel"> <label class="text-truncate mb-0">Windgeschwindigkeit</label> <span class="data wind"></span> </div></div><div class="col-md-3"> <div class="panel"> <label class="text-truncate mb-0">Luftdruck</label> <span class="data pressure"></span> </div></div><div class="col-md-3"> <div class="panel"> <label class="text-truncate mb-0">Luftfeuchtigkeit</label> <span class="data humidity"></span> </div></div><div class="col-md-3"> <div class="panel"> <label class="text-truncate mb-0">Sicht</label> <span class="data visibility"></span> </div></div></div><h6 class="insTs"></h6>';

    item.querySelector(".title h2").innerHTML = json.weather.name + " <small class='text-muted'>" + json.zipCode + "</small>";
    item.querySelector(".title img").setAttribute("src", "http://openweathermap.org/img/wn/" + json.weather.weather[0]["icon"] + "@2x.png");
    item.querySelector(".panel span.temp").innerHTML = json.weather.main.temp + " <small>°C</small>";
    item.querySelector(".panel span.temp_min").innerHTML = json.weather.main.temp_min + " <small>°C</small>";
    item.querySelector(".panel span.temp_max").innerHTML = json.weather.main.temp_max + " <small>°C</small>";
    item.querySelector(".panel span.feels_like").innerHTML = json.weather.main.feels_like + " <small>°C</small>";
    item.querySelector(".panel span.wind").innerHTML = json.weather.wind.speed + " <small>km/h</small>";
    item.querySelector(".panel span.pressure").innerHTML = json.weather.main.pressure + " <small>hPa</small>";
    item.querySelector(".panel span.humidity").innerHTML = json.weather.main.humidity + " <small>%</small>";
    item.querySelector(".panel span.visibility").innerHTML = json.weather.visibility + " <small>m</small>";
    item.querySelector("h6.insTs").innerHTML = '<i class="bi bi-calendar2-date mr-2"></i>' + insTs;

    item.querySelector(".removeItem").addEventListener("click", function () {
        removeWeatherItem(json.zipCode);
    });

    CONTAINER.appendChild(item);

    console.log("createWeatherItem: " + json.zipCode);
}

/**
 * Entfernt ein Wettereintrag
 * @param {5-digits} zipcode 
 */
function removeWeatherItem(zipcode) {

    let item = CONTAINER.querySelector(".item-" + zipcode);

    console.log(jsonObj);
    for (let i = 0; i < jsonObj.locations.length; i++) {
        if (jsonObj.locations[i].zipCode == zipcode) {
            jsonObj.locations.splice(i, 1);
        }
    }
    localStorage.setItem("usrWeatherData", JSON.stringify(jsonObj));
    console.log(jsonObj);
    item.remove();
    createEmptyMessage();
    console.log("removeWeatherItem: " + zipcode);
}

/**
 * Benachrichtigt den Nutzer, dass keine Wettereinträge vorhanden sind.
 */
function createEmptyMessage() {
    let items = document.querySelectorAll("div.item");
    if (items.length == 0) {
        let msgEmpty = document.createElement("div");
        msgEmpty.className = "msg-empty alert alert-primary mt-4";
        msgEmpty.textContent = "Du hast noch keine Locations angelegt";
        CONTAINER.appendChild(msgEmpty);
        removeRefreshBtn();
    }
}

/**
 * Entfernt die Nachricht, dass  keine Wettereinträge vorhanden sind.
 */
function deleteEmptyMessage() {
    let msg = document.querySelector(".msg-empty");
    if (msg != null) {
        msg.remove();
        createRefreshBtn();
    }
}

/**
 * Prüft ob Empty Nachricht noch gültig ist
 */
function updateEmtpyMessage() {
    let items = document.querySelectorAll("div.item");
    let emptyMsg = document.querySelector(".msg-empty");
    if (items.length == 0) {
        let msgEmpty = document.createElement("div");
        msgEmpty.className = "msg-empty alert alert-primary mt-4";
        msgEmpty.textContent = "Du hast noch keine Locations angelegt";
        CONTAINER.appendChild(msgEmpty);
        removeRefreshBtn();
    } if (emptyMsg != null) {
        emptyMsg.remove();
        createRefreshBtn();
    }
}

/**
 * Erzeugt Refreshbutton, um Wettereinträge zu aktualisieren
 */
function createRefreshBtn() {
    let btn = INPUT_WRAPPER.querySelector(".refresh");
    if (btn == null) {
        let refreshBtn = document.createElement("div");
        refreshBtn.className = "col-md-1 refresh";
        refreshBtn.innerHTML = '<button class="btn btn-lg btn-block btn-outline-secondary"><i class="bi bi-arrow-clockwise"></i></button>';
        INPUT_WRAPPER.appendChild(refreshBtn);

        refreshBtn.querySelector(".refresh button").addEventListener("click", refreshWeatherData);
    }
}

/**
 * Entfernt Refreshbutton
 */
function removeRefreshBtn() {
    let btn = INPUT_WRAPPER.querySelector(".refresh");
    if (btn != null) {
        btn.remove();
    }
}

/**
 * Wettereinträge aktualisieren
 */
function refreshWeatherData() {
    let locations = jsonObj.locations;
    let zipcodes = [];

    for (let i = 0; i < locations.length; i++) {
        zipcodes.push(locations[i].zipCode);
    }

    console.log(zipcodes);

    for (let i = 0; i < zipcodes.length; i++) {
        removeWeatherItem(zipcodes[i]);
        loadWeatherData(zipcodes[i]);
    }
}

/**
 * Gibt bei ungültiger PLZ Alerts unterhalb dem Inputfield aus
 */
function showAlertsInputPlz() {
    let input = this.value;

    if (document.querySelector("div.alert")) {
        let alerts = document.querySelectorAll("div.alert");
        alerts.forEach(e => e.remove());
    }

    if (input.length > 0) {
        if (input.length < 5) {
            let msg1 = createAlertMessage("Zu wenige Zeichen");
            this.parentNode.insertBefore(msg1, this.nextSibling);
        }
        if (input.length > 5) {
            let msg2 = createAlertMessage("Zu viele Zeichen");
            this.parentNode.insertBefore(msg2, this.nextSibling);
        }
        if (isNaN(input)) {
            let msg3 = createAlertMessage("Bitte nur Zahlen eingeben");
            this.parentNode.insertBefore(msg3, this.nextSibling);
        }
    }

    if (input.length == 5 && !isNaN(input)) {
        BUTTON.removeAttribute('disabled');
    } else {
        BUTTON.setAttribute("disabled", "disabled");
    }
}

/**
 * Erzeugt eine Alert-Message
 * @param {String} msgText 
 * @returns HTML Errormessage
 */
function createAlertMessage(msgText) {
    let alert = document.createElement("div");
    alert.className = "alert alert-primary mt-3";
    alert.setAttribute("role", "alert");
    alert.innerHTML = msgText;

    return alert;
}