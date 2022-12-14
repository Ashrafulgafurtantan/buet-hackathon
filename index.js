const express = require('express');
const app = express();
const SpotifyWebApi = require('spotify-web-api-node');
const SerpApi = require('google-search-results-nodejs');
const passport = require('passport');
const session = require('express-session');
const rateLimit = require("express-rate-limit");
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

