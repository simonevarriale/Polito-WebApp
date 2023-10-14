/*** Importing modules ***/
const express = require('express');
const morgan = require('morgan');                                  // logging middleware
const cors = require('cors');

const { check, validationResult, } = require('express-validator'); // validation middleware

const pageDao = require('./DAO/page-dao');                          // module for accessing the page table in the DB
const userDao = require('./DAO/user-dao');                          // module for accessing the user table in the DB
const imageDao = require('./DAO/image-dao');                        // module for accessing the image table in the DB
const nameSiteDao = require('./DAO/nameSite-dao');                  // module for accessing the nameSite table in the DB

/*** init express and set-up the middlewares ***/
const app = express();
app.use(morgan('dev'));
app.use(express.json());

/**
 * The "delay" middleware introduces some delay in server responses. To change the delay change the value of "delayTime" (specified in milliseconds).
 * This middleware could be useful for debug purposes, to enabling it uncomment the following lines.
 */
/*
const delay = require('express-delay');
app.use(delay(200,2000));
*/

/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));


/*** Passport ***/

/** Authentication-related imports **/
const passport = require('passport');                              // authentication middleware
const LocalStrategy = require('passport-local');                   // authentication strategy (username and password)

/** Set up authentication strategy to search in the DB a user with a matching password.
 * The user object will contain other information extracted by the method userDao.getUser (i.e., id, username, name).
 **/
passport.use(new LocalStrategy(async function verify(username, password, callback) {
  const user = await userDao.getUser(username, password)
  if (!user)
    return callback(null, false, 'Incorrect username or password');

  return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUser, i.e, id, username, name)
}));

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, callback) { // this user is id + username + name 
  callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, callback) { // this user is id + email + name 
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
  // e.g.: return userDao.getUserById(id).then(user => callback(null, user)).catch(err => callback(err, null));

  return callback(null, user); // this will be available in req.user
});

/** Creating the session */
const session = require('express-session');

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authorized' });
}


/*** Utility Functions ***/

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};


/*** Users APIs ***/

// POST /api/sessions 
// This route is used for performing login.
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json({ error: info });
    }
    // success, perform the login and extablish a login session
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser() in LocalStratecy Verify Fn
      return res.json(req.user);
    });
  })(req, res, next);
});

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Not authenticated' });
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});


/*** Page APIs ***/

// 1. Retrieve the list of all the available pages.
// GET /api/pages
app.get('/api/pages', isLoggedIn,
  (req, res) => {
    pageDao.listPages()
      .then(pages => res.status(200).json(pages))
      .catch((err) => res.status(500).json(err)); // always return a json and an error message
  }
);

// 2. Retrieve the list of all the available pages for non loggedIn user.
// GET /api/filteredPages
app.get('/api/filteredPages', 
  (req, res) => {
    pageDao.listFilteredPages()
      .then(pages => res.status(200).json(pages))
      .catch((err) => res.status(500).json(err)); // always return a json and an error message
  }
);

// 3. Retrieve the content of a page given its “id”.
// GET /api/pages/<id>
app.get('/api/pages/:id',
  [check('id').isInt({ min: 1 })],    // check: is the id a positive integer?
  async (req, res) => {
    try {
      const result = await pageDao.getContent(req.params.id);

      if (result.error)
        res.status(404).json(result);
      else
        res.status(200).json(result);
    } catch (err) {
      res.status(500).end();
    }
  }
);


