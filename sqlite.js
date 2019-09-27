const sqlite3 = require('sqlite3');


//This is just to check if it exists or not
exports.selectQuery = function(sql, parameters = [])
{
    return new Promise(function(resolve,reject)
    {
        const db = new sqlite3.Database("fantasy-database.db", (err) =>{
            if(err){
                console.log(err);
            }
            console.log("Connected to the database");
        });

        db.serialize(()=>
        {
            db.all(sql, parameters, function(err,rows)
            {
                if(err)
                {
                    console.log(err);
                    reject(err);
                }
                else
                {
                    console.log(rows);
                    resolve(rows);
                }
            });
        });

        db.close((err) => {
            if (err) {
              return console.error(err.message);
            }
            console.log('Close the database connection.');
          });

    })
}


exports.massInsertQuery = function(sql, parameters = [])
{
    return new Promise(function(resolve,reject)
    {
        const db = new sqlite3.Database("fantasy-database.db", (err) =>{
            if(err){
                console.log(err);
            }
            console.log("Connected to the database");
        });


        db.serialize(()=>
        {   
            var stmt = db.prepare(sql); 

            for(var i = 0; i < parameters.length; i++)
            {
                stmt.run(parameters[i], function(err)
                {
                    if(err)
                    {
                        console.log(err);
                        reject(err);
                    }
                });
            }

            stmt.finalize();
        });


        db.close((err) => {
            if (err) {
              return console.error(err.message);
            }

            resolve("thumbs up");
            console.log('Close the database connection.');
          });
    })
}


exports.insertQuery= function(sql, parameters = [])
{
    return new Promise(function(resolve,reject)
    {
        const db = new sqlite3.Database("fantasy-database.db", (err) =>{
            if(err){
                console.log(err);
            }
            console.log("Connected to the database");
        });

        db.serialize(()=>
        {
            db.run(sql, parameters, function(err)
            {
                if(err)
                {
                    console.log(err);
                    reject(err);
                }
                else
                {
                    console.log("Import Query Done.")
                    resolve("Import Query Done.")
                }
            });

        });

        db.close((err) => {
            if (err) {
              return console.error(err.message);
            }
            console.log('Close the database connection.');
          });
    })
}

exports.updateQuery= function(sql, parameters = [])
{
    return new Promise(function(resolve,reject)
    {
        const db = new sqlite3.Database("fantasy-database.db", (err) =>{
            if(err){
                console.log(err);
            }
            console.log("Connected to the database");
        });

        db.serialize(()=>
        {
            db.run(sql, parameters, function(err)
            {
                if(err)
                {
                    console.log(err);
                    reject(err);
                }
                else
                {
                    console.log("Update Query Done");
                    resolve("Update Query Done");
                }
            });
        });

        
        db.close((err) => {
            if (err) {
              return console.error(err.message);
            }
            console.log('Close the database connection.');
          });
    })
}

