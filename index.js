const Discord = require("discord.js");
const {token} = require("./config.json");
const fs = require("fs");
const fantasy = require("./fantasy.js");
const CronJob = require('cron').CronJob;


const client = new Discord.Client();
const PREFIX = '`';


//STRINGS
var formula_string = fs.readFileSync('formula.txt');
var help_string = fs.readFileSync('helptext.txt');
formula_string = formula_string.toString();
help_string = help_string.toString();


var locked = false;
var current_week = 4;





//DISCORD CLIENT 
client.on('ready',() => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message=>{


    //if message doenst start with the prefeix just do nothing
    if (message.content[0] !== PREFIX)
    {
        return;
    }
    
    args = message.content.substring(PREFIX.length).split(" ");

    switch(args[0])
    {
        case "play":
            playingWantingToPlay(message.author.id, message.author.username);
            break;

        case "pick":
            if(!locked)
            {
                waitForHandImportingAll(message.author.id,args[1],args[2],args[3],args[4],args[5]);
            }
            else
            {
                message.reply("It is locked, tell jabz to unclock it");
            }
            break;

        case "pickcaptain":
            if(!locked)
            {
                waitForHandImportingOne(args[1],0,message.author.id);
            }
            else
            {
                message.reply("It is locked, tell claire to unlock it");
            }
            break;

        case "pick1":
            if(!locked)
            {
                waitForHandImportingOne(args[1],1,message.author.id);
            }
            else
            {
                message.reply("It is locked, tell tree to unlock it");
            }
            break;

        case "pick2":
            if(!locked)
            {
                waitForHandImportingOne(args[1],2,message.author.id);
            }
            else
            {
                message.reply("It is locked, tell gskw to unlock it");
            }
            break;

        case "pick3":
            if(!locked)
            {
                waitForHandImportingOne(args[1],3,message.author.id);
            }
            else
            {
                message.reply("It is locked, tell danny to unlock it");
            }
            break;

        case "pick4":
            if(!locked)
            {
                waitForHandImportingOne(args[1],4 ,message.author.id);
            }
            else
            {
                message.reply("It is locked, tell truckwaffle to unlock it");
            }
            break;

        case "currenthand":
            returnHand(message.author.id);
            break;
        
        case "formula":
            message.author.send(formula_string);
            break;

        case "record":
            if(message.member.roles.find( x => x.name === 'fantasy-admin'))
                waitForFantasyCalculation(args[1],true,current_week);
            else
                message.channel.send('You are not an admin and you are not kool. Use calculate to find theoritical points');
            break

        case "endweek":
            if(message.member.roles.find( x => x.name === 'fantasy-admin'))
                giveFantastyPoints(current_week);
            else
                message.channel.send('You are not an admin and you are not kool');
            break

        case "calculate":
            waitForFantasyCalculation(args[1],false, 0);
            break;


        case "totalpoints":
            totalFantasyPoints(message.author.id);
            break;

        case "weekgained":
            fantasyPointsInWeek(message.author.id, args[1]);
            break;


        case "weekbreakdown":
            fantasyBreakdown(message.author.id, args[1]);
            break;

        case "leaderboards":
            leaderboards();
            break;           

        case "changename":
            changeName(message.author.id, args[1]);
            break;
    
        case "captain_sheet":
            message.reply("https://docs.google.com/spreadsheets/d/1My1y4EHpeKo4IL2mzhe7FJz2Fc0ELA7Sewyn1V2qAeg/edit#gid=1359480799");
            break;
            
        case "player_sheet":
            message.reply("https://docs.google.com/spreadsheets/d/1My1y4EHpeKo4IL2mzhe7FJz2Fc0ELA7Sewyn1V2qAeg/edit#gid=881390361");
            break;

        case "github":
            message.reply("https://github.com/loserboi23/fantasy-rd2l");
            break;

        case "help":
            message.author.send(help_string);
            break;


        case "unlock":
            if(message.member.roles.find( x => x.name === 'fantasy-admin'))
            {
                locked = false;
            }
            else
                message.channel.send('haha u not an admin haha');
            break

        case "lock":
            if(message.member.roles.find( x => x.name === 'fantasy-admin'))
            {
                locked = true;
            }
            else
                message.channel.send('haha u not an admin haha');
            break


        case "currentweek":
            message.reply(current_week);    
            break;

        case "changeweek":
            if(message.member.roles.find( x => x.name === 'fantasy-admin'))
            {
                current_week = args[1];
                message.channel.send('Week is now: ' + current_week);
            }
            else
                message.channel.send('haha u not an admin haha');
            break;

    }

    

    async function giveFantastyPoints(week)
    {
        let clientMessage = await fantasy.calculateAllFantasyPoints(week)
        message.reply(clientMessage);
    }

    async function playingWantingToPlay(discordID, discordName)
    {
       let clientMessage = await fantasy.createFantasyUser(discordID, discordName);
       message.reply(clientMessage);
    }

    async function waitForHandImportingAll(discordID, captainid, player1id, player2id, player3id, player4id)
    {
        let clientMessage = await fantasy.pickingAllFive(discordID, current_week, captainid, player1id, player2id, player3id, player4id);
        message.reply(clientMessage);
    }

    async function waitForHandImportingOne(playerid, picknum, discordID)
    {
        let clientMessage = await fantasy.pickingIndividual(discordID, current_week, playerid, picknum)
        message.reply(clientMessage);
    }
    
    async function returnHand(discordID)
    {
        let clientMessage = await fantasy.showFantasyHand(discordID,current_week);
        message.reply(clientMessage);
    
    }

    async function waitForFantasyCalculation(matchID,bool,week)
    {
        let clientMessage = await fantasy.importFantasy(matchID, bool,week);
        message.reply(clientMessage);
    }

    async function totalFantasyPoints(discordID)
    {
        let clientMessage = await fantasy.getTotalPoints(discordID);
        message.reply(clientMessage);       
    }

    async function fantasyPointsInWeek(discordID, week)
    {
        let clientMessage = await fantasy.getPointsInWeek(discordID, week);
        message.reply(clientMessage);
    }

    async function fantasyBreakdown(discordID,week)
    {
        let clientMessage = await fantasy.breakdown(discordID,week);
        message.reply(clientMessage);
    }

    async function changeName(discordID, discordName)
    {
        let clientMessage = await fantasy.changeName(discordID,discordName);
        message.reply(clientMessage);
    }

    async function leaderboards()
    {
        let clientMessage = await fantasy.leaderboards();
        message.reply(clientMessage);
    }
});

client.login(token).then(()=>
{

    var guildID = '616090866737479690';
    var channelID = '625904914811453440';


    const job = new CronJob('00 00 18 * * */0', function()
    {
        client.guilds.get(guildID).channels.get(channelID).send("One hour until fantasy points are locked");

    }, 'America/Los_Angeles');

    const job2 = new CronJob('00 00 19 * * */0', function()
    {
     
        client.guilds.get(guildID).channels.get(channelID).send("Games are starting its locked");
        locked = true;

    }, 'America/Los_Angeles');


    job.start();
    job2.start();

});