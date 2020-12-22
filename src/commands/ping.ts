import { ApplicationCommandOption as Opt, ApplicationCommandOptionType as Type, PartialApplicationCommand as Cmd, ApplicationCommandOptionValue as Val, InteractionResponseType as InType} from 'slash-commands';
import { Response } from '../commands';
import * as SQL from 'sqlite';
import sqlite3 from 'sqlite3';

const response:Response = {
  type: InType.ACK_WITH_SOURCE,
  run: async function(args:any,db:SQL.Database<sqlite3.Database, sqlite3.Statement>){
    throw new Error('test error')
  }
}

const json:Cmd = {
  name: "ping",
  description: "Test command",
}

export {
  response,
  json
}