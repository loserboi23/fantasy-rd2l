/*
    This file is for checking and bugfixing the database 
*/


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
  db.get("SELECT id FROM fantasy_user WHERE id = ",129010537253044224, function(err,row)
  {
      console.log(row);
  })
  db.run("DELETE FROM fantasy_user", function(err)
  {

  });

});


db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Close the database connection.');
});