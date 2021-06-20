require('dotenv').config()
const got = require('got');
const { CookieJar } = require('tough-cookie');
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

async function getCalendar(prev_res){
    console.log('Accessing calendar');
    const payload = {
            countryCode: process.env.COUNTRY_CODE,
            month: new Date().toISOString().substr(0, 8) + '01 00:00:00',
            staffId: prev_res.body.result.data.staffId,
            storeId: prev_res.body.result.data.storeId
    }
    const res = await got.post(url + '/api/Calendar', {
        json: payload,
        cookieJar: cookieJar
    });
    return res;
}

if (require.main === module) {
    (async () => { 
        const login_res    = await login();
        const calendar_res = await getCalendar(login_res);
        const calendar_data = JSON.parse(calendar_res.body.substr(1)).res.result.data;
        console.log(calendar_data);
    })();
}
