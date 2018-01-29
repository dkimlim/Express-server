
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; 
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const urlDatabase = {};

const users = {};

//Generate a "unique" shortURL that produces a string of 6 random alphanumeric characters.
function generateRandomString() {
	let hash = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012346789";
	let random = "";
	for (let i = 0; i <= 6; i++) {	
	  random += hash[parseInt(Math.random() * hash.length)].toString();
	}
	return random;	
};

// find user object for associated URL
function urlsForUser(id) {
  let userURLs = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userURLs[key] = urlDatabase[key];
    }
  }
  return userURLs;
};

	app.get("/", (req, res) => {
		if (users[req.session["user_id"]]) {
	      res.redirect('/urls');
	    } else {
	      res.redirect('/login');
	    }
	});

	app.get("/urls.json", (req, res) => {
	res.json(urlDatabase);
	});

	//INDEX default page for all URLs
	app.get("/urls", (req, res) => {
		let idKey = req.session["user_id"];
		let uniqueURL = urlsForUser(idKey);
		let templateVars = { 
			username: users[idKey], 
			urls: uniqueURL
		};
		
		res.render("urls_index", templateVars);
	});

	//Default page to create a NEW tiny-url.
	app.get("/urls/new", (req, res) => {
		let idKey = req.session["user_id"];
		let uniqueURL = urlsForUser(idKey);
		let templateVars = { 
			username: users[idKey], 
			urls: uniqueURL
		};
		
		if (!req.session["user_id"]){
			res.redirect("/login");
		}
		res.render("urls_new", templateVars);
	});

	//POST a NEW long URL (and get a tiny url associated) were just created via form
	app.post("/urls", (req, res) => {	
		let shorty = generateRandomString();

		urlDatabase[shorty] = { 
		  longURL: req.body.longURL,
		  userID: req.session["user_id"]
		}

		res.redirect(`/urls/${shorty}`); 
	});

	//default page to EDIT a long URL. 3 conditionals:
	// - (minor) if URL for the given ID does not exist (error message)
	// - if user is not logged in (error message)
	// - if user is logged in but does not own URL with the tiny ID (error message)
	app.get("/urls/:id", (req, res) => {
		let idKey = req.session["user_id"];
		let shorty = req.params.id;
		let templateVars = { 
			username: users[idKey],  
			urls: urlDatabase,
			shortURL: shorty
		};

		if (!idKey) {
		  res.send("Please login or register");
		} else if (idKey !== urlDatabase[shorty].userID) {
           res.send("This short URL is not valid.")
        } else {
        	res.render("urls_show", templateVars);
        }
	});

	//EDIT long URL for an existing tiny-url.
	app.post("/urls/:id", (req, res) => {
		let shorty = req.params.id;
		let urls = urlDatabase[shorty];
		
		urls.longURL = req.body.longURL;
		res.redirect("/urls");
	});

	//Delete an existing tiny-url and associated longURL
	app.post("/urls/:id/delete", (req, res) => {
		let shorty = req.params.id;
		
		delete urlDatabase[shorty]
		
		res.redirect("/urls");
	});

	//Default LOGIN page.
	app.get("/login", (req, res) => {
		let idKey = req.session["user_id"];
		let templateVars = {
			username: users[idKey]
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
			if (req.body.email === users[user].email && bcrypt.compareSync(req.body.password, users[user].password)) {
				req.session["user_id"] = users[user].id;
				userFound = false;
				return res.redirect("/urls");
			}
		}
		
		if (userFound) {
			res.status(403).send('403 Forbidden: password or email is incorrect.')
			throw '403 Forbidden: password or email is incorrect.'
		}

		res.redirect("/urls");
	});		
			
	app.post("/logout", (req, res) => {
		req.session = null;
		res.redirect("/urls");
	});

	//REDIRECT page from tiny-url to longURL
	app.get("/u/:shortURL", (req, res) => {
		let urls = urlDatabase[req.params.shortURL];

		if (!urls.longURL) {
		  res.status(400).send('400 Bad Request: URL provided is incorrect.')
		  throw '400 Bad Request: URL provided is incorrect.'
		}

	    res.redirect(urls.longURL);
	});

	// Default REGISTER page.
	app.get("/register", (req, res) => {
		let templateVars = {
			username: users[req.session["user_id"]]
		};
		
		res.render("user_register", templateVars);
	});	
	
	//REGISTER an email and password. Must verify 2 conditionals: 
	// - if an email already exists in our database. 
	// - if password or email is missing. 
	app.post("/register", (req, res, err) => {
		let newId = generateRandomString();

		if (!req.body.email || !req.body.password) {
			res.status(400).send('400 Bad Request: missing email or password.')
			throw '400 Bad Request: missing email or password.'
		}

		for (let user in users) {
			if (users[user].email === req.body.email) {
			res.status(400).send('400 Bad Request: email already exists.')
			throw '400 Bad Request: email already exists.'
			}
		}

		users[newId] = { 
			id: newId, 
			email: req.body.email, 
			password: bcrypt.hashSync(req.body.password, 10)
		}

		req.session.user_id = newId;
		res.redirect("/urls/new");
	});



	app.listen(PORT, () => {
		console.log(`Example app listening on port ${PORT}!`);
	});

	
