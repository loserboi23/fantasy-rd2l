const fs = require('fs');



var data = fs.readFileSync('draft_sheet.csv');
data = data.toString().split('\n');
for (var i = 0; i < data.length; i++){
    data[i] = data[i].split(',');
}
data.pop();

//get captains
var captaindata = fs.readFileSync('captains.csv');
captaindata = captaindata.toString().split('\n');
for (var i = 0; i < captaindata.length; i++){
    captaindata[i] = captaindata[i].split(',');
}
captaindata.pop();

//get the dotabuff ID
for (var i = 0; i < captaindata.length; i++)
{
    captaindata[i][2] = captaindata[i][2].slice(33);
    captaindata[i][2] = captaindata[i][2].replace('\r','');
}

for (var i = 0; i < data.length; i++)
{
    data[i][2] = data[i][2].slice(33);
    data[i][2] = data[i][2].replace('\r','');
}


//import to database

const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database("fantasy-database.db", (err) =>
{
    if(err){
    return console.error(err.message);
    }
    console.log("Connected to the database");
});


//Insert Database Sequence
db.serialize( () => 
{
    var stmt = db.prepare('INSERT INTO players(id, handicap, pickorder, name) VALUES (?,?,?,?)');
    for (var i = 0; i < captaindata.length; i++)
    {
        stmt.run(captaindata[i][2],captaindata[i][1],0,captaindata[i][0]);
    }

    var j;
    for (var i = 0; i < data.length; i++)
    {
        j = (i%4)+1;
        stmt.run([data[i][2],data[i][1],j,data[i][0]]);
    }
    stmt.finalize();

});


db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });


