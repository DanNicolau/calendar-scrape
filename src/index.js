require('dotenv').config()
const got = require('got');
const { CookieJar } = require('tough-cookie');
const ics = require('ics');
const { writeFileSync } = require('fs');

const url = process.env.ENDPOINT;
const cookieJar = new CookieJar();

async function login(){
    console.log('Attempting login');

    const res = await got.post(url + '/account/login', {
        json: {
            employeeNumber: process.env.EMPLOYEE_NUMBER,
            password: process.env.PASSWORD
        },
        responseType: 'json',
        cookieJar: cookieJar
    });
    return res;
}

function generateRequestDate(str){
    if (str) {
        try {
            const dateArr = str.split('-');
            const [seg0, seg1] = dateArr;
            switch (dateArr.length){
                case 1: {
                    const monthTwoDigits = ('0' + seg0).substr(-2);
                    return new Date().toISOString().substr(0, 5) + monthTwoDigits + '-01 00:00:00'; 
                    break;
                }
                case 2: {
                    const monthTwoDigits = ('0' + seg1).substr(-2);
                    return seg0 + '-' + monthTwoDigits + '-01 00:00:00';
                    break;
                }
                case 3: {
                    const monthTwoDigits = ('0' + seg1).substr(-2);
                    return seg0 + '-' + monthTwoDigits + '-01 00:00:00';
                    break;
                }
                default:
                    throw new Error('Unhandled number of segments in date parsing');
            }

        } catch (err) {
            console.log(err);
            return new Date().toISOString().substr(0, 8) + '01 00:00:00';
        }
    } else {
        return new Date().toISOString().substr(0, 8) + '01 00:00:00';
    }
}

async function getCalendar(prev_res, dateString){
    console.log('Accessing calendar');
    const payload = {
            countryCode: process.env.COUNTRY_CODE,
            month: dateString,
            staffId: prev_res.body.result.data.staffId,
            storeId: prev_res.body.result.data.storeId
    }
    const res = await got.post(url + '/api/Calendar', {
        json: payload,
        cookieJar: cookieJar
    });
    return res;
}

function printCalendar(calendarData, dateHR){
    console.log('Printing Calendar Data');

    const { staffName, storeName, calendarList } = calendarData;
    console.log(staffName);
    console.log(storeName);
    console.log(dateHR);

    calendarList.forEach(el => {
        if (el.workingTime) {
            console.log(el.dates, el.workingTime.split('T')[1], el.clockOutTime.split('T')[1], el.workSegmentCode);
        }
    });
}

function getTitle(el){
    switch (el.workSegmentCode) {
        case 'D01':
            return 'Work';
            break;
        case 'D05':
            return 'Business Trip and Training';
            break;
        default:
            return el.workSegmentCode;
    }
}

function calculateICSStart(el){
    const [yearStr, monthStr] = generateRequestDate(process.argv[2]).split('-').slice(0, 2); 
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

function generateICS(calendarData){
    const { storeName, calendarList } = calendarData;
    let events = [];
    calendarList.forEach( el => {
        if (el.workingTime) {
            events.push({
                title: getTitle(el),
                start: calculateICSStart(el),
                duration: calculateDuration(el)
            });
        }
    });
    console.log(events);

    ics.createEvents(events, (err, value) => {
        if (err) {
            console.log(err);
        } else {
            writeFileSync(`${__dirname}/scraped_calendar.ics`, value)
        }
    });
}

if (require.main === module) {

    const dateString = generateRequestDate(process.argv[2]);
    // const dateHR = dateString.substr(0, 7);

    (async () => { 
        const loginRes    = await login();
        const calendarRes = await getCalendar(loginRes, generateRequestDate(process.argv[2]));
        const calendarData = JSON.parse(calendarRes.body.substr(1)).res.result.data;
        // const { calendarList } = calendar_data;
        printCalendar(calendarData, dateString.substr(0, 7));
        generateICS(calendarData);
    })();
}
