var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// app.get("/hello", (req, res) => {
// 	res.end(`<html>
// 				<body>
// 					Hello <b>World</b>
// 				</body>
// 			</html>\n`);
// });

app.get("/", (req, res) => {
  res.end("Hello! This is the Example.");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
	let templateVars = { 
		urls: urlDatabase 
	};
	res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
	let templateVars = { 
		shortURL: req.params.id,
		urlDatabase: urlDatabase 
	};
	res.render("urls_show", templateVars);
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {	
	console.log(req.body);
	urlDatabase += generateRandomString();
	res.send("Ok");
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
}

