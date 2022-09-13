var mysql = require('mysql');

var con = mysql.createConnection({
  host: "tll-staging.c9ikfnv7j5lz.ap-southeast-1.rds.amazonaws.com",
  user: "admin",
  password: "tllnft2021",
  database: 'tll_dev',
  port: 3306
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Database is Connected!");
});

module.exports = con;