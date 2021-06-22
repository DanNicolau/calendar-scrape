require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client();

const { login, printCalendar, getCalendar, generateICS, generateRequestDate, getFormattedCalendarString } = require('./scraper.js'); 

//if (require.main === module) {
//    (async () => { 
//        const dateString = generateRequestDate(process.argv[2]);
//        const loginRes    = await login();
//        const calendarRes = await getCalendar(loginRes, generateRequestDate(process.argv[2]));
//        const calendarData = JSON.parse(calendarRes.body.substr(1)).res.result.data;
//        printCalendar(calendarData, dateString.substr(0, 7));
//        generateICS(calendarData);
//    })();
//}

client.on('ready', () => {
      console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
      if (msg.content === 'schedule') {
          (async () => {
            const dateString = generateRequestDate(process.argv[2]);
            const loginRes    = await login();
            const calendarRes = await getCalendar(loginRes, generateRequestDate(process.argv[2]));
            const calendarData = JSON.parse(calendarRes.body.substr(1)).res.result.data;
            // printCalendar(calendarData, dateString.substr(0, 7));
            // generateICS(calendarData);

            msg.reply(getFormattedCalendarString(calendarData, dateString.substr(0, 7)));
          })();
        }
});

client.login(process.env.DISCORD_TOKEN);
