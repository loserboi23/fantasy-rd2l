const sqlite3 = require('sqlite3');
const fs = require('fs');

const db = new sqlite3.Database("fantasy-database.db", (err) =>{
    if(err){
        console.log(err);
    }
    console.log("Connected to the database");
});


var string = [];


db.serialize(()=>
{
    db.each("SELECT * FROM playerstats p INNER JOIN (SELECT name, handicap, pick_order, id FROM players) s ON p.playerid = s.id WHERE p.week = 3", function(err,row)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            var temp = [
                row.name,
                row.matchID, 
                row.id,
                row.pick_order,
                row.week,
                row.playerkills , 
                row.playerdeaths , 
                row.playerteamfight,
                row.playergpm ,
                row.playerCS ,
                row.towerkills ,
                row.roshankills ,
                row.obs_placed ,
                row.camps_stacked ,
                row.runes ,
                row.first_blood ,
                row.stun_duration,
                row.fantasy_points_gained, 
                row.fantasy_points_loss ]
            var string = "";

            for(var i = 0; i < temp.length; i++)
            {
                if(i === temp.length - 1)
                {
                    string += temp[i] + "\n";
                }
                else
                {
                    string += temp[i] + ",";
                }
            }

            fs.appendFileSync("export.csv", string);
        }
    })
    

});


db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });