require('dotenv').config()
const got = require('got');

const url = process.env.ENDPOINT;

async function login(){
    console.log('Attempting login');

    const { body } = await got.post(url + '/account/login', {
        json: {
            employeeNumber: process.env.EMPLOYEE_NUMBER,
            password: process.env.PASSWORD
        },
        responseType: 'json'
    });

    console.log(body);

}

function thisMonth(){
    
}

async function getCalendar(){
    console.log('Accessing calendar');
    const { body } = await got.post(url + '/api/Calendar', {
        json: {
            countryCode: process.env.COUNTRY_CODE,
            month: "2021-06-01 00:00:00",
            staffId: 0,
            storeId: 0
        },
        responseType: 'json'
    });
}

if (require.main === module) {
    login()
        .then(getCalendar);
}
