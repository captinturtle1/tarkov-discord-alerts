import 'dotenv/config';
import { Client, Events, GatewayIntentBits } from "discord.js";

const secWarning = 300;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.login(process.env.DISCORD_TOKEN);

client.once(Events.ClientReady, async client => {
    console.log(`${client.user.tag} logged in!`);
    alertLoop(process.env.MECHANIC_ROLE_ID, "mechanic", process.env.CHANNEL_ID);
    alertLoop(process.env.PRAPOR_ROLE_ID, "prapor", process.env.CHANNEL_ID);
    alertLoop(process.env.PEACEKEEPER_ROLE_ID, "peacekeeper", process.env.CHANNEL_ID);
});

async function alertLoop(role_id, name, channel_id) {
    console.log(`starting ${name} loop!`);
    while (true) {
        try {
            let refreshTime = await getRefreshTime();
            refreshTime = refreshTime[name];
            console.log(`${name} time: `, refreshTime);
            await new Promise(resolve => {
                if (refreshTime > 0) {
                    setTimeout(async () => {
                        client.channels.cache.get(channel_id).send(`<@&${role_id}> ${name.toUpperCase()} REFRESH IN ${secWarning / 60} MINUTES!!!!!!!!!`);
                        await new Promise(res => setTimeout(res, (secWarning - 60) * 1000))
                        client.channels.cache.get(channel_id).send(`<@&${role_id}> ${name.toUpperCase()} REFRESH IN 1 MINUTE!!!!!!!!!`);
                        await new Promise(res => setTimeout(res, 70 * 1000));
                        resolve();
                    }, (refreshTime - secWarning) * 1000);
                } else {
                    setTimeout(async () => {
                        resolve();
                    }, 600 * 1000);
                }
            })
        } catch(err) {
            console.error(err);
        }
    }
}

async function getRefreshTime () {
    return new Promise((resolve, reject) => {
        try {
                const options = {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                    },
                    body: JSON.stringify(
                        {
                            query: `{
                                traders() {
                                    name
                                    resetTime
                                }
                            }`
                    })
                }
            
                fetch('https://api.tarkov.dev/graphql', options)
                .then(response => response.json())
                .then(data => {
                    let traders = data.data.traders;
                    let resetObj = {};
                    
                    for (let i = 0; i < traders.length; i++) {
                        resetObj[traders[i].name.toLowerCase()] = (new Date(traders[i].resetTime).getTime() - Date.now()) / 1000;
                    }

                    resolve(resetObj);
                });
    } catch(err) {
        reject(err);
    }
    })
}