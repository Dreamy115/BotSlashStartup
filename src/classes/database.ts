import sqlite3 from 'sqlite3';
import * as SQL from 'sqlite';

async function db_open(file:string){
  return SQL.open({
    driver: sqlite3.Database,
    filename: file
  })
}

async function db_init(db:SQL.Database<sqlite3.Database, sqlite3.Statement>){
  db.run(
    `PRAGMA auto_vacuum = FULL;`
  )
  db.run(
    `PRAGMA journal_mode = OFF;`
  )
}

export{
  db_init,
  db_open
}