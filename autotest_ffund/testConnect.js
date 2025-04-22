var webdriver = require('selenium-webdriver');

var browser = new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .build();

browser.get('https://admin-ffund.vercel.app');

browser.getTitle().then(function (title) {
    console.log(title);
}).finally(function () {
    browser.quit();
});