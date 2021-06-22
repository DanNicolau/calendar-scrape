require('dotenv').config()

const { login, printCalendar, getCalendar, generateICS, generateRequestDate } = require('./scraper.js'); 

if (require.main === module) {

    (async () => { 
        const dateString = generateRequestDate(process.argv[2]);
        const loginRes    = await login();
        const calendarRes = await getCalendar(loginRes, generateRequestDate(process.argv[2]));
        const calendarData = JSON.parse(calendarRes.body.substr(1)).res.result.data;
        printCalendar(calendarData, dateString.substr(0, 7));
        generateICS(calendarData);
    })();
}
