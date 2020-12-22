require('dotenv').config()
import { DiscordInteractions } from 'slash-commands';
import * as Commands from './commands';
import Discord from 'discord.js';
import { db_init, db_open } from './classes/database';
import { promisify } from 'util';

if(process.env.APP_ID === undefined) throw new Error('dotenv: APP_ID cannot be undefined');
if(process.env.TOKEN === undefined) throw new Error('dotenv: TOKEN cannot be undefined');
if(process.env.APP_KEY === undefined) throw new Error('dotenv: APP_KEY cannot be undefined');

const interaction = new DiscordInteractions({
  applicationId: process.env.APP_ID,
  authToken: process.env.TOKEN,
  publicKey: process.env.APP_KEY
})

const Bot = new Discord.Client();

Bot.once('ready', async ()=>{
  console.log("Logged in");

  for(const cmd of await interaction.getApplicationCommands(process.env.CMD_GUILD)){
    if(Commands.Commands[cmd.name] == undefined){
      interaction.deleteApplicationCommand(cmd.id,process.env.CMD_GUILD).catch(()=>{});
    }
  }

  console.log(Commands.Commands)
  for(const c in Commands.Commands){
    let cmd = Commands.Commands[c];

    await interaction.createApplicationCommand(cmd.json,process.env.CMD_GUILD)
    .then((a)=>{console.log(c,a)})
    .catch((a)=>{console.error(c,a)})
  }

  if(process.env.DATABASE == undefined) throw new Error("Database is undefined. Check .env config.");
  const db = await db_open(process.env.DATABASE);
  await db_init(db);

  // @ts-expect-error
  Bot.ws.on('INTERACTION_CREATE', async interaction => {
    const command = interaction.data.name.toLowerCase();
    const args = interaction.data.options;

    const cmd:Commands.Command = Commands.Commands[command];
    const res = cmd.response;
    if(res == undefined) return;

    let returned:any = null;

    try {
      returned = await res.run(args,db);
    } catch(e) {
      returned = '```\n'+e+'```';
    }

    if(returned === undefined || returned === null) returned = ':white_check_mark:';

    try {
      let content = await createAPIMessage(interaction, returned);
      // @ts-expect-error
      await promisify(Bot.api.interactions(interaction.id, interaction.token).callback.post)({
        data: {
          type: res.type,
          data: content
        }
      });
    } catch {}
  });
})

async function createAPIMessage(interaction, content) {
  const t = Bot.channels.resolve(interaction.channel_id);
  if(t == null) return;

  try {
    if(content === null || content === undefined) throw new Error("No content");
    // @ts-expect-error
    const apiMessage = await Discord.APIMessage.create(t, content)
      .resolveData()
      .resolveFiles();
    
    return { ...apiMessage.data, files: apiMessage.files };
  } catch {
    throw new Error('No content');
  }
}

console.log("Logging in");
Bot.login(process.env.TOKEN);
