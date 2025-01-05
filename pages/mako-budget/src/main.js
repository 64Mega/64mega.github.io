import {App} from "./app.js";

if (!navigator.serviceWorker?.controller) {
    navigator.serviceWorker.register("https://64mega.github.io/pages/mako-budget/sw.js").then(function (reg) {
        console.log("Service worker has been registered for scope: " + reg.scope);
    });
}

const app = new App();
app.attach(document.body);