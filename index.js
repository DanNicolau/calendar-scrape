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
    if (!yearMonthStr) {
        yearMonthStr = new Date().toISOString().split('-').slice(0,2).join('-')
    }
    const fom = firstOfMonth(yearMonthStr);
    const payload = {
        countryCode: countryCode,
        month: fom,
        staffId: calendarLocalStorage.loginRes.staffId,
        storeID: calendarLocalStorage.loginRes.storeId
    }
    const { body } = await got.post(calendarLocalStorage.baseURL + '/api/Calendar', {
        json: payload,
        cookieJar: calendarCookieJar
    });
    const data = JSON.parse(body.substr(1)).res.result.data;
    calendarLocalStorage.calendarRes = { ...data };
    calendarLocalStorage.calendarReq = {
        yearMonthStr: fom.substr(0, 7)
    };
}

function calculateICSStart(el){
    const [yearStr, monthStr] = calendarLocalStorage.calendarReq.yearMonthStr.split('-'); 
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const date = el.dates;
    const [hourStr, minuteStr] = el.workingTime.split('T')[1].split(':');
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    return [year, month, date, hour, minute]; 
}

function calculateDuration(el){
    const startTime = Date.parse(el.workingTime);
    const endTime = Date.parse(el.clockOutTime);
    const totalMinutes = (endTime - startTime) / 1000 / 60;
    const minutes = totalMinutes % 60;
    const hours = (totalMinutes - minutes) / 60;
    return { hours, minutes };
}

function writeICSSync(destination){
    const events = [];
    calendarLocalStorage.calendarRes.calendarList.forEach( el => {
        if (el.workingTime) {
            events.push({
                title: el.workSegmentCode,
                start: calculateICSStart(el),
                duration: calculateDuration(el)
            });
        }
    });

    ics.createEvents(events, (err, value) => {
        if (!err) {
            console.log('Writing file');
            writeFileSync(destination, value)
        }
    });
}

function calendarString(){
    let str = '';

    const { staffName, storeName, calendarList } = calendarLocalStorage.calendarRes;
    str += staffName + '\n';
    str += storeName + '\n';
    str += calendarLocalStorage.calendarReq.yearMonthStr + '\n';

    calendarList.forEach(el => {
        if (el.workingTime) {
            str += el.dates + ' ' + el.workingTime.split('T')[1] + ' ' + el.clockOutTime.split('T')[1] + ' ' + el.workSegmentCode + '\n';
        }
    });

    return str;
}

module.exports = {
    login,
    scrapeCalendar,
    calendarString,
    writeICSSync,
};
