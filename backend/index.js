const express = require('express');
const app = express();
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

