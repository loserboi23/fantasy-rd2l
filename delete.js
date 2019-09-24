const sqlite3 = require('sqlite3');

const db = new sqlite3.Database("fantasy-database.db", (err) =>{
    if(err){
        console.log(err);
    }
    console.log("Connected to the database");
});



db.serialize(()=>
{
    db.run('DELETE FROM fantasy_user', [], function(err)
    {
        if(err)
        {
            console.log(err);
        }
    }).run('DELETE FROM fantasyhand', [] , function(err)
    {
        if(err)
        {
            console.log(err);
        }
    });
});


db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });