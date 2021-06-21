require('dotenv').config()
const got = require('got');
const { CookieJar } = require('tough-cookie');
const ics = require('ics');

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

function parseDate(str){
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

function printCalendar(calendarData){
    console.log('Printing Calendar Data');
    
    const { staffName, storeName, calendarList } = calendarData;

    console.log(staffName);
    console.log(storeName);
    calendarList.forEach(el => {
        if (el.workingTime) {
            console.log(el.dates, el.workingTime, el.clockOutTime);
        }
    });
}

if (require.main === module) {

    (async () => { 
        const loginRes    = await login();
        const calendarRes = await getCalendar(loginRes, parseDate(process.argv[2]));
        const calendarData = JSON.parse(calendarRes.body.substr(1)).res.result.data;
        // const { calendarList } = calendar_data;

        printCalendar(calendarData);

    })();
}
