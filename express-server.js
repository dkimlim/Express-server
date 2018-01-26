
	const express = require("express");
	const app = express();
	const PORT = process.env.PORT || 8080; 
	const bodyParser = require("body-parser");
	const cookieParser = require("cookie-parser");
	const bcrypt = require('bcrypt');
	const password = "purple-monkey-dinosaur"; // you will probably this from req.params
	const hashedPassword = bcrypt.hashSync(password, 10);


	app.set("view engine", "ejs");
	app.use(cookieParser());
	app.use(bodyParser.urlencoded({extended: true}));

	var urlDatabase = {
	  "b2xVn2": {
	    longURL: "http://www.lighthouselabs.ca",
	    userID: "userRandomID",
	    // views: 0,
	    // uniqueVisits: 0,
	    // createdAt: new Date()
	  },
	  "9sm5xK": {
	    longURL: "http://www.google.com",
	    userID: "user2RandomID",
	    // views: 0,
	    // uniqueVisits: 0,
	    // createdAt: new Date()
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

	//INDEX default page for all URLs
	app.get("/urls", (req, res) => {
	let idKey = req.cookies['user_id']
	let tinyKey = req.cookies['tiny_url']
	let templateVars = { 
		username: users[idKey], 
		urls: urlDatabase
	};

	res.render("urls_index", templateVars);
	});

	//Template page to create a NEW tiny-url longURL that will be shortened
	app.get("/urls/new", (req, res) => {
		if (!req.cookies['user_id']){
			res.redirect("/login");
		}
		let idKey = req.cookies['user_id']
		let tinyKey = req.cookies['tiny_url']
		let templateVars = { 
			username: users[idKey], 
			urls: urlDatabase[tinyKey]
		};
		res.render("urls_new", templateVars);
	});

	//NEW long URL (and get a tiny url associated) were just created via form
	app.post("/urls", (req, res) => {	
		var shorty = generateRandomString();
		let idKey = req.cookies['user_id']
		// let urls = urlDatabase[

		urlDatabase[shorty] = { 
		longURL: req.body.longURL,
		userID: req.cookies['user_id']
		}
		// delete urls.longURL
		// delete urls.shortURL

		urlDatabase[shorty].longURL = req.body.longURL;

		

		res.cookie('tiny_url', urlDatabase['shorty']);
		// urls.shortURL = shorty
		res.redirect(/urls/); 
	});

	//EDIT default page.
	app.get("/urls/:id", (req, res) => {
		
		let shorty = req.params.id
		let templateVars = { 
			username: users[req.cookies['user_id']],  
			urls: urlDatabase
		};

		if (!req.cookies['user_id']){
		res.redirect("/login");
		}
		res.render("urls_show", templateVars);
	});

	//EDIT existing tiny-url with a new longURL
	app.post("/urls/:id", (req, res) => {
		let idKey = req.cookies['user_id']
		let shorty = req.params.id
		let urls = urlDatabase[shorty]
		
		urls.longURL = req.body.longURL;
		res.redirect("/urls");
	});

	//Delete an existing tiny-url and associated longURL
	app.post("/urls/:id/delete", (req, res) => {
		let idKey = req.cookies['user_id']
		let shorty = req.params.id
		// let tinyKey = req.cookies['tiny_url']
		
		delete urlDatabase[shorty]
		// delete 
		res.redirect("/urls");
	});

	//Default LOGIN page.
	app.get("/login", (req, res) => {
		let idKey = req.cookies['user_id'];
		let tinyKey = req.cookies['tiny_url']
		let templateVars = {
			username: users[idKey],
			urls: urlDatabase[tinyKey]
		};
	
		res.render("user_login", templateVars);
	});

	app.post("/login", (req, res, err) => {
		let userFound = true;

		// bcrypt.compareSync(req.body.password, hashedPassword)

		if (!req.body.email || !req.body.password) {
			res.status(400).send('400 Bad Request: missing email or password.')
			throw '400 Bad Request: missing email or password.'
		}

		for (let user in users) {
			if (req.body.email === users[user].email && bcrypt.compareSync(req.body.password, users[user].password)) {
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

	//REDIRECT function from tiny-url to longURL
	app.get("/u/:shortURL", (req, res) => {
		// let idKey = req.cookies['user_id']
		let urls = urlDatabase[req.params.shortURL]

	    res.redirect(urls.longURL);
	});

	// Default REGISTER page.
	app.get("/register", (req, res) => {
		let idKey = req.cookies['user_id']
		let templateVars = {
			username: users[idKey]
		};
		
		res.render("user_register", templateVars);
	});	
	
		
	//REGISTER an email and password. Must verify 2 conditionals: 
	// - if an email already exists in our database. 
	// - if password or email is missing. 
	app.post("/register", (req, res, err) => {
		// let idKey = req.cookies['user_id']
		let newId = generateRandomString();
		let tinyKey = req.cookies['tiny_url']

		users[newId] = { 
			id: newId, 
			email: req.body.email, 
			password: bcrypt.hashSync(req.body.password, 10)
		}
	// const password = "purple-monkey-dinosaur"; 
	// const hashedPassword = bcrypt.hashSync(password, 10);

		// urlDatabase[newId] = { 
		// 	userID: newId,
		// 	shortURL: 'example-url',
			// longURL: 'http://www.example.com'
		// }

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

		res.redirect("/login")
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



