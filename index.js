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

if (require.main === module) {
    login()
}
