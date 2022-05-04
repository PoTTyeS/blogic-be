/* Libraries */
const express = require('express');
const app = express();
const cors = require("cors");
const bodyparser = require("body-parser");
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');

/* Database Connection */
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'blogic'
});

// JWT token key
const JWT_SECRET = "l3sy4s82f93lp94utas39";

app.use(cors());
app.use(bodyparser.json())

/* Get Response Function */
app.get('/getResponse', (req, res) => {
	res.json({ "status": 200, "data":"SUCCESS" })
})

/* Login Function */
app.post('/login', (req, res) => {
  connection.query('SELECT * FROM users WHERE username = ?', req.body.data.username, (err, data) => {
    if(err) throw err;
    if(data.length === 0) return res.json({ "status": 0 })
    if(data[0].password !== req.body.data.password) return res.json({ "status": 0 })

    const { password, token, ...userData} = data[0]; // Remove password, token from data[0]
    const jwtToken = jwt.sign({ data: userData }, JWT_SECRET);
    connection.query('UPDATE users SET token = ? WHERE username = ? AND password = ?', [token, req.body.data.username, req.body.data.password]);

    return res.json({ "status": 1, "token": jwtToken, "data": userData});
  });
});


/* Get all clients */
app.get('/clients', (req, res) => {
  connection.query("SELECT * FROM customers", 
  function (err, result) {
    if (err) throw err;
    return res.json({ 
      "status": "Úspěšně získané data klientů",
      "results": result 
    });
  });
})

/* Get only clients */
app.get('/getClients', (req, res) => {
  connection.query("SELECT * FROM customers WHERE adviserStatus = 0", 
  function (err, result) {
    if (err) throw err;
    return res.json({ 
      "status": "Úspěšně získané data klientů",
      "results": result 
    });
  });
})

/* 
  Remove clients from database 
  (for clients and advisers) 
*/
app.post('/removeClient', (req, res) => {
  connection.query("DELETE FROM customers WHERE id = ?", req.body.data,  
  function (err, result) {
    if (err) throw err;
    return res.json({ 
      "status": "Klient/Poradce byl úspěšně vymazán",
      "results": result 
    });
  });
});

/* 
  Edit clients in database 
  (for clients and advisers) 
*/
app.post('/editClient', (req, res) => {
  connection.query(
    "UPDATE customers SET firstName = ?, lastName = ?, email = ?, mobile = ?, rc = ?, age = ?, adviserStatus = ? WHERE id = ?", 
    [
      req.body.data.firstName, 
      req.body.data.lastName, 
      req.body.data.email, 
      req.body.data.mobile, 
      req.body.data.rc, 
      req.body.data.age, 
      req.body.data.adviserStatus, 
      req.body.data.id
    ], function (err, result) {
    if (err) throw err;
    return res.json({ 
      "status": "Klient byl úspěšně upraven",
      "results": result 
    });

  });

});

/* 
  Create clients  
  (clients and advisers) 
*/
app.post('/createClient', (req, res) => {
  connection.query("INSERT INTO customers (firstName, lastName, email, mobile, rc, age, adviserStatus) VALUES (?, ?, ?, ?, ?, ?, ?)", 
  [
    req.body.data.firstName, 
    req.body.data.lastName, 
    req.body.data.email, 
    req.body.data.mobile, 
    req.body.data.rc, 
    req.body.data.age,
    req.body.data.adviserStatus
  ], 
  function (err, result) {
    if (err) throw err;
    return res.json({ 
      "status": "Klient byl úspěšně vytvořen",
      "results": result 
    });
  });
});

/* 
  Detail client and advisers
  Basically select data for 1 unique client/adviser and send it back to frontend to display that...
*/
app.post('/detailClient', (req, res) => {
  connection.query("SELECT * FROM customers WHERE id = ?", req.body.data, 
  function (err, result) {
    if (err) throw err;
    return res.json({ 
      "status": "Úspěšně získané data detailu",
      "results": result 
    });
  });
});

/* Get only advisers */
app.get('/getAdvisers', (req, res) => {
  connection.query("SELECT * FROM customers WHERE adviserStatus = 1", 
  function (err, result) {
    if (err) throw err;
    return res.json({ 
      "status": "Úspěšně získané data poradců",
      "results": result 
    });
  });
});

/* Display contracts from database */
app.get('/contracts', (req, res) => {
  connection.query("SELECT * FROM contract", 
  function (err, result) {
    if (err) throw err;
    return res.json({ 
      "status": "Úspěšně získané data poradců",
      "results": result 
    });
  });
});

/* Create contract */
app.post('/createContract', (req, res) => {
  console.log(req.body.data);
  connection.query("INSERT INTO contract (registration_number, institution, client, date_closed, date_expiration, date_end, members, manager) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
  [
    req.body.data.registrationNumber, 
    req.body.data.institution, 
    req.body.data.client, 
    req.body.data.dateClosed, 
    req.body.data.dateExpiration, 
    req.body.data.dateEnd,
    req.body.data.contractMembers,
    req.body.data.contractManager
  ], 
  function (err, result) {
    if (err) throw err;
    return res.json({ 
      "status": "Smlouva byla úspěšně vytvořena",
      "results": result 
    });
  });
});

/* Update contract */
app.post('/updateContract', (req, res) => {
  connection.query(
    "UPDATE contract SET registration_number = ?, institution = ?, client = ?, date_closed = ?, date_expiration = ?, date_end = ?, members = ?, manager = ? WHERE id = ?",[
      req.body.data.registrationNumber,
      req.body.data.institution,
      req.body.data.client,
      req.body.data.dateClosed,
      req.body.data.dateExpiration,
      req.body.data.dateEnd,
      req.body.data.contractMembers,
      req.body.data.contractManager,
      req.body.data.id
    ], 
    function (err, result) {
      if (err) throw err;
      return res.json({ 
        "status": "Smlouva byla úspěšně upravena.",
       "results": result 
      });
  });
});

/* Detail of contract */
app.post('/detailContract', (req, res) => {
  connection.query("SELECT * FROM contract WHERE id = ?", req.body.data, 
  function (err, result) {
    if (err) throw err;
    return res.json({ 
      "status": "Úspěšně získané data detailu",
      "results": result 
    });
  });
});

/* Remove contract from database */
app.post('/removeContract', (req, res) => {
  connection.query("DELETE FROM contract WHERE id = ?", req.body.data,  
  function (err, result) {
    if (err) throw err;
    return res.json({ 
      "status": "Smlouva byla úspěšně smazána.",
      "results": result 
    });
  });
});

/* Start Server */
app.listen(3000, (req,res) => {
	console.log("Server has been started");
})
