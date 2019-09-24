const Discord = require("discord.js");
const {token} = require("./config.json");
const fs = require("fs");
const fantasy = require("./fantasy.js");


const client = new Discord.Client();
const PREFIX = '`';


//STRINGS
var formula_string = fs.readFileSync('formula.txt');
var help_string = fs.readFileSync('helptext.txt');
formula_string = formula_string.toString();
help_string = help_string.toString();

console.log(help_string);


var locked = false;
var current_week = 0;


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
            playingWantingToPlay(message.author.id);
            break;

        case "pick":
            waitForHandImportingAll(message.author.id,args[1],args[2],args[3],args[4],args[5])
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

        case "currenthand":
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
            break

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
            {
                current_week = args[1];
                message.channel.send('Week is now: ' + current_week);
            }
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

    
    async function playingWantingToPlay(discordID)
    {
       let clientMessage = await fantasy.createFantasyUser(discordID);
       message.channel.send(clientMessage);
    }

    async function waitForHandImportingAll(discordID, captainid, player1id, player2id, player3id, player4id)
    {
        let clientMessage = await fantasy.pickingAllFive(discordID, current_week, captainid, player1id, player2id, player3id, player4id);
        message.channel.send(clientMessage);
    }

    async function waitForHandImportingOne(playerid, picknum, discordID)
    {
        let clientMessage = await fantasy.pickingIndividual(discordID, current_week, playerid, picknum)
        message.channel.send(clientMessage);
    }

    async function returnHand(discordID)
    {
        let clientMessage = await fantasy.showFantasyHand(discordID,current_week);
        message.channel.send(clientMessage);
    
    }


    
});

client.login(token);



//FUNCTIONS

/*
    All these functions wait for a promise.resolive and output a client message. 
*/



/*
async function waitForFantasyCalculation(args,bool,week)
{
    let clientMessage = await importFantasy(args, bool,week);
    message.channel.send(clientMessage);
}


*/

