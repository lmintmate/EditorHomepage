"use strict";

/* CORE */

/* Default vars */
var defaultEditor = "gnuemacs";
var defaultEngine = "duckduckgo";
var defaultLanguage = "en";

/* Use cookies if defined, else use default values */
var editor = Cookies.get("editor") ? Cookies.get("editor") : defaultEditor;
var engine = Cookies.get("engine") ? Cookies.get("engine") : defaultEngine;
var language = Cookies.get("language") ? Cookies.get("language") : defaultLanguage;

/* Global vars */
var languages = [];

/* Read JSON file, then call callback function */
function loadJSON(filename, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", "data/" + filename, true);
    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            callback(JSON.parse(this.response));
        } else {
            alert("Unable to download json data...");
        }
    };
    request.onerror = function() {
        alert("Unable to download json data...");
    };
    request.send();
}

/* Create links in navbar */
function createLinks(json) {
    var links = document.querySelectorAll(".link");
    var edit = json.hasOwnProperty(editor) ? editor : defaultEditor;
    Object.keys(json[edit]).forEach(function (key, index) {
        links[index].setAttribute("href", json[edit][key]);
        links[index].textContent = key;
    });
}

/* Change editor elements */
function changeEditor(json) {
    var logo = document.getElementById("logo");
    /* Change if new editor is not current editor */
    if (editor !== logo.className) {
        /* Change logo of editor */
        logo.style.backgroundImage = "url('img/" + editor + "-logo.png')";
        logo.className = editor;
        /* Change color of search div */
        document.getElementById("search").style.backgroundColor = "#" + json[editor].main_color;
        /* Change colors of links in navbar */
        var links = document.querySelectorAll("#navbar a");
        for (var i = 0; i < links.length; i++) {
            links[i].style.color = "#" + json[editor].main_color;
        }
        /* Change specific editor links */
        var website = document.querySelector(".website");
        website.setAttribute("href", json[editor].website);
        var doc = document.querySelector(".doc");
        doc.setAttribute("href", json[editor].doc);
        /* Set editor cookie with new value */
        Cookies.set("editor", editor, {expires: 365, path: "/"});
    }
}

/* Change search elements */
function changeEngine(json) {
    var engineCircle = document.getElementById("engine");
    /* Change if new engine is not current engine */
    if (engine !== engineCircle.className) {
        /* Set parameters to do search */
        document.getElementById("form-search").setAttribute("action", json[engine].url);
        document.querySelector("input[type='search']").setAttribute("name", json[engine].parameter);
        engineCircle.className = engine;
        /* Change style of engine circle */
        engineCircle.style.backgroundColor = "#" + json[engine].colors.circle;
        engineCircle.style.color = "#" + json[engine].colors.font;
        engineCircle.textContent = engine.charAt(0).toUpperCase();
        /* Set engine cookie with new value */
        Cookies.set("engine", engine, {expires: 365, path: "/"});
    }
}

/* Translate webpage */
function changeLanguage(json) {
    /* Change lang of all texts */
    var elts = [];
    for (var i = 0; i < languages.length; i++) {
        elts[languages[i]] = ["option[value=" + languages[i] + "]", "textContent"];
    }
    elts["placeholder"] = ["#input-search input", "placeholder"];
    elts["doc"] = ["#doc-text", "textContent"];
    elts["website"] = ["#website-text", "textContent"];
    elts["about"] = ["#about-text", "textContent"];
    elts["author"] = ["#author-text", "textContent"];
    elts["description"] = ["#description-text", "textContent"];
    elts["license"] = ["#license-text", "textContent"];
    elts["github"] = ["#github-text", "textContent"];
    elts["thanks"] = ["#thanks-text", "textContent"];
    elts["contributors"] = ["#contributors-text", "textContent"];
    elts["close"] = ["#close-text", "textContent"];
    Object.keys(elts).forEach(function (key) {
        document.querySelector(elts[key][0])[elts[key][1]] = json[language][key];
    });
    Cookies.set("language", language, {expires: 365, path: "/"});
}

/* Fill select */
function fillSelect(data) {
    var select = document.querySelector("#" + data[0]);
    data[1].forEach(function (elt) {
        var option = document.createElement("option");
        option.value = elt.toLowerCase().replace(" ", "");
        option.textContent = elt;
        select.appendChild(option);
    });
    /* Select current value */
    var name = data[0].substr(0, data[0].length - 1);
    select.value = window[name];
}

/* Handle editors */
function initEditors(json) {
    var editors = [];
    Object.keys(json).forEach(function (key) {
        editors.push(json[key].name);
    });

    fillSelect(["editors", editors]);
    changeEditor(json);
}

/* Handle engines */
function initEngines(json) {
    var engines = [];
    Object.keys(json).forEach(function (key) {
        engines.push(json[key].name);
    });

    fillSelect(["engines", engines]);
    changeEngine(json);
}

/* Handle languages */
function initLanguages(json) {
    languages = [];
    Object.keys(json).forEach(function (key) {
        languages.push(key);
    });

    fillSelect(["languages", languages]);
    changeLanguage(json);
}

/* INIT WEBPAGE */
loadJSON("links.min.json", createLinks);
loadJSON("editors.min.json", initEditors);
loadJSON("engines.min.json", initEngines);
loadJSON("translations.min.json", initLanguages);

/* SELECTS ONCHANGE */
document.getElementById("editors").onchange = function () {
    editor = this.value;
    loadJSON("editors.min.json", changeEditor);
    loadJSON("links.min.json", createLinks);
};

document.getElementById("engines").onchange = function () {
    engine = this.value;
    loadJSON("engines.min.json", changeEngine);
};

document.getElementById("languages").onchange = function () {
    language = this.value;
    loadJSON("translations.min.json", changeLanguage);
};
