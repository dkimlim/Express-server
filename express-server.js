	var express = require("express");
	var app = express();
	var PORT = process.env.PORT || 8080; 
	const bodyParser = require("body-parser");
	var cookieParser = require("cookie-parser");


	app.set("view engine", "ejs");
	app.use(cookieParser());
	app.use(bodyParser.urlencoded({extended: true}));

	var urlDatabase = {
	  "b2xVn2": "http://www.lighthouselabs.ca",
	  "9sm5xK": "http://www.google.com"
	};

	const users = { 
	  "userRandomID": {
	    	id: "userRandomID", 
	    	email: "user@example.com", 
	    	password: "11"
	  },
	 "user2RandomID": {
	    	id: "user2RandomID", 
	    	email: "user2@example.com", 
	    	password: "22"
	  }
	};

	app.get("/", (req, res) => {
	  res.end("Hello! This is the Example.");
	});


	app.get("/urls.json", (req, res) => {
	  res.json(urlDatabase);
	});

	app.get("/urls", (req, res) => {
		let templateVars = { 
			username: req.cookies["user_id"], 
			urls: urlDatabase
		};
		res.render("urls_index", templateVars);
	});


	app.post("/urls", (req, res) => {	
		var shorty = generateRandomString();
		urlDatabase[shorty] = req.body.longURL;
		res.redirect(`http://localhost:8080/urls/${shorty}`);
	});


	app.get("/urls/new", (req, res) => {
		let templateVars = {
			username: req.cookies["user_id"]
		};
	    res.render("urls_new", templateVars);
	});


	app.get("/urls/:id", (req, res) => {
		let templateVars = { 
			username: req.cookies["user_id"], 
			shortURL: req.params.id,
			longURL: urlDatabase[req.params.id] 
		};
		res.render("urls_show", templateVars);
	});

	app.post("/urls/:id", (req, res) => {
			let shortURL = req.params.id
			urlDatabase[shortURL] = req.body.longURL;
		res.redirect("/urls");
	});

	app.post("/urls/:id/delete", (req, res) => {
		delete urlDatabase[req.params.id]
		delete req.params.id 
		res.redirect("/urls");
	});

	app.get("/login", (req, res) => {
		let templateVars = {
			username: req.cookies["user_id"]
		};
	    res.render("user_login", templateVars);
	});

	app.post("/login", (req, res) => {
		let userFound = true;
		
		if (!req.body.email || !req.body.password) {
			res.status(400).send('400 Bad Request: missing email or password.')
			throw '400 Bad Request: missing email or password.'
		}

		for (let user in users) {
			if (req.body.email === users[user].email && req.body.password === users[user].password) {
					res.cookie('user_id', users[user].id);
					res.redirect("/");
					return userFound = false;
			}
		}
			if (userFound) {
				res.status(403).send('403 Forbidden: password or email is incorrect.')
				throw '403 Forbidden: password or email is incorrect.'
			}
	});		
				
	app.post("/logout", (req, res) => {
		res.clearCookie('user_id');
		res.redirect("/urls");
	});


	app.get("/u/:shortURL", (req, res) => {
		let shorty = req.params.shortURL;
	    let longURL = urlDatabase[shorty];
	        res.redirect(longURL);
	});

	app.get("/register", (req, res) => {
		let templateVars = { 
			username: req.cookies["user_id"], 
		};
		res.render("user_register", templateVars)
	});

	app.post("/register", (req, res, err) => {
		var newId = generateRandomString();

		if (!req.body.email || !req.body.password) {
			res.status(400).send('400 Bad Request: missing email or password.')
			throw '400 Bad Request: missing email or password.'
		}

		for (var user in users) {
			if (users[user].email === req.body.email) {
			res.status(400).send('400 Bad Request: email already exists.')
			throw '400 Bad Request: email already exists.'
			}
		}
		
		users[newId] = { 
			id: newId, 
			email: req.body.email, 
			password: req.body.password
		}
		res.cookie('user_id', users[newId]);
		res.redirect("/urls")
	});

	app.listen(PORT, () => {
	  console.log(`Example app listening on port ${PORT}!`);
	});

	//Generate a "unique" shortURL that produces a string of 6 random alphanumeric characters.
	function generateRandomString(){
		var hash = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012346789";
		var random = "";
		for (var i = 0; i <= 6; i++) {	
	      random += hash[parseInt(Math.random() * hash.length)].toString();
		}
		  return random;	
	};



