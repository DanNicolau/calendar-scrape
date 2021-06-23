const got = require('got');
const ics = require('ics');
const { CookieJar } = require('tough-cookie');
const { writeFileSync, writeFile } = require('fs');

const calendarCookieJar = new CookieJar();
const calendarLocalStorage = {
    loginRes: null
};

function fixMonth(monthStr){
    return ('0'+monthStr).substr(-2);
}

function firstOfMonth(monthStr){
    
}

async function login(employeeNumber, password, base_url='https://wps.fastretailing.com'){
    const res = await got.post(url + '/account/login', {
        json: { employeeNumber, password },
        responseType: 'json',
        cookieJar: cookieJar
    });
    calendarLocalStorage.loginRes = res;
}

async function scrapeCalendar(monthStr, countryCode='CA'){
    const payload = {
        countryCode: countryCode,
        month: firstOfMonth(monthStr)
    }
}

async function writeICS(){
    
}

function writeICSSync(){

}

function calendarString(){

}

module.exports = {
    login,
    scrapeCalendar,
    calendarString,
    writeICSSync,
    writeICS
};
