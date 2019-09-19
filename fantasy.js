const fetch = require('node-fetch');
const get_match = "https://api.opendota.com/api/matches/";
const sqlite3 = require('sqlite3').verbose();


    /*
    COMMANDS
    --------
    `play <join and insert to database>
    
    `pickcaptain <id>
    `pick1
    `pick2
    `pick3
    `pick4
    `pick <id><id><id><id><id>

    `currentpick 

    `playerlist
    `formula


    `record <matchid> <week> record the matchid
    `calculate <week_num>

    `captain_sheet
    `player_sheet
    `leaderboards_fantasy
    `leaderboards_players
    `help

    `github
    */


exports.importFantasyFromID = function(matchid, db, importToSqlite)
{
    fetch(get_match + matchid)
    .then(function(response)
    {
        return response.json();
    })
    .then(function(myJson){

        var matchstats = [];
        var string_to_send = "(0.3*kills) + **(5-(0.15*deaths))** + (5*teamfight_partipation) + (0.003*cs) + (0.002*gpm) + tower kills + roshan kills + " +
        "**(0.2*obs_wards_bought)** + (0.5*campstacked) + (0.25*runespicked) + firstbloodtaken + **(0.075*stun value)** \n";

        for(var i = 0; i < 10; i++)
        {
            var playerstats = [];
            var handicap;

            playerstats.push(myJson.players[i].account_id);
            playerstats.push(myJson.players[i].kills);
            playerstats.push(myJson.players[i].deaths);
            playerstats.push(myJson.players[i].teamfight_participation);
            playerstats.push(myJson.players[i].last_hits + myJson.players[i].denies );
            playerstats.push(myJson.players[i].gold_per_min);
            playerstats.push(myJson.players[i].tower_kills);
            playerstats.push(myJson.players[i].roshan_kills);

            if(myJson.players[i].purchase_ward_observer === undefined)
            {
                playerstats.push(0);
            }
            else
            {
                playerstats.push(myJson.players[i].purchase_ward_observer);
            }
            playerstats.push(myJson.players[i].camps_stacked);
            playerstats.push(myJson.players[i].rune_pickups);
            playerstats.push(myJson.players[i].firstblood_claimed);
            playerstats.push(myJson.players[i].stuns);

            var result = calculateFantasy(playerstats,string_to_send);

            string_to_send += result[0];
            playerstats.push(result[1]);
            matchstats.push(playerstats, string_to_send);
        }
        //console.log(matchstats);

        if (importToSqlite === true)
        {

        }
        
    });
}

exports.joinFantasy = function()
{

}

function importFantasytoDataBase(matchstats)
{
    db.serialize(()=>
    {

    });
}

function calculateFantasy(playerstats)
{

    //return an array
    //result[0] is the string to show calculation
    //result[1] is the actually result;

    var result = [];
    var points = 0; 
    string = "";
    var handicap;
    
    var temp = findPlayerIDInDatabase(playerstats[0]);

    temp.then(function(id)
    {
        string += "**" + id[0] + "**";
        handicap = id[1];
        for(var i = 0; i < fantasy.length; i++)
        {
            if(i === 2)
            {
                //deaths
                points += 5 + (playerstats[i+1]*fantasy[i]);
                string += "**(5 + (" + playerstats[i+1] + "*" + fantasy[i] + "))** + ";
            }
            else 
            {
                string += "**(" + playerstats[i+1] + "*" + fantasy[i] + ")** + ";
                points += playerstats[i+1] * fantasy[i];
            }
        }
    
    
        string += "=" + points.toFixed(2) + "*" + handicap + "= " + (points*handicap).toFixed(2);
        points = points*handicap.toFixed(2);
        string += "\n";
    
        result.push(string);
        result.push(points.toFixed(2));
        return result;
    },
    function(err)
    {
        console.log(err);
    });


    /*
    for(var i = 0; i < fantasy.length; i++)
    {
        if(i === 2)
        {
            //deaths
            points += 5 + (playerstats[i]*fantasy[i]);
            string += "**(5 + (" + playerstats[i] + "*" + fantasy[i] + "))** + ";
        }
        else if(i=== 0)
        {
            var temp = findPlayerIDInDatabase(playerstats[i]);
            string += "**" + temp[0] + "**";
            handicap = temp[1];
        }
        else 
        {
            string += "**(" + playerstats[i] + "*" + fantasy[i] + ")** + ";
            points += playerstats[i] * fantasy[i];
        }
    }


    string += "=" + points.toFixed(2) + "*" + handicap + "= " + (points*handicap).toFixed(2);
    points = points*handicap.toFixed(2);
    string += "\n";

    result.push(string);
    result.push(points.toFixed(2));

    return result;
    */
};

function findPlayerIDInDatabase(playerID)
{

    //return an array
    // 0 = string of the name
    // 1 = the handicap;
    return new Promise(function(resolve,reject)
    {
        stringArray = [];



        db.serialize( ()=> 
        {
            db.get("SELECT handicap, name FROM players where id =", playerID, function(err,row)
            {
                if (err)
                {
                    return console.log(err.message);
                    reject(err);
                }
                stringArray.push(row ? row.name + ":" : "Standin or not a Rd2l Player:");
                stringArray.push(row.handicap);
            });
        });

        db.close();
        resolve(stringArray);
    });
    
}