// 4. Create a new page, by providing all relevant information.
// POST /api/page
//This route will add a page to PageList
app.post('/api/pages', isLoggedIn,
  [
    check('page.title').isLength({ min: 2, max: 100 }).withMessage('Invalid Format for title'),
    check('page.author').notEmpty().isString().withMessage('Invalid Author'),
    check('page.creationDate').notEmpty().isLength({ min: 0, max: 10 }).isISO8601({ strict: true }).optional({ checkFalsy: true }),
    // only date (first ten chars) and valid ISO
    check('page.publicationDate').isLength({ min: 0, max: 10 }).isISO8601({ strict: true }).optional({ checkFalsy: true }),
    check('content').isArray().withMessage('Invalid Format for content'),
    check('content').isLength({ min: 2 }).withMessage('Invalid Format for content'),
    check('content.*.type').isIn(['Header', 'Paragraph', 'Image']).withMessage('Invalid Content Type'),
    check('content').custom((content) => {
      const header = content.some(c => c.type === 'Header');
      if (!header) {
        throw new Error('At least one object must have a type of "Header"');
      }
      return true;
    }),
    check('content').custom((content) => {
          
      for (let i = 0; i < content.length; i++) {
        if (content[i].type === 'Image') {
          check(`content[${i}].value`).isIn(['/Images/Torino.jpg', '/Images/Milano.jpg', '/Images/Napoli.png', '/Images/Bologna.jpg', '/Images/Catania.jpg', '/Images/Firenze.jpg', '/Images/Genova.jpg', '/Images/Matera.jpg', '/Images/Roma.jpg', '/Images/Venezia.jpg'])
        }
      }
      return true;

    }),
    check('content.*.value').isString().isLength({ min: 2 , max: 540}).withMessage('Invalid Content Type length'),
    check('content.*.position').isInt()

  ],
  async (req, res) => {
    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }

    if(req.user.role !== 'Admin' && req.user.username!==req.body.page.author){
      return res.status(401).json({ error: 'Not Authorized!' });
    }

    try {
      const id = await pageDao.addPage(req.body.page);
      await pageDao.addContentToPage(id, req.body.content)

      res.status(201).location(id).end();
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of new page: ${err}` });
    }
  }
);

// 5. Update an existing page, by providing all the relevant information
// PUT /api/page/<id>
// This route allows to modify a page, specifiying its id and the necessary data.
app.put('/api/pages/:id', isLoggedIn,

  [
    check('page.title').isLength({ min: 2, max: 100 }).withMessage('Invalid Format for title'),
    check('page.author').notEmpty().isString().withMessage('Invalid Author'),
    check('page.creationDate').notEmpty().isLength({ min: 0, max: 10 }).isISO8601({ strict: true }).optional({ checkFalsy: true }),
    // only date (first ten chars) and valid ISO
    check('page.publicationDate').isLength({ min: 0, max: 10 }).isISO8601({ strict: true }).optional({ checkFalsy: true }),
    check('content').isArray().withMessage('Invalid Format for content'),
    check('content').isLength({ min: 2 }).withMessage('Invalid Format for content'),
    check('content.*.type').isIn(['Header', 'Paragraph', 'Image']).withMessage('Invalid Content Type'),
    check('content').custom((content) => {
      const header = content.some(c => c.type === 'Header');
      if (!header) {
        throw new Error('At least one object must have a type of "Header"');
      }
      return true;
    }),
    check('content').custom((content) => {
          
      for (let i = 0; i < content.length; i++) {
        if (content[i].type === 'Image') {
          check(`content[${i}].value`).isIn(['/Images/Torino.jpg', '/Images/Milano.jpg', '/Images/Napoli.png', '/Images/Bologna.jpg', '/Images/Catania.jpg', '/Images/Firenze.jpg', '/Images/Genova.jpg', '/Images/Matera.jpg', '/Images/Roma.jpg', '/Images/Venezia.jpg'])
        }
      }
      return true;

    }),
    check('content.*.value').isString().isLength({ min: 2 , max: 540}).withMessage('Invalid Content Type length'),
    check('content.*.position').isInt()
  ],
  async (req, res) => {
    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }
    // Is the id in the body equal to the id in the url?
    if (req.body.page.id !== Number(req.params.id)) {
      return res.status(422).json({ error: 'URL and body id mismatch' });
    }

    if(req.user.role !== 'Admin' && req.user.username!==req.body.page.author){
      return res.status(401).json({ error: 'Not Authorized!' });
    }

    try {
      const id = await pageDao.updatePage(req.body.page);

      await pageDao.deleteContentOfPage(req.body.page.id)

      const result = await pageDao.addContentToPage(req.body.page.id, req.body.content)


      if (result.error)
        res.status(404).json(result);
      else
        res.status(200).end();
    } catch (err) {
      res.status(503).json({ error: `Database error during the update of page ${req.params.id}: ${err}` });
    }
  }
);



// 6. Delete an existing page, given its “id”
// DELETE /api/pages/<id>

app.delete('/api/pages/:id', isLoggedIn,
  [check('id').isInt()],
  async (req, res) => {

    try {
      
      //Used to check if the user sending the delete request is the author of the page or if it is an admin
      const pageInfo = await pageDao.getInfoPage(req.params.id);
      if(req.user.role !== 'Admin' && req.user.username!==pageInfo.author){
        return res.status(401).json({ error: "Not Authorized"});
      }

      const result = await pageDao.deletePage(req.params.id);
      await pageDao.deleteContentOfPage(req.params.id)

      if (result == null)
        return res.status(200).json({});
      else
        return res.status(404).json();
    } catch (err) {
      res.status(503).json({ error: `Database error during the deletion of page ${req.params.id}: ${err} ` });
    }
  }
);

// 7. Retrieve the images from the DB
// GET /api/images

app.get('/api/images',
  (req, res) => {
    imageDao.getImages()
      .then(images => res.status(200).json(images))
      .catch((err) => res.status(500).json(err));
  }
);

// 8. Retrieve the name of the site
// GET /api/nameSite
app.get('/api/nameSite',
  async (req, res) => {

    nameSiteDao.getName()
      .then(result => res.status(200).json(result))
      .catch((err) => res.status(500).json(err));
  }
);

// 9. Update the name of the site
// PUT /api/nameSite
app.put('/api/nameSite', isLoggedIn,
  [
    check('name').isLength({ min: 2, max: 10 }).withMessage('Invalid format for Name')
  ],
  async (req, res) => {
    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }

    if(req.user.role !== 'Admin'){
      return res.status(401).json({ error: "Not Authorized"});
    }
  
    nameSiteDao.updateName(req.body.name)
      .then(result => res.status(200).json(result))
      .catch((err) => res.status(503).json(err));
  }
);

// 10. Retrieve all the authors
// GET /api/users
app.get('/api/users', isLoggedIn,
  async (req, res) => {
    
    if(req.user.role !== 'Admin'){
      return res.status(401).json({ error: "Not Authorized"});
    }

    userDao.getAllUsers()
      .then(result => res.status(200).json(result))
      .catch((err) => res.status(500).json(err));
  }
);

// Activating the server
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));