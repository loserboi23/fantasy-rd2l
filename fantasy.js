const fetch = require('node-fetch');
const sqlite = require('./sqlite.js');



exports.createFantasyUser = function(discordID, discordName)
{
    //returns a string

    return new Promise(function(resolve,reject)
    {
        var sqlInsert = 'INSERT INTO fantasy_user(id , name, total_fantasy_points) VALUES (?,?,?)';
        var sqlSelect = 'SELECT id FROM fantasy_user WHERE id = ?';

        sqlite.selectQuery(sqlSelect, [discordID]).then((results)=>
        {
            if(results.length === 0)
            {
                //Means the user is not in the database so we say hes not in it and we create
                sqlite.insertQuery(sqlInsert, [discordID, discordName, 0]).then((results)=>
                {
                    resolve("You have now been added to the fantasy dota 2 league.")

                }).catch((err)=>
                {
                    console.log(err);
                });
            }
            else
            {              
                //Means the user is in the database so we say hes already in it.
                console.log(results);
                resolve("You are already in this");
            }

        }).catch((err)=>
        {
            resolve("Something wrong");
        });
        
    });
}

exports.pickingAllFive = function(discordID, week, captainid, player1id, player2id, player3id, player4id)
{

    return new Promise(function(resolve,reject)
    {
        var findFantasyUser = 'SELECT * FROM fantasy_user WHERE (id = ?)';
        var makeSurePlayerIDsValid = 'SELECT * FROM players WHERE (id = ?) OR (id = ?) OR (id = ?) OR (id = ?) OR (id = ?)';
        var ifFantasyHand = "SELECT * FROM fantasyhand WHERE (discord_id =?) AND (matchweek = ?)"
        var updateFantasyHand = 'UPDATE fantasyhand SET player1id = ?, player2id = ?, player3id = ?, player4id = ? , player5id = ? WHERE (discord_id = ?) AND (matchweek  = ?)';
        var createFantasyHand = 'INSERT INTO fantasyhand(discord_id, matchweek, player1id, player2id, player3id, player4id, player5id) VALUES (?,?,?,?,?,?,?)';



        sqlite.selectQuery(findFantasyUser, [discordID]).then((selectResults) =>
        {
            //If the fantasy user is in it

            if(selectResults.length === 0)
            {
                resolve('You are not in the database, use command `play to join')
            }      
            else
            {
                sqlite.selectQuery(makeSurePlayerIDsValid,[captainid, player1id, player2id, player3id, player4id]).then((results)=>
            {
                //If the query is valid

                console.log(results);
                if (results.length === 5)
                {
                    var differentCheck = results[0][2] !== results[1][2] !== results[2][2] !== results[3][2] !== results[4][2];

                    if(differentCheck)
                    {
                        //Check if fantasy hand is there
                        sqlite.selectQuery(ifFantasyHand, [discordID,week]).then((selectResults)=>
                        {

                            if (selectResults.length === 0)
                            {
                                    //Hand is not there, we need to create
                                sqlite.insertQuery(createFantasyHand, [discordID,week,captainid,player1id,player2id,player3id,player4id]).then(()=>
                                {
                                    resolve("Created your fantasy hand");
                                }).catch((err1)=>
                                {
                                    console.log(err1);
                                    resolve("Something is wrong");
                                })
                            }
                            else
                            {
                                //Hand is there we need to update
                                sqlite.updateQuery(updateFantasyHand, [captainid, player1id, player2id, player3id, player4id, discordID, week]).then(()=>
                                {
                                    resolve("Updated your fantasy hand");

                                }).catch((err2)=>
                                {
                                    console.log(err2);
                                    resolve("Something is wrong");
                                })
                            }

                        }).catch((selecterr)=>
                        {
                            console.log(selecterr);
                            resolve("Something wwrong")
                        })

                    }
                    else
                    {
                        console.log("Some of the players have the same pick order");
                        resolve("Some of the players have the same pick order");
                    }
                }
                else
                {
                    console.log("ID's are not valid and/or you didn't give out 5 ID's");
                    resolve("ID's are not valid and/or you didn't give out 5 ID's");
                }

            }).catch(()=>
            {
                //If the query is not valid, the 5 ids
                resolve("Something wrong");
            })

            }

        }).catch((selectErr)=>
        {
            //If the fantasy user is not in the database
            resolve("Something Wrong");

        });

    });
}

exports.pickingIndividual = function(discordID, week, playerid, picknum)
{
    return new Promise(function(resolve,reject)
    {
        var findFantasyUser = 'SELECT * FROM fantasy_user WHERE (id = ?)';
        var makeSurePlayerIDsValid = 'SELECT * FROM players WHERE (id = ?) AND (pick_order = ?)';
        var checkFantasyHand = 'SELECT * FROM fantasyhand WHERE (discord_id = ?) AND (matchweek = ?)';

        sqlite.selectQuery(findFantasyUser,[discordID]).then((selectResults)=>
        {
            //Fantasy User is in the database

            if(selectResults.length === 0)
            {
                resolve('You are not in the database, use command `play to join');
            }
            else
            {
                
            sqlite.selectQuery(makeSurePlayerIDsValid,[playerid,picknum]).then((results)=>
            {
                //make sure the playerid is valid
                if(results.length === 0)
                {
                    resolve("Invalid ID");
                }
                else
                {
                    //checks if fantays hand is there
                    sqlite.selectQuery(checkFantasyHand,[discordID,week]).then((selectresults)=>
                    {
                        if(selectresults.length === 1)
                        {
                            //fantasy hand is there we update
                            switch(picknum)
                            {
                                case 0: 
                                    var updateFantasyHand = 'UPDATE fantasyhand SET player1id = ? WHERE (discord_id = ?) AND (matchweek  = ?)';
                                    break;
                                case 1: 
                                    var updateFantasyHand = 'UPDATE fantasyhand SET player2id = ? WHERE (discord_id = ?) AND (matchweek  = ?)';
                                    break;
                                case 2: 
                                    var updateFantasyHand = 'UPDATE fantasyhand SET player3id = ? WHERE (discord_id = ?) AND (matchweek  = ?)';
                                    break;
                                case 3: 
                                    var updateFantasyHand = 'UPDATE fantasyhand SET player4id = ? WHERE (discord_id = ?) AND (matchweek  = ?)';
                                    break;
                                case 4: 
                                    var updateFantasyHand = 'UPDATE fantasyhand SET player5id = ? WHERE (discord_id = ?) AND (matchweek  = ?)';
                                    break;          
                            };
    
                            sqlite.updateQuery(updateFantasyHand, [playerid, discordID, week]).then(()=>
                            {
                                resolve("Your hand has been updated");
    
                            }).catch((updateErr)=>
                            {
                                console.log(updateErr);
                            })
                        }
                        
                        else
                        {
                        //fantasy hand is not there we insert
                        switch(picknum)
                        {
                            case 0: 
                                var createFantasyHand = 'INSERT INTO fantasyhand(discord_id, matchweek, player1id) VALUES (?,?,?)';
                                break;
                            case 1: 
                                var createFantasyHand = 'INSERT INTO fantasyhand(discord_id, matchweek, player2id) VALUES (?,?,?)';
                                break;
                            case 2: 
                                var createFantasyHand = 'INSERT INTO fantasyhand(discord_id, matchweek, player3id) VALUES (?,?,?)';
                                break;
                            case 3: 
                                var createFantasyHand = 'INSERT INTO fantasyhand(discord_id, matchweek, player4id) VALUES (?,?,?)';
                                break;
                            case 4: 
                                var createFantasyHand = 'INSERT INTO fantasyhand(discord_id, matchweek, player5id) VALUES (?,?,?)';
                                break;          
                        };

                            sqlite.insertQuery(createFantasyHand, [discordID, week, playerid]).then(()=>
                            {
                                resolve("Your hand has been created");
                            }).catch((insertErr)=>
                            {
                                console.log(insertErr);
                            });

                        }

                    }).catch(()=>{

                        resolve("Something wrong")
                    })
                }

            }).catch(()=>
            {
                //sql for makesurepkayerid is wrong
                resolve("Something wrong");
            })
            }

        }).catch(()=>
        {
            //Fantasy User is not in the database
            resolve("Something Wrong");
        })




    });
}

exports.calculateAllFantasyPoints = function(week)
{
    return new Promise(function(resolve,reject)
    {
        var selectAllFantasyHandInWeek =  `SELECT discord_id, SUM(fantasy_points_gained) as total_points FROM fantasyhand fh INNER JOIN (SELECT fantasy_points_gained, playerid, week FROM playerstats) ps ON (fh.player1id = ps.playerid) OR (fh.player2id = ps.playerid)
        OR (fh.player3id = ps.playerid) OR (fh.player4id = ps.playerid) OR (fh.player5id = ps.playerid) INNER JOIN (SELECT name, id FROM players) p ON (p.id = ps.playerid) WHERE (fh.matchweek = ?) AND (ps.week = ?) GROUP BY discord_id`;

        sqlite.selectQuery(selectAllFantasyHandInWeek,[week,week]).then((results)=>
        {
            var promiseArray = [];

            for(var i = 0; i < results.length; i++)
            {
                //console.log(results[i].discord_id);
                //console.log(parseFloat(results[i]['SUM(fantasy_points_gained)'].toFixed(2)));
                var sum = parseFloat(results[i]['total_points'].toFixed(2));
                var promise = fantasyUpdate(results[i]['discord_id'], sum , week);
                promiseArray.push(promise);
            }

            Promise.all(promiseArray).then(()=>
            {
                resolve("Points have been given for week: " + week);

            }).catch(()=>
            {
                resolve("Something wrong");
            })


        }).catch((err)=>
        {
            resolve("Something wrong;")
        })


    });
}

function fantasyUpdate(discord_id, points,week)
{
    return new Promise(function(resolve, reject)
    {
        var updateFantasyHands = `UPDATE fantasyhand SET pointsGained = ? WHERE (discord_id = ?) AND (matchweek = ?)`; 
        var updateFantasyUser = `UPDATE fantasy_user SET total_fantasy_points = (SELECT SUM(pointsGained) FROM fantasyhand WHERE discord_id = ?) WHERE id = ?`;

        sqlite.updateQuery( updateFantasyHands,[points, discord_id,week]).then(()=>
        {
            sqlite.updateQuery(updateFantasyUser, [discord_id,discord_id]).then(()=>
            {
                resolve("Added");

            }).catch(()=>
            {
                reject("Something wrong");
            })

        }).catch(()=>
        {
            reject("Something wrong");   
        })
    })
}


exports.importFantasy = function(matchID, bool, week)
{

    return new Promise(function(resolve,reject)
    {
        var string_to_send = "` (kills + deaths + teamfight + cs + gpm + towers + roshan + obs_placed + camps_stack + runes + fb + stuns) * (captainhandicap) \n\n";

        fetch("https://api.opendota.com/api/matches/" + matchID).then(function(response)
        {
            console.log("Got it " + matchID);
            return response.json();
        }).then(function (myJson)
        {
            var matchstats = [];
            var promiseArray = [];
    
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
                for(var i = 0; i < results.length; i++)
                {
                    string_to_send += results[i][2];
                    matchstats[i].push(results[i][0]);
                    matchstats[i].push(results[i][1]);
                    matchstats[i].push(week);
                    matchstats[i].push(matchID);
                }

                string_to_send += '`';
    
                if(bool === true)
                {

                    sqlSelect = `SELECT * FROM playerstats WHERE matchID = ?`;

                    sqlite.selectQuery(sqlSelect,[matchID]).then((sResults)=>
                    {
                        console.log(sResults);
                        if(sResults.length === 0)
                        {
                            sqlInsert = `INSERT INTO playerstats(playerid, playerkills, playerdeaths, playerteamfight, playerCS, playergpm, towerkills, roshankills, obs_placed, 
                                camps_stacked, runes, first_blood, stun_duration, fantasy_points_gained, fantasy_points_loss, week, matchID) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        
                            sqlite.massInsertQuery(sqlInsert,matchstats).then(()=>
                            {
                                resolve("Inserted MatchID " + matchID);
        
                            }).catch(()=>
                            {
                                resolve("Something wrong");
                            })
                        }
                        else
                        {
                            resolve("Match ID " + matchID + " Already In There");
                        }


                    }).catch(()=>
                    {
                        resolve("Something wrong");
                    })
    
                }
                else
                {
                    resolve(string_to_send);
                }
    
            }).catch((err)=>
            {
                resolve("Something wrong");
            });
    
        });
    });
}

function calculateFantasy(playerstats)
{
    //return an array
    //element 0 returns fantasy_points_total;
    //element 1 returns fantasy_points_loss;
    //element 2 returns a string for the clientMessage


    return new Promise(function(resolve,reject)
    {        
        var getIDandHandicap = "SELECT handicap, name FROM players WHERE id = ?";

        sqlite.selectQuery(getIDandHandicap, [playerstats[0]]).then((results)=>
        {
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

            var arraytoSend = [];
            var points = 0;
            var pointsLost;
            var stringtosend = "";
            var name;
            var handicap;

            if(results.length === 0)
            {
                name = "ANON";
                handicap = 0;
            }
            else
            {
                name = results[0].name;
                handicap = results[0].handicap;
            }
            stringtosend += name + "  :  ";

            for (var i = 0; i < fantasy.length; i++)
            {
                if(i === 1)
                {
                    //deaths
                    points += 3 + (playerstats[i+1]*fantasy[i]);
                    //stringtosend += "(5 + (" + playerstats[i+1] + "*" + fantasy[i] + ")) + ";
                    stringtosend += (3 + (playerstats[i+1]*fantasy[i])).toFixed(2) + " + ";
                }
                else if(i === fantasy.length-1)
                {
                    points += playerstats[i+1] * fantasy[i];
                    stringtosend += (playerstats[i+1] * fantasy[i]).toFixed(2);
                }
                else 
                {
                    points += playerstats[i+1] * fantasy[i];
                    //stringtosend += "(" + playerstats[i+1] + "*" + fantasy[i] + ") + ";
                    stringtosend += (playerstats[i+1] * fantasy[i]).toFixed(2) + " + ";
                }
            }

            stringtosend += " = " + points.toFixed(2) + " * " + (1+handicap) + " = " + (points*(1+handicap)).toFixed(2);              
            pointsLost = (points*(handicap)).toFixed(2);
            
            points = (points*(1+handicap)).toFixed(2);
            stringtosend +=" \n\n";
            arraytoSend.push(points);
            arraytoSend.push(pointsLost);
            arraytoSend.push(stringtosend);
            resolve(arraytoSend);

        }).catch((err)=>
        {
            reject("Something wrong");
        })
    })
}

exports.showFantasyHand = function(discordID, week)
{
    return new Promise(function(resolve,reject)
    {
        var findFantasyHand = 'SELECT player1id, player2id, player3id, player4id, player5id FROM fantasyhand WHERE (discord_id = ?) AND (matchweek = ?)';
        var findPlayerName = 'SELECT name, pick_order FROM players WHERE (id = ?) OR (id = ?) OR (id = ?) OR (id = ?) OR (id = ?)'; 
        var playerNames =[];
        
        sqlite.selectQuery(findFantasyHand, [discordID, week]).then((results)=>
        {
            console.log(results);
            if (results.length === 0)
            {
                resolve("You don't have anyone in your hand this week");
            }
            else
            {   
                var myprop = 'player';
                var endprop = 'id';
                var temp = [];
    
                for (var i = 1; i < 6; i++)
                {
                    var property = myprop + i + endprop;
                    var bool = results[0].hasOwnProperty(property);
    
                    if(bool)
                    {
                        temp.push(results[0][property]);
                    }
                }


                sqlite.selectQuery(findPlayerName,temp).then((nameResults)=>
                {
                    var stringArray = ['NULL','NULL','NULL','NULL','NULL'];
                    var string = '';
    
                    for(var i = 0; i < nameResults.length; i++)
                    {
                        stringArray[nameResults[i].pick_order] = nameResults[i].name;
                    }
    
                    for(var i = 0; i < stringArray.length; i++)
                    {
                        string += stringArray[i] + ' ';
                    }
    
                    resolve(string);
    
                }).catch((nameErr)=>
                {
                    resolve("Something wrong");
                })
            }
        }).catch((err)=>
        {
            console.log(err);
            resolve("Something is wrong");4

        });

    });
}


exports.getTotalPoints = function(discordID)
{
    return new Promise(function(resolve,reject)
    {
        sql = `SELECT name, total_fantasy_points FROM fantasy_user WHERE (id = ?)`;

        sqlite.selectQuery(sql, [discordID]).then((result)=>
        {
            if (result[0].length === 0)
            {
                resolve("Not there you proberly not playing, user command `play to join")
            }
            else
            {
                resolve("Total Points " +  result[0].name + " has : " + result[0].total_fantasy_points.toFixed(2));
            }
    
        }).catch(()=>
        {
            resolve("Something wrong");
        });
    })
}

exports.getPointsInWeek = function(discordID, week)
{


    return new Promise(function(resolve,reject)
    {
        sql = `SELECT pointsGained FROM fantasyhand WHERE (discord_id = ?) AND (matchweek = ?)`;

        sqlite.selectQuery(sql, [discordID,week]).then((result)=>
        {
            if (result.length === 0)
            {
                resolve("Not there you proberly not playing, or you didn't create one during this week");
            }
            else
            {
                resolve("Week " + week + " : " + result[0].pointsGained);
            }
    
        }).catch(()=>
        {
            resolve("Something wrong");
        });
    })
}


exports.changeName = function(discordID, newName)
{
    return new Promise(function(resolve,reject)
    {
        var sql = `UPDATE fantasy_user SET name = ? WHERE id = ?`;

        sqlite.updateQuery(sql, [newName, discordID]).then(()=>
        {
            resolve("Your name is now : " + discordID);

        }).catch(()=>
        {
            resolve("Something wrong");
        })
    });
}

exports.leaderboards = function()
{
    return new Promise(function(resolve,reject)
    {
        string = "\n ";
        var sql = `SELECT * FROM fantasy_user ORDER BY total_fantasy_points DESC`;

        sqlite.selectQuery(sql).then((results)=>
        {
            results.forEach(function(element)
            {
                string += element.name + ": "  + element.total_fantasy_points.toFixed(2) + " \n";
            })

            resolve(string);

        }).catch(()=>
        {
            resolve("Something wrong");
        })        
    });
}

exports.breakdown = function(discordID, week)
{
    return new Promise(function(resolve,reject)
    {
        if(week === undefined)
        {
            resolve("Command is `breakdown <week>");
        }
        else
        {
            sqlite.selectQuery(`SELECT p.name, p.id FROM fantasyhand fh INNER JOIN (SELECT name, id, pick_order FROM players) p ON fh.player1id = p.id OR fh.player2id = p.id 
            OR fh.player3id = p.id OR fh.player4id = p.id OR fh.player5id = p.id  WHERE  (fh.matchweek = ?) AND (fh.discord_id = ?) GROUP BY p.pick_order`,[week,discordID]).then((results)=>
            {
                if(results.length === 0)
                {
                    resolve("You didn't have a hand this week");
                }
                else
                {
                    var promise = [];
                    results.forEach(element => {
                        pro = sqlite.selectQuery(`SELECT SUM(fantasy_points_gained) as sum FROM playerstats WHERE (playerid = ?) AND (week = ?)`,[element['id'], week]); 
                        promise.push(pro);
                    });
                
                    Promise.all(promise).then((sumresult)=>
                    {
                        sumresult.forEach(element =>{
                            if(element[0].sum == null)
                            {
                                element[0].sum = 0;
                            } 
                            else
                            {
                                element[0].sum =  element[0].sum.toFixed(2);
                            }
                        })
                
                        resolve(
                            results[0].name + ": " + sumresult[0][0].sum + '\n' +
                            results[1].name + ": " + sumresult[1][0].sum + '\n' +
                            results[2].name + ": " + sumresult[2][0].sum + '\n' +
                            results[3].name + ": " + sumresult[3][0].sum + '\n' +
                            results[4].name + ": " + sumresult[4][0].sum + '\n' 
                        );
                    }) 
                }
        }).catch(()=>
        {
            resolve("Something wrong");
        })
        }
    });
}