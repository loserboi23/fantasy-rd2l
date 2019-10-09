# fantasy-rd2l
Reddit Dota 2 Fantasy Points Bot for Discord 

Created in Node.JS and JavaScript

Hosted in DigitalOcean https://www.digitalocean.com/

# Install and test

1. Set up a discord bot (https://www.digitaltrends.com/gaming/how-to-make-a-discord-bot/)
2. Create a config.json with the code
```
{
    "token": "ABCDEFGHIJKLMONP" //the discord token for your bot 
    
}
```
3. Using the terminal execute the following 
```
   .createdabase.js
   .import_csv.js
   npm install 
   node . or .index.js
```
Your bot should be online

_optional step_
4) If you are using digitalocean or any other cloud providing service I use the command 
``` 
pm2 start index.js
```
to start it as a process so it runs 24/7

# Bonus Files

## export.js
1) In the code change the query where you want the games of that week
``` javascript 
db.each("SELECT * FROM playerstats p INNER JOIN (SELECT name, handicap, pick_order, id FROM players) s ON p.playerid = s.id WHERE p.week = ?", function(err,row)
```
2) Execute export.js 
3) A file named export.csv is created that list the players that played, their stats and the total fantasy points. 

# Current TODO
- [X] rewrite the database to add names
- [X] leaderboards

## Features for a Version 2.0 for RD2L Season 20 
- [ ] recreate the database
- [ ] find a better way to input matches 
- [ ] commands export.js and other external scripts so I don't have to run the script manually
- [ ] Use Google Drive API 

# Dependencies 
node-fetch https://www.npmjs.com/package/node-fetch

sqlite3 https://www.npmjs.com/package/sqlite3

discord.js https://www.npmjs.com/package/discord.js

cron https://www.npmjs.com/package/cron


# Aditional Infomation
I use pm2 (http://pm2.keymetrics.io/) to start the bot as a process so when I close the connection to my server the app is still running. 


# License

The bot is licensed under the terms of MIT 





