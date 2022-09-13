const {
    User,
    Collections,
    Collectible,
    TokenOwnerships,
    VrsDetails,
    PostMintokenDetails,
    SignatureData,
    TokenTransactions,
    CollectibleSales,
    CollectibleBalance,
    Nonce,
    UserCollectibleFav,
    UserFollower,
    AdminUser
} = require("../includes/include.models.js");

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

module.exports = function (passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        //match user
        AdminUser.findOne({ email: email }).then(user => {
            if (!user) {
                return done(null, false, { message: 'email not registered' });
            }
            //console.log("password received is"+password);
            //math passwords
            //console.log("password from DB is"+user.password);
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'password incorrect' });
                }
            });
        }).catch(err => {
            console.log(err);
        });
    }));
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function (id, done) {

        AdminUser.findOne({ id: id }).then(function (user) {

            if (user) {

                done(null, user.get());
            } else {

                done(user.errors, null);
            }
        });
    });
};