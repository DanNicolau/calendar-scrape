const got = require('got');
const ics = require('ics');
const { CookieJar } = require('tough-cookie');
const { writeFileSync, writeFile } = require('fs');

const calendarCookieJar = new CookieJar();
const calendarLocalStorage = {};

function twoDigitMonth(monthStr){
    return ('0'+monthStr).substr(-2);
}

function firstOfMonth(yearMonthStr){
    const [year, month] = yearMonthStr.split('-');
    return year+'-'+twoDigitMonth(month)+'-01 00:00:00';
}

async function login(employeeNumber, password, baseURL='https://wps.fastretailing.com'){
    calendarLocalStorage.baseURL = baseURL
    const { body } = await got.post(baseURL + '/account/login', {
        json: { employeeNumber, password },
        responseType: 'json',
        cookieJar: calendarCookieJar
    });
    calendarLocalStorage.loginRes = { ...body.result.data } ;
}

async function scrapeCalendar(yearMonthStr, countryCode='CA'){
    const payload = {
        countryCode: countryCode,
        month: firstOfMonth(yearMonthStr),
        staffId: calendarLocalStorage.loginRes.staffId,
        storeID: calendarLocalStorage.loginRes.storeId
    }
    const { body } = await got.post(calendarLocalStorage.baseURL + '/api/Calendar', {
        json: payload,
        cookieJar: calendarCookieJar
    });
    const data = JSON.parse(body.substr(1)).res.result.data;
    calendarLocalStorage.calendarRes = { ...data };
    console.log(calendarLocalStorage);
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

( async () => {
    await login(967339, 3711);
    // console.log(firstOfMonth('2020-9'));
    await scrapeCalendar('2020-09');
})();
