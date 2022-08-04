const express = require('express');
const app = express();
const SpotifyWebApi = require('spotify-web-api-node');
const SerpApi = require('google-search-results-nodejs');
const passport = require('passport');
const session = require('express-session');
const rateLimit = require("express-rate-limit");
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const search = new SerpApi.GoogleSearch('da928d7d6e6adddf831e5fe0da1d15b415f498e54361a6038d445efeb87bc4f9')
const accessToken = '';
const refreshToken = '';
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
   secret: 'secret',
   resave:true,
   saveUninitialized: true
}));

const swaggerOptions = {
   swaggerDefinition: {
      openapi: "3.0.0",
      info: {
         title: "Jar Assistant",
         description: "Api documenattion for Jar Assistant keep-note open api",
         version: "1.0.0",
         contact : {
            name : "Jar Assistant",
         },
         servers: ["http://localhost:8080"]
      }
   },
   apis: ["index.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

require('./passport');
/*   FIREBASE INITIALIZE */
const admin = require('firebase-admin');
const credentials = require('./firebase-sdk.json');
admin.initializeApp({
   credential: admin.credential.cert(credentials)
});
const db = admin.firestore();
const User = db.collection("users");

/*RATE LIMITE*/
app.use(
    rateLimit({
       windowMs:  10 * 1000, // 10 seconds duration in milliseconds
       max: 2,
       message: "You exceeded 3 requests in 10 seconds limit!",
       headers: true,
    })
);
/*GOOGLE OAUTH2.0*/

/**
 * @swagger
 * /logout:
 *  get:
 *    description: Logout from oAuth
 *    responses:
 *    '200':
 *       description: A success response
 */
app.get('/logout',(req,res)=>{
   if(req.session.loggedin){
      req.session.destroy();
      res.redirect('/');
      res.end();
   }else{
      res.redirect('/');
      res.end();
   }
});
/**
 * @swagger
 * /google:
 *  get:
 *    description: Google OAuth
 *    responses:
 *    '200':
 *       description: A success response
 */
app.get('/google', passport.authenticate('google',{
   scope:['email', 'profile']
}));
app.get('/google/callback',passport.authenticate('google',{
   failureRedirect: "/",
}),async (req,res)=>{
   req.session.userData = {
      profile:req.user.photos[0].value,
      email:req.user.email
   };
   console.log(req.session.userData);
   req.session.loggedin = true;
   res.redirect('/');
   res.end();
});
app.get('/',(req,res)=>{
   res.send("<h1>Home Page</h1>");
});
app.get('/a',(req,res)=>{
   res.send("<h1>A Page</h1>");
});

app.get('/b',(req,res)=>{
   res.send("<h1>B Page</h1>");
});

app.get('/c',(req,res)=>{
   res.send("<h1>C Page</h1>");
});

/* SPOTIFY WEB API NODE */
const scopes = [
   'ugc-image-upload',
   'user-read-playback-state',
   'user-modify-playback-state',
   'user-read-currently-playing',
   'streaming',
   'app-remote-control',
   'user-read-email',
   'user-read-private',
   'playlist-read-collaborative',
   'playlist-modify-public',
   'playlist-read-private',
   'playlist-modify-private',
   'user-library-modify',
   'user-library-read',
   'user-top-read',
   'user-read-playback-position',
   'user-read-recently-played',
   'user-follow-read',
   'user-follow-modify'
];

const spotifyApi = new SpotifyWebApi({
   redirectUri: 'http://localhost:8080/callback',
   clientId: 'ec3a3e42f6e2401e8d86c66603cd5642',
   clientSecret: '5dde3e44b3ff4440b875f6460a4fbdf4'
});
app.get('/login', (req,res)=>{
   res.redirect(spotifyApi.createAuthorizeURL(scopes));
})

/**
 * @swagger
 * tags:
 *    name: News
 *    description: Search APIs
 */

/**
 * @swagger
 * /searchNews:
 *  get:
 *    tags: [News]
 *    parameters:
 *       -in: query
 *       name: query
 *       schema: 
 *          type: string
 *       required: true
 *       description: Search parameter
 *    description: API for searching news
 *    responses:
 *    '200':
 *       description: A success response
 *       content:
 *          application/json:
 *             schema:
 *                type: array
 *                items: object
 */
app.get('/searchNews', async (req,res)=>{
   const query =  req.query.query;
   console.log(`query = ${query}`)
   search.json({
      q: query,
      location: "Bangladesh"
   }, (result) => {
      res.send(result);
   })
});

app.get('/callback', function(req, res) {
   let code  = req.query['code'];
   let state  = req.query['state'];
   let error  = req.query['error'];
   if(error){
      console.log("Callback Error:",error);
      res.send(error)
      return ;
   }
   spotifyApi.authorizationCodeGrant(code)
       .then((data) =>{
          // Set the access token on the API object to use it in later calls
          const accessToken = data.body['access_token'];
          const refreshToken = data.body['refresh_token'];
          spotifyApi.setAccessToken(accessToken);
          spotifyApi.setRefreshToken(refreshToken);
          console.log('access token = ',accessToken);
          console.log('Refresh token = ',refreshToken);
          res.send("Successfully retrieve Access Token");
       }, function(err) {
          console.log('Something went wrong!', err);
       });
});

/**
 * @swagger
 * tags:
 *    name: Music
 *    description: Search Music API
 */

/**
 * @swagger
 * /search:
 *  get:
 *    tags: [Music]
 *    parameters:
 *       -in: query
 *       name: searchKey
 *       schema: 
 *          type: string
 *       required: true
 *       description: Search parameter
 *    description: API for searching music
 *    responses:
 *    '200':
 *       description: A success response
 *       content:
 *          application/json:
 *             schema:
 *                type: array
 *                items: object
 */

app.get('/search',(req,res)=>{
   const requestParams = req.body.searchKey;
   console.log(requestParams)
   spotifyApi.searchTracks(requestParams).then(result=>{
      res.json(result);
   });
});
app.get('/getArtists', async (req,res)=>{
   spotifyApi.getMyTopArtists().then(result=>{
      res.json(result);
   });
});

app.post('/signup', async (req,res)=>{
   console.log(req.body);
   const user = {
      email: req.body.email,
      password: req.body.password,
   }
   const userResponse = await  admin.auth().createUser({
      password: user.password,
      email: user.email,
      emailVerified:false,
      disabled: false
   });
   res.json(userResponse);
});

/**
 * @swagger
 * tags:
 *    name: Auth
 *    description: Auth API
 */

/**
 * @swagger
 * /create:
 *  post:
 *    tags: [Auth]
 *    description: API for searching music
 *    requestBody:
 *       required: true
 *       content:
 *          application/json
 *             schema: 
 *                type: object
 *                required:
 *                   - email
 *                   - firstName
 *                   - lastName
 *                properties:
 *                   email:
 *                      type: string
 *                      description: Email address for autheticatio
 *                   firstName:
 *                      type: string
 *                      description: Firstname
 *                   lastname:
 *                      type: string
 *                      description: Lastname
 *    responses:
 *    '200':
 *       description: A success response
 *       content:
 *          application/json:
 *             schema:
 *                type: array
 *                items: object
 */


app.post('/create', async(req,res)=>{
   try{
      const id = req.body.email;
      const userJson = {
         email: req.body.email,
         firstName: req.body.firstName,
         lastName: req.body.lastName,
      };
      User.add(userJson).then(response=>{
         res.send(response);
      });
   }catch (e) {
      res.send(e);
   }
});

app.listen(process.env.PORT || 8080, ()=>console.log("Backend Running"));

