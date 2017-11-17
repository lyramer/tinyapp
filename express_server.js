const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var app = express();
var PORT = process.env.PORT || 8080;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

app.set("view engine", "ejs");




function generateUsername() {
    var test = generateRandomString(16);
    while (users[test] != undefined) {
        test = generateRandomString(16);
    }
    return test;
}

function generateUrlId() {
    var test = generateRandomString(6);
    while (urlDatabase[test] != undefined) {
        test = generateRandomString(6);
    }
    return test;
}

function generateRandomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;    
}
    
var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com",
    "pie" : "http://www.catsinhats.com"
};

const users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "12"
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "23"
    },
    "user3RandomID": {
        id: "user3RandomID", 
        email: "user3@example.com", 
        password: "34"
    },

}

function getTemplateVars(req) {
    var userID = req.cookies["user_id"];
    let templateVars = { 
        urls: urlDatabase,
        user: users[userID]
    };
    return templateVars;
}

// root
app.get("/", (req, res) => {
    let templateVars = getTemplateVars(req);
    res.render("pages/index", templateVars);
    
  });

// urls
app.get("/urls", (req, res) => {
    let templateVars = getTemplateVars(req);    
    res.render("pages/urls_index", templateVars);

});

// create new urls
app.get("/urls/new", (req, res) => {
    let templateVars = getTemplateVars(req);    
    res.render("pages/urls_new", templateVars);
});

// visit short URL
app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});

// id
app.get("/urls/:id", (req, res) => {
    let templateVars = getTemplateVars(req);    
    templateVars.shortURL= req.params.id;
    res.render("pages/urls_show", templateVars);
});

// register
app.get("/register", (req, res) => {
    let templateVars = getTemplateVars(req);    
    templateVars.type = "register",
    res.render("pages/user_reg", templateVars);
});

// register
app.get("/login", (req, res) => {
    let templateVars = getTemplateVars(req);    
    templateVars.type = "login",
    res.render("pages/user_reg", templateVars);
});
  
app.post("/urls", (req, res) => {
    const newID =  generateRandomString(6);
    var longURL = req.body.longURL;
    if (longURL.substring(0, 7) != "http://") { longURL = "http://" + longURL; }
    urlDatabase[newID] = longURL;    
    let templateVars = getTemplateVars(req);    
    
    res.render("pages/urls_index", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
    var longURL = req.body.longURL;
    if (longURL.substring(0, 7) != "http://") { longURL = "http://" + longURL; }
    urlDatabase[req.params.id] = longURL;
    res.redirect('/urls');    
});

app.post("/login", (req, res) => {
    var userEmail = req.body.email;
    var loginFound = false;
    var loginCorrect = false;
    var loginID;

    for (user in users) {
        if (users[user].email == userEmail) {
            loginFound = true;
            loginID = users[user].id;
            break;
        }
    }

    if (loginFound && users[loginID].password == req.body.password) {
        loginCorrect = true;
    }

    if (loginFound && loginCorrect) {
        res.cookie('user_id', users[user].id);        
        res.redirect("/urls");
    } else if (loginFound && !loginCorrect) {
        res.status(400).send("Password is incorrect; please try again");
    } else {
        res.status(400).send("No such username found");
    }
});

app.post("/logout", (req, res) => {
    res.clearCookie('user_id'); 
    res.redirect('/');    
});

// register
app.post("/register", (req, res) => {
    var usrId = generateUsername();
    var validReg = true;
    if (!req.body.email || !req.body.password) {
        res.status(400).send("Please provide both an email and a password");
        validReg = false;
    };
    for (user in users) {
        if (users[user].email == req.body.email) {
            res.status(400).send("The email you provided already exists");
            validReg = false;
        }
    }
    if (validReg) {
        var userInfo = {
            id: usrId,
            email: req.body.email,
            password: req.body.password
        }
        users[usrId] = userInfo;
        res.cookie('user_id', usrId); 
        res.redirect('/urls');  
    }
  
});

app.listen(8080);
console.log('8080 is the magic port');

