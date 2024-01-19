import 'dotenv/config';
import { Client, Events, GatewayIntentBits } from "discord.js";

const secWarning = 300;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async client => {
    console.log(`${client.user.tag} logged in!`);
    pogLoop();
});

async function pogLoop() {
    while (true) {
        try {
            let refreshTime = await getRefreshTime();

            await new Promise(resolve => {
                setTimeout(async () => {
                    client.channels.cache.get('485667177228402698').send(`<@&1197785955516567594> MECHANIC REFRESH IN: ${secWarning / 60} MINUTES!!!!!!!!!`);
                    
                    await new Promise(res => setTimeout(res, (secWarning + 60) * 1000));
                    resolve();
                }, (refreshTime - secWarning) * 1000);
            })
        } catch(err) {
            console.error(err);
        }
    }
}

client.login(process.env.DISCORD_TOKEN);

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
                    let mechanicReset;
                    let traders = data.data.traders

                    for (let i = 0; i < traders.length; i++) {
                        if (traders[i].name == "Mechanic") mechanicReset = new Date(traders[i].resetTime);
                    }

                    let differenceInSec = (mechanicReset.getTime() - Date.now()) / 1000;
                    resolve(differenceInSec);
                });
    } catch(err) {
        reject(err);
    }
    })
}