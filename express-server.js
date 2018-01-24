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

app.post("/urls", (req, res) => {	
	var shorty = generateRandomString();
	urlDatabase[shorty] = req.body.longURL;
	res.redirect(`http://localhost:8080/urls/${shorty}`);
});


app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});


app.get("/urls/:id", (req, res) => {
	let templateVars = { 
		shortURL: req.params.id,
		longURL: urlDatabase[req.params.id] 
	};
	res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
		let shortURL = req.params.id
		urlDatabase[shortURL] = req.body.longURL;

	res.redirect("http://localhost:8080/urls");
})

app.post("/urls/:id/delete", (req, res) => {
	delete urlDatabase[req.params.id]
	delete req.params.id 
	res.redirect("http://localhost:8080/urls");
})


app.get("/u/:shortURL", (req, res) => {
	let shorty = req.params.shortURL;
    let longURL = urlDatabase[shorty];
        res.redirect(longURL);
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

