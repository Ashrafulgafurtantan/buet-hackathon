const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});
passport.use(new GoogleStrategy({
        clientID:"617435512787-5489jd8k324ao1chdaq690h2kq68asv1.apps.googleusercontent.com",
        clientSecret:"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",
        callbackURL: "http://localhost:8080/google/callback",
        passReqToCallback   : true
    },
    function(request, accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }
));
