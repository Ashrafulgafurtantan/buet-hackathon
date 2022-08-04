const express = require('express');
const app = express();
const SpotifyWebApi = require('spotify-web-api-node');
app.use(express.json());
app.use(express.urlencoded({extended: true}));

/*   FIREBASE INITIALIZE */
const admin = require('firebase-admin');
const credentials = require('./firebase-sdk.json');
admin.initializeApp({
   credential: admin.credential.cert(credentials)
});
const db = admin.firestore();
const User = db.collection("users");

/* SPOTIFY WEB API NODE
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
   clientSecret: process.argv.slice(2)[1]
});
*/

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

