const sqlite3 = require('sqlite3').verbose();
const fs = require("fs");


var db = new sqlite3.Database("fantasy-database.db", (err) =>
{
    if(err){
    return console.error(err.message);
    }
    console.log("Connected to the database");
});


//queries

//for export


db.serialize(()=>
{
    var sql = `SELECT players.name, players.handicap, players.id, playerstats.matchID, playerstats.week, playerstats.playerkills, playerstats.playerdeaths, playerstats.playerteamfight,
    playerstats.playergpm, playerstats.playerCS, playerstats.towerkills, playerstats.roshankills, playerstats.obs_placed, playerstats.camps_stacked, playerstats.runes, playerstats.first_blood,
    playerstats.stun_duration, playerstats.fantasy_points_loss, playerstats.fantasy_points_gained FROM players INNER JOIN playerstats ON (players.id = playerstats.playerid)`;

    db.each(sql, function(err,row)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            console.log(row);
        }
    })
})


db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });