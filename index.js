const Discord = require("discord.js");
const {token} = require("./config.json");
const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();
const fetch = require('node-fetch');
const cron = require('node-cron');



const get_match = "https://api.opendota.com/api/matches/";

const client = new Discord.Client();
const PREFIX = '`';

//STRINGS
var fantasy_string = fs.readFileSync('formula.txt');
var help_string = fs.readFileSync('helptext.txt');


var locked = false;
var current_week = 0;


//DISCORD CLIENT 
client.on('ready',() => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message=>{

    //FUNCTIONS FOR CLINET
    async function waitForFantasyCalculation(args,bool,week)
    {
        let clientMessage = await importFantasy(args, bool,week);
        message.channel.send(clientMessage);
    }

    async function waitForHandImportingOne(args,pick)
    {
        let calculateFantasy = await handPickOne(args,pick);
        message.channel.send(clientMessage);
    }
    async function waitForHandImportingAll(id1,id2,id3,id4,id5,dicordID)
    {
        let clientMessage = await handPickAll(id1,id2,id3,id4,id5,dicordID);
        message.channel.send(clientMessage);
    }
    async function playingWantingToPlay(discordID)
    {
       let clientMessage = await createFantasyUser(discordID);
       message.channel.send(clientMessage);
    }

    async function returnHand(discordID)
    {
        let clientMessage = await returnCurrentHand(discordID);
        message.channel.send(clientMessage);

    }



    //COMMANDS
    //if message doenst start with the prefeix just do nothing
    if (message.content[0] !== PREFIX)
    {
        return;
    }
    
    args = message.content.substring(PREFIX.length).split(" ");

    switch(args[0])
    {
        case "play":
            playingWantingToPlay(message.author.id);
            break;

        case "pick":
            waitForHandImportingAll(args[1],args[2],args[3],args[4],args[5],message.author.id)
            break;
        case "pickcaptain":
            waitForHandImportingOne(args[1],0,message.author.id);
            break;
        case "pick1":
            waitForHandImportingOne(args[1],1,message.author.id);
            break;
        case "pick2":
            waitForHandImportingOne(args[1],2,message.author.id);
            break;
        case "pick3":
            waitForHandImportingOne(args[1],3,message.author.id);
            break;
        case "pick4":
            waitForHandImportingOne(args[1],4,message.author.id);
            break;

        case "currentpick":
            returnHand(message.author.id);
            break;
        
        case "formula":
            message.author.send(formula_string);
            break;

        case "record":
            if(message.member.roles.find( x => x.name === 'fantasy-admin'))
                waitForFantasyCalculation(args[1],true,args[2]);
            else
                message.channel.send('You are not an admin and you are not kool. Use calculate to find theoritical points');
            break;

        case "calculate":
            waitForFantasyCalculation(args[1],false, 0);
            break;
        
        case "captain_sheet":
            message.reply("https://docs.google.com/spreadsheets/d/1My1y4EHpeKo4IL2mzhe7FJz2Fc0ELA7Sewyn1V2qAeg/edit#gid=1359480799");
            break;
            
        case "player_sheet":
            message.reply("https://docs.google.com/spreadsheets/d/1My1y4EHpeKo4IL2mzhe7FJz2Fc0ELA7Sewyn1V2qAeg/edit#gid=881390361");
            break;

        case "leaderboards_fantasy":
            break;
        case "leaderboards_players":
            break;

        case "github":
            message.reply("www.github.com");
            break;

        case "help":
            message.author.send(help_string);
            break;

        case "currentweek":
            message.reply(current_week);
            break;

        case "changeweek":
            if(message.member.roles.find( x => x.name === 'fantasy-admin'))
                current_week = args[1];
            else
                message.channel.send('haha u not an admin haha');
            break;

        case "disconnect":
            if(message.member.roles.find( x => x.name === 'fantasy-admin'))
                message.channel.send('disconnecting the bot');

            else
                message.channel.send('haha u not an admin haha');
            break;

    }
});

client.login(token);


//FUNCITONS


function importFantasy(matchID, bool, week)
{
    var string_to_send = "`";

    return new Promise (function(resolve,reject)
    {
        //formula to importing and calculating fantays points
        //parameters match id, bool 
        //return a string for discord to say
        //the bool is to import it to the database, users can use calcualte to find therotical or see random pubs score but won't import
    
        fetch(get_match + matchID).then(async function(response)
        {
            console.log("got it");
            return response.json();
        }).then(async function gettingMatchData(myJson)
        {
            var matchstats = [];
            var promiseArray = [];
            //console.log(myJson);
            for(var i = 0; i < myJson.players.length; i++)
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
                matchstats.push(playerstats);
    
                var result = calculateFantasy(playerstats);
                promiseArray.push(result);
            }
            Promise.all(promiseArray).then(function(results)
            {
                //console.log(results);
                for(var i = 0; i < results.length; i++)
                {

                    string_to_send += results[i][0];

                    for(var j = 1 ; j < 4; j++)
                    {
                        //console.log(results[i][j]);
                        matchstats[i].push(results[i][j]);
                    }


                }

                if(bool)
                {
                    var result = Promise.resolve(importToPlayerStats(matchstats,matchID,week));
                    //console.log(result);
                    result.then(function(results)
                    {
                        //console.log(results);
                        string_to_send += "`";
                        resolve(string_to_send);
                    });
                }
                else
                {
                    string_to_send += "`";
                    resolve(string_to_send);
                }
            });
        });
    });
}

function calculateFantasy(playerstats)
{
    //parameter array of player stats
    //returns string for discord to say
    //returns handicap if captain or 0
    //returns total fantasy points gained or lost
    //returns total fantasy points with handicap factored


    return new Promise(function(resolve,reject)
    {
        var result = [];
        var handicap;
        var points =0;
        var pointsLost;
        const fantasy = [
            0.3, //kills
            -0.15, //deaths
            5, //teamfight 
            0.003, //creep score
            0.002, //gpm
            1, //tower
            1, //roshan
            0.2, //obs wards
            0.5, //camp stack
            0.25, //runes
            4, //fb
            0.075 // stunval
            ];
    
    
    
        const db = new sqlite3.Database("fantasy-database.db", (err) =>{
            if(err){
                console.log(err);
            }
            //console.log("Connected to the database");
        });
        
        db.serialize( ()=>
        {
            db.get("SELECT handicap, name FROM players WHERE id = ?", playerstats[0], function(err,row)
            {
                string = "";
                if (err)
                {
                    return console.log(err.message);
                }
                string += row ? row.name + ":" : "Anon: ";
                handicap = row ? row.handicap : 0;

                //console.log(string);
    
                for(var i = 0; i < fantasy.length; i++)
                {
                    if(i === 1)
                    {
                        //deaths
                        points += 5 + (playerstats[i+1]*fantasy[i]);
                        string += "(5 + (" + playerstats[i+1] + "*" + fantasy[i] + ")) + ";
                    }
                    else 
                    {
                        string += "(" + playerstats[i+1] + "*" + fantasy[i] + ") + ";
                        points += playerstats[i+1] * fantasy[i];
                    }
                }
            
            
                string += "=" + points.toFixed(2) + "*" + (1+handicap) + "= " + (points*(1+handicap)).toFixed(2);

                if(handicap >= 0)
                {
                    pointsLost = points*(handicap);
                }
                else
                {
                    pointsLost = points*(1-(1+handicap));
                }

                points = (points*(1+handicap)).toFixed(2);


                string += " \n";
    
                //console.log(string);
                result.push(string);
                result.push(handicap);
                result.push(pointsLost);
                result.push(points);
    
                //console.log(result);
                resolve(result);
            })
        });
    
        db.close((err) => {
            if (err) {
              return console.error(err.message);
            }
            //console.log('Close the database connection.');
          });
    });
}

function importToPlayerStats(matchstats, matchID,week)
{
    return new Promise(function(resolve,reject)
    {
        const db = new sqlite3.Database("fantasy-database.db", (err) =>{
            if(err){
                console.log(err);
            }
            //console.log("Connected to the database");
        });


        db.serialize( ()=>
        {
            var stmt = db.prepare(`INSERT INTO playerstats(playerid, matchid, playerkills, playerdeaths, 
                                playerteamfight, playergpm, playerCS, towerkills, 
                                roshankills, obs_placed, camps_stacked, runes, 
                                first_blood, stun_duration, fantasy_points_gained, fantasy_points_loss, week)
                                VALUES (?,?,?,?
                                        ,?,?,?,?
                                        ,?,?,?,?,
                                        ?,?,?,?,?)`);


            // 4 and 5 are swapped because i messed up
            for(var i = 0; i < matchstats.length; i++)
            {
                stmt.run(matchstats[i][0], matchID, matchstats[i][1], matchstats[i][2], matchstats[i][3], matchstats[i][5], matchstats[i][4], matchstats[i][6], 
                    matchstats[i][7], matchstats[i][8], matchstats[i][9], matchstats[i][10], matchstats[i][11], matchstats[i][12],matchstats[i][16],matchstats[i][15], week);
            }

            stmt.finalize();

            resolve("ThumbsUp");
        });

        db.close((err) => {
            if (err) {
              return console.error(err.message);
            }
            //console.log('Close the database connection.');
          });
    });
}
function createFantasyUser(discordID)
{
    //returns a string
    // if not in database it will put the user in the database

    return new Promise(function(resolve,reject)
    {
        const db = new sqlite3.Database("fantasy-database.db", (err) =>{
            if(err){
                console.log(err);
            }
            //console.log("Connected to the database");
        });


        db.serialize(()=>
        {
                playingCheck(discordID).then((results)=>{
                db.run('INSERT INTO fantasy_user(id , total_fantasy_points) VALUES (?,?)', [discordID,0], function(err)
                {
                    if(err)
                    {
                        return console.log(err);
                    }
                    resolve("You are added for fantasy league");
                    db.close((err) => {
                        if (err) {
                          return console.error(err.message);
                        }
                        console.log('Close the database connection.');
                      });
                });
            }).catch((err)=>
            {
                resolve("You are already in this");
                db.close((err) => {
                    if (err) {
                      return console.error(err.message);
                    }
                    //console.log('Close the database connection.');
                  });
            });


        });
    });
}


function handPickAll(captainid, player1id, player2id, player3id, player4id,discordID)
{
    return new Promise(function(resolve,reject)
    {
        const db = new sqlite3.Database("fantasy-database.db", (err) =>{
            if(err){
                console.log(err);
            }
            //console.log("Connected to the database");
        });
    
        
        const sqlCheck = playingCheck(discordID);
        
        sqlCheck.then((results)=>
        {
            //The player is not playing

            resolve("You are not playing use command `play to join");
            db.close((err) => 
            {
                if (err) 
                {
                  return console.error(err.message);
                }
                //console.log('Close the database connection.');
            });

        }).catch((err)=>
        {
            //The Player is playing
            checkPickAll(captainid, player1id, player2id, player3id, player4id,discordID).then((results)=>
            {
                var differentcheck = results[0][1] != results[1][1] != results[2][1] != results[3][1] != results[4][1];
                if(differentcheck)
                {
                    var isFanasyHandThere = handCheck(discordID,current_week);

                    isFanasyHandThere.then((results)=>
                    {
                        //is there
                        updateHandAll(discordID,current_week,captainid, player1id, player2id, player3id, player4id,discordID).then((results)=>
                        {
                            resolve("Updated your predictions");
                            db.close((err) => {
                                if (err) {
                                  return console.error(err.message);
                                }
                              });
                        }).catch((err)=>
                        {
                            resolve("Couldn't update your predictions");
                        });
                        

                    }).catch((err)=>
                    {
                        //not there
                        console.log("making hand");
                        const hand = makeHand(discordID,current_week);

                        hand.then((results)=>
                        {
                            updateHandAll(discordID,current_week,captainid, player1id, player2id, player3id, player4id,discordID).then((results)=>
                            {
                                resolve("Made new predictions for full team");
                                db.close((err) => {
                                    if (err) {
                                      return console.error(err.message);
                                    }
                                    //console.log('Close the database connection.');
                                  });
                            }).catch((err)=>
                            {
                                resolve("Couldn't update your predictions");
                            });
                        });

                    });
                }
                else
                {
                    resolve("You picked players that had the same pickorder");
                    db.close((err) => 
                    {
                        if (err) {
                          return console.error(err.message);
                        }
                        //console.log('Close the database connection.');
                    });
                }
            });
        });
    });
}

function handPickOne(playerid, pick)
{
    return new Promise(function(resolve,reject)
    {
        const db = new sqlite3.Database("fantasy-database.db", (err) =>{
            if(err){
                console.log(err);
            }
            //console.log("Connected to the database");
        });

        db.serialize(()=>
        {
            var sqlQuery = checkDatabase();
            checkDatabase.then((results)=>
            {
                //check if the hand is there
                handCheck(discordID,current_week).then((results)=>
                {
                    updateOne(discordID,current_week,playerid,pick).then((results)=>
                    {

                        db.close((err) => {
                            if (err) {
                              return console.error(err.message);
                            }
                            //console.log('Close the database connection.');
                          });
                    }).catch((err)=>
                    {

                        db.close((err) => {
                            if (err) {
                              return console.error(err.message);
                            }
                            //console.log('Close the database connection.');
                          });
                    });

                }).catch((err)=>
                {
                    makeHand(discordID,current_week).then((results)=>
                    {
                        updateOne(discordID,current_week,playerid,pick).then((results)=>
                        {


                            db.close((err) => {
                                if (err) {
                                  return console.error(err.message);
                                }
                                //console.log('Close the database connection.');
                              });

                        }).catch((err)=>
                        {


                            db.close((err) => {
                                if (err) {
                                  return console.error(err.message);
                                }
                                //console.log('Close the database connection.');
                              });
                        });

                    }).catch((err)=>
                    {


                        db.close((err) => {
                            if (err) {
                              return console.error(err.message);
                            }
                            //console.log('Close the database connection.');
                          });
                    })
                });

            }).catch((err)=>
            {
                resolve(err);
                db.close((err) => {
                    if (err) {
                      return console.error(err.message);
                    }
                    //console.log('Close the database connection.');
                  });
            });
        });
    });  
}

function insertFantasyPointsUser(discordID, week)
{
    return new Promise(function(resolve,reject)
    {
        const db = new sqlite3.Database("fantasy-database.db", (err) =>{
            if(err){
                console.log(err);
            }
            //console.log("Connected to the database");
        });


        var selectQuery = function()
        {
            return new Promise(function(resolve,reject)
            {
                db.serialize(()=>
                {
                    var sql = `SELECT playerstats.fantasy_points_gained FROM fantasy_user INNER JOIN fantasyhand ON (fantasy_user.id = fantasyhand.discord_id)
                    INNER JOIN playerstats ON 
                    (playerstats.playerid = fantasyhand.player1id)
                    (playerstats.playerid = fantasyhand.player2id)
                    (playerstats.playerid = fantasyhand.player3id)
                    (playerstats.playerid = fantasyhand.player4id)
                    (playerstats.playerid = fantasyhand.player5id) WHERE (fantasy_user.id = ?) AND (fantasy_hand.matchweek = ?)`;
        
                    db.each(sql, [discordID,week],function(err,row)
                    {
                        if(err)
                        {
                            reject(err);
                        }
                        else
                        {
                            console.log(row);
                            resolve("d");
                        }
                    });
        
                });
            })
        }


        


        db.close((err) => {
            if (err) {
              return console.error(err.message);
            }
            //console.log('Close the database connection.');
          });

    });  
}

function playingCheck(discordID)
{
    //check if the user is in the fantasyleague database
    // resolve is not in it
    // reject is in it

    return new Promise(function(resolve,reject)
    {

        const db = new sqlite3.Database("fantasy-database.db", (err) =>{
            if(err){
                console.log(err);
            }
            //console.log("Connected to the database");
        });

        db.serialize (()=>
        {
            db.get('SELECT id FROM fantasy_user WHERE id = ?', discordID, function(err,row)
            {
                if(err)
                {
                    console.log(err);
                }
    
                if(row !== undefined)
                {
                    //console.log(row);
                    reject("You already in this");
                }
                else
                {
                    resolve("Adding you in");
                }
            });
        });

        db.close((err) => {
            if (err) {
              return console.error(err.message);
            }
            //console.log('Close the database connection.');
          });
    });
};


function handCheck(discordID,week)
{
    //to see if the hand is in there to check if we need to insert or update

    //reject if not there
    // resolive is in there

    return new Promise(function(resolve,reject)
    {
        const db = new sqlite3.Database("fantasy-database.db", (err) =>{
            if(err){
                console.log(err);
            }
            //console.log("Connected to the database");
        });

        db.serialize(()=>
        {
            db.get('SELECT * FROM fantasyhand WHERE (discord_id = ?) AND (matchweek = ?)',[discordID,week],function(err,row)
            {
                if(err)
                {
                    console.log(err);
                }
    
                if(row !== undefined)
                {
                    reject("You already in this");
                }
                else
                {
                    resolve("Adding you in");
                }
            });
        });

        db.close((err) => {
            if (err) {
              return console.error(err.message);
            }
            //console.log('Close the database connection.');
          });
    });
}

function makeHand(discordID, week)
{
    //Insert query

    return new Promise(function(resolve,reject)
    {
        const db = new sqlite3.Database("fantasy-database.db", (err) =>{
            if(err){
                console.log(err);
            }
            //console.log("Connected to the database");
        });

        db.serialize(()=>
        {
            db.run('INSERT INTO fantasyhand(discordid, matchweek ) VALUES (?,?)', [discordID, week], function(err)
            {
                if(err)
                {
                    console.log(err);
                    reject(err);
                }
                else
                {
                    resolve("It is in");
                }
            });
        });

        db.close((err) => {
            if (err) {
              return console.error(err.message);
            }
            //console.log('Close the database connection.');
          });
    });
}

function updateHandAll(discordID, week, captainID, playerOneID, playerTwoID, playerThreeID, playerFourID )
{
    return new Promise(function(resolve,reject)
    {
        const db = new sqlite3.Database("fantasy-database.db", (err) =>{
            if(err){
                console.log(err);
            }
            //console.log("Connected to the database");
        });

        db.serialize(()=>
        {
            db.run('UPDATE fantasyhand SET player1id = ?, player2id = ?, player3id = ?, player4id = ? , player5id= = ? WHERE (discord_id = ?) AND (matchweek  = ?)',
            [captainID, playerOneID, playerTwoID, playerThreeID, playerFourID, discordID, week], function(err)
            {
                if(err)
                {
                    console.log(err);
                    reject(err);
                }
                else
                {
                    resolve("updated successfully");
                }
            });
        });

        db.close((err) => {
            if (err) {
              return console.error(err.message);
            }
            //console.log('Close the database connection.');
          });
    });
}



function updateOne(discordID,week, playerID, pickorder)
{
    return new Promise(function(resolve,reject)
    {
        const db = new sqlite3.Database("fantasy-database.db", (err) =>{
            if(err){
                console.log(err);
            }
            //console.log("Connected to the database");
        });

        db.serialize(()=>
        {
            var sql = '';
            switch(pickorder){
                case 0:
                    sql = 'UPDATE fantasyhand SET player1id = ? WHERE (discord_id = ?) AND (matchweek  = ?)';
                    break;
                case 1:
                    sql = 'UPDATE fantasyhand SET player2id = ? WHERE (discord_id = ?) AND (matchweek  = ?)';
                    break;
                case 2:
                    sql = 'UPDATE fantasyhand SET player3id = ? WHERE (discord_id = ?) AND (matchweek = ?)';
                    break;
                case 3:
                    sql = 'UPDATE fantasyhand SET player4id = ? WHERE (discord_id = ?) AND (matchweek  = ?)';
                    break;
                case 4:
                    sql = 'UPDATE fantasyhand SET player5id = ? WHERE (discord_id = ?) AND (matchweek  = ?)';
                    break;
            }

            db.run(sql,[playerID, discordID, week],function(err)
            {
                if(err)
                {
                    console.log(err);
                    reject(err);
                }
                else
                {
                    resolve("updated successfully");
                }
            });
        });

        db.close((err) => {
            if (err) {
              return console.error(err.message);
            }
            //console.log('Close the database connection.');
          });
    });
}


function retrieveFantasyHand(discordID, week)
{
    return new Promise(function(resolve,reject)
    {
        const db = new sqlite3.Database("fantasy-database.db", (err) =>{
            if(err){
                console.log(err);
            }
            //console.log("Connected to the database");
        });



        db.serialize(()=>
        {
            db.get('SELECT * FROM fantasyhand WHERE (discord_id = ?) AND (matchweek  = ?)',[discordID,week],function(err,row)
            {
                if(err)
                {
                    console.log(err);
                    reject(err);
                }
                else
                { 
                    resolve(row);
                } 
            });

        });

        db.close((err) => {
            if (err) {
              return console.error(err.message);
            }
            //console.log('Close the database connection.');
          });
    });
}

function checkPickAll(captainid, player1id, player2id,player3id,player4id)
{
    return new Promise(function(resolve,reject)
    {
        const db = new sqlite3.Database("fantasy-database.db", (err) =>{
            if(err){
                console.log(err);
            }
            //console.log("Connected to the database");
        });

        var results = [];
        db.serialize(()=>{

            db.each('SELECT * FROM players WHERE (id = ?) OR (id = ?) OR (id = ?) OR (id = ?) OR (id = ?)', [captainid, player1id, player2id, player3id, player4id], (err,row)=>
            {
                if(err)
                {
                    console.log(err);
                    reject(err);
                }

                var temp = [];
                temp.push(row.id);
                temp.push(row.pickorder);
                temp.push(row.name);
                results.push(temp);

                if(results.length == 5)
                {
                    resolve(results);
                }
            });      
        });

        db.close((err) => {
            if (err) {
              return console.error(err.message);
            }
            //console.log('Close the database connection.');
          });
    });
}

function checkIDEqualPickOrder(id, pickorder)
{
    return new Promise(function(resolve,reject)
        {
            db.serialize(()=>{

                db.get('SELECT * FROM players WHERE (id = ?)', [id], (err,row)=>
                {
                    if(err)
                    {
                        console.log(err);
                        reject(err);
                    }
                    else
                    {
                        if(row.pickorder === pickorder)
                        {
                            reject("Pickorder is wrong");
                        }
                        else
                        {
                            resolve(row);
                        }
                    }
                });      
            });
        });
}
