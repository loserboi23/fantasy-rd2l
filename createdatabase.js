/*
    This file is for creating the initial database
*/


const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database("fantasy-database.db", (err) =>
{
    if(err){
    return console.error(err.message);
    }
    console.log("Connected to the database");
});

/*
.run(`CREATE TABLE IF NOT EXISTS fantasy_user(id INTEGER PRIMARY KEY, total_fantasy_points INTEGER, packs_available INTEGER, premium_available INTEGER, shards INTEGER)`)
.run(`CREATE TABLE IF NOT EXISTS inventory(discord_id INTEGER, tier INTEGER, playerid INTEGER, 
        FOREIGN KEY (discord_id) REFERENCES fantasy_user (id), FOREIGN KEY(playerid) REFERENCES players(id))`)
            .run(`CREATE TABLE IF NOT EXISTS matches(id INTERGER PRIMARY KEY, week INTERGER)`)

*/
db.serialize(() =>
{
    db.get("PRAGMA foriegn_keys = ON")
    .run(`CREATE TABLE IF NOT EXISTS players(id INTEGER PRIMARY KEY, handicap REAL, pickorder INTEGER, name TEXT)`)
    .run(`CREATE TABLE IF NOT EXISTS fantasy_user(id INTEGER PRIMARY KEY, total_fantasy_points INTEGER)`)
    .run(`CREATE TABLE IF NOT EXISTS fantasyhand(discord_id INTEGER, matchweek INTEGER, player1id INTEGER, player2id INTEGER, player3id INTEGER, player4id INTEGER, player5id INTEGER,
        FOREIGN KEY (discord_id) REFERENCES fantasy_user(id), 
        FOREIGN KEY (matchweek) REFERENCES matches(week), 
        FOREIGN KEY (player1id) REFERENCES players(id), 
        FOREIGN KEY (player2id) REFERENCES players(id), 
        FOREIGN KEY (player3id) REFERENCES players(id),
        FOREIGN KEY (player4id) REFERENCES players(id), 
        FOREIGN KEY (player5id) REFERENCES players(id))`)
    .run(`CREATE TABLE IF NOT EXISTS playerstats(playerid INTERGER, matchID INTERGER, week INTEGER,
    playerkills INTEGER, 
    playerdeaths INTEGER, 
    playerteamfight REAL,
    playergpm INTEGER,
    playerCS INTEGER,
    towerkills INTEGER,
    roshankills INTEGER,
    obs_placed INTEGER,
    camps_stacked INTEGER,
    runes INTEGER,
    first_blood INTEGER,
    stun_duration REAL,
    fantasy_points_gained REAL, 
    fantasy_points_loss REAL,  
    FOREIGN KEY(playerid) REFERENCES players(id),
    FOREIGN KEY(matchID) REFERENCES matches(id))`); 
});

db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });