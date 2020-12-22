import fs from 'fs';
import { InteractionResponseType, PartialApplicationCommand } from 'slash-commands';
import * as SQL from 'sqlite';
import sqlite3 from 'sqlite3';

const Commands:any = {};

const cfiles = fs.readdirSync(__dirname+'//commands');
console.log(cfiles);
for(let file of cfiles){
  if(!file.endsWith('.js')) continue;
  file = file.substring(0,file.length-3);
  Commands[file] = require('./commands/'+file);
  Commands[file].name = file;
  for(let alias in Commands[file].aliases){
    Commands[Commands[file].aliases[alias]] = Commands[file];
  }
}

interface Response {
  run:(args:any,db:SQL.Database<sqlite3.Database, sqlite3.Statement>)=>Promise<any>,
  type:InteractionResponseType
}

interface Command {
  json:PartialApplicationCommand,
  response:Response
}

export{
  Commands,
  Command,
  Response
};