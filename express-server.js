	// NOT WORKING:
	// - register flow
	// - header doesn't change to login when register is successful. Missing variables for a new urlDatabase
	




	const express = require("express");
	const app = express();
	const PORT = process.env.PORT || 8080; 
	const bodyParser = require("body-parser");
	const cookieParser = require("cookie-parser");


	app.set("view engine", "ejs");
	app.use(cookieParser());
	app.use(bodyParser.urlencoded({extended: true}));

	const urlDatabase = {
	"userRandomID": {
		// "b2xVn2": "http://www.lighthouselabs.ca",
		userID: "userRandomID",
		longURL: "http://www.lighthouselabs.ca",
		shortURL: "b2xVn2" 
	},
	"user2RandomID": {
		// "9sm5xK": "http://www.google.com",
		userID: "user2RandomID",
		longURL: "http://www.google.com",
		shortURL:  "9sm5xK"
	}
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
	let idKey = req.cookies['user_id']
	let templateVars = { 
		username: users[idKey], 
		urls: urlDatabase[idKey]
	};
	res.render("urls_index", templateVars);
	});

	//Template page to create a new tiny-url longURL that will be shortened
	app.get("/urls/new", (req, res) => {
		if (!req.cookies['user_id']){
			res.redirect("/login");
		}
		let templateVars = {
			username: users[req.cookies['user_id']]
		};
		res.render("urls_new", templateVars);
	});

	//Return post when client enters a new long URL (and get a tiny url associated)
	app.post("/urls", (req, res) => {	
		var shorty = generateRandomString();
		let idKey = req.cookies['user_id']
		let urls = urlDatabase[idKey]

		if(req.cookies['user_id']) {
			urls = { 
			id: req.cookies['user_id'], 
			shortURL: req.body.shortURL, 
			longURL: req.body.longURL
			}
		}

		delete urls.longURL
		delete urls.shortURL

		urls.longURL = req.body.longURL;
		urls.shortURL = shorty
		console.log(idKey);
		res.redirect(`/urls/${shorty}`); 
	});


	app.get("/urls/:id", (req, res) => {
		let idKey = req.cookies['user_id']
		let shortURL = req.params.id
		let templateVars = { 
			username: users[idKey],  
			urls: urlDatabase[idKey]
		};

		if (!req.cookies['user_id']){
		res.redirect("/login");
		}
		res.render("urls_show", templateVars);
	});

	app.post("/urls/:id", (req, res) => {
		let idKey = req.cookies['user_id']
		let urls = urlDatabase[idKey]
		let shortURL = req.params.id
		
		urls.longURL = req.body.longURL;
		res.redirect("/urls");
	});

	app.post("/urls/:id/delete", (req, res) => {
		let idKey = req.cookies['user_id']
		let urls = urlDatabase[idKey]
		let shortURL = req.params.id
		
		delete urls
		res.redirect("/urls");
	});

	app.get("/login", (req, res) => {
		let templateVars = {
			username: users[req.cookies['user_id']]
		};
	
		res.render("user_login", templateVars);
	});

	app.post("/login", (req, res, err) => {
		let userFound = true;

		if (!req.body.email || !req.body.password) {
			res.status(400).send('400 Bad Request: missing email or password.')
			throw '400 Bad Request: missing email or password.'
		}

		for (let user in users) {
			if (req.body.email === users[user].email && req.body.password === users[user].password) {
				res.cookie('user_id', users[user].id);
				res.redirect("/urls");
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
		res.redirect("/login");
	});


	app.get("/u/:shortURL", (req, res) => {
		let idKey = req.cookies['user_id']
		let urls = urlDatabase[idKey]

	    res.redirect(urls.longURL);
	});

	// Template page to register a new account.
	app.get("/register", (req, res) => {
		let templateVars = {
			username: users[req.cookies['user_id']]
		};
		
		res.render("user_register", templateVars);
	});	
	
		
	//Client entered email and password to register. Must verify 2 conditionals: 
	// - if an email already exists in our database. 
	// - if password or email is missing. 
	app.post("/register", (req, res, err) => {
		let idKey = req.cookies['user_id']
		let urls = urlDatabase[idKey]
		let newId = generateRandomString();

		users[newId] = { 
			id: newId, 
			email: req.body.email, 
			password: req.body.password
		}

		res.cookie('user_id', users['newId']);

		if (!req.body.email || !req.body.password) {
			res.status(400).send('400 Bad Request: missing email or password.')
			throw '400 Bad Request: missing email or password.'
		}

		for (var user in users) {
			if (user.email === req.body.email) {
			res.status(400).send('400 Bad Request: email already exists.')
			throw '400 Bad Request: email already exists.'
			}
		}

		res.redirect("/urls/new")
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



