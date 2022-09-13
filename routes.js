const { Router } = require('express');
const mysql = require('mysql2');
const Sequelize = require('sequelize');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const { ensureAuthenticated } = require('./config/auth');

//controllers
const usercontroller = require("./controllers/user.controller.js");
const collectibles = require("./controllers/collectible.controller.js");
const reports = require("./controllers/reports.controller.js");
const auctions = require("./controllers/auctions.controller.js");
const request = require('./controllers/approvalControllers');

const router = Router();

router.get('/status', function (req, res) {
    console.log("connected");
    logger.info('Status!');

    res.json({ status: 'OK' });
});
router.get('/testdbcon', function (req, res) {
    logger.info('DB Status!');
    var mysqlConnection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DB_NAME
    });

    mysqlConnection.connect(err => {
        if (!err) {

            mysqlConnection.query('SELECT * FROM users', (err, rows, fields) => {
                if (!err) res.json({ status: rows });else console.log(err);
            });
        } else {
            //throw err;
            res.json({ status: 'FAIL' });
        }
    });
});

router.get('/testdbcon2', function (req, res) {
    let sequelize;
    sequelize = new Sequelize(process.env.MYSQL_DB_NAME, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
        host: process.env.MYSQL_HOST,
        dialect: 'mysql'
    });
    sequelize.authenticate().then(function (err) {
        console.log('Connection has been established successfully.');
        res.json({ status: "connected" });
    }).catch(function (err) {
        console.log('Unable to connect to the database:', err);
        res.json({ status: "error" });
    });
});

//add module specific routes

router.get('/dashboard', ensureAuthenticated, function (req, res) {
    var page_header_data = {
        'page_title': "Dashboard",
        'breadcrumb1': '<a href="#" class="text-muted">Home</a>',
        'breadcrumb2': '<a href="#" class="text-muted">Dashboard</a>',
        'req': req
    };
    res.render('pages/dashboard', page_header_data);
});

//route for registration
/*Get User Basic Profile*/
router.post("/register", usercontroller.getUserRegister);
router.get("/login", usercontroller.getUserLogin);
//router.post("/login", usercontroller.postUserLogin);
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

//get all collectibles list
router.get("/getAllCollectibles", ensureAuthenticated, collectibles.getAllCollectibles);
router.post("/populateAllCollectibles", ensureAuthenticated, collectibles.populateAllCollectibles);
//view collectible owners for a selected collectible
router.get("/viewCollectibleOwners", ensureAuthenticated, collectibles.viewCollectibleOwners);
router.post("/populateCollectibleOwners", ensureAuthenticated, collectibles.populateCollectibleOwners);

//get all requests
router.get("/approvallist", ensureAuthenticated, request.getAllApprovalLists);
router.post("/populateAllList", ensureAuthenticated, request.populateAllList);
router.post("/updateListStatus", ensureAuthenticated, request.UpdateListStatus);

//get all collections
router.get("/getAllCollections", ensureAuthenticated, collectibles.getAllCollections);
router.post("/populateAllCollections", ensureAuthenticated, collectibles.populateAllCollections);
//update collectible status
router.post("/updateCollectibleStatus", ensureAuthenticated, collectibles.updateCollectibleStatus);

//get user list
router.get("/getAllUsers", ensureAuthenticated, usercontroller.getAllUserList);
router.post("/populateAllUsers", ensureAuthenticated, usercontroller.populateAllUsers);

//update user status
router.post("/updateUserStatus", ensureAuthenticated, usercontroller.updateUserStatus);

//get sales report
router.get("/getSalesReport", ensureAuthenticated, reports.getSalesReport);
router.post("/populateAllSales", ensureAuthenticated, reports.populateAllSales);

// List Route
router.post("/populateAllSales", ensureAuthenticated, reports.populateAllSales);
//export to excel
router.get("/exportExcel", ensureAuthenticated, reports.exportExcel);

//curated collectibles
router.post("/updateCuratedArtList", ensureAuthenticated, collectibles.updateCuratedArtList);
//get Curated Arts list
router.get("/getCuratedArts", ensureAuthenticated, collectibles.getCuratedArts);
router.post("/populateCuratedArts", ensureAuthenticated, collectibles.populateCuratedArts);

//curated artists

//featured collectibles
router.post("/updateFeaturedArts", ensureAuthenticated, collectibles.updateFeaturedArts);
//get Featured Arts list
router.get("/getFeaturedArts", ensureAuthenticated, collectibles.getFeaturedArts);
router.post("/populateFeaturedArts", ensureAuthenticated, collectibles.populateFeaturedArts);

//curated artists
router.post("/updateCuratedArtistStatus", ensureAuthenticated, usercontroller.updateCuratedArtistStatus);
//get Featured Arts list
router.get("/getCuratedArtists", ensureAuthenticated, usercontroller.getCuratedArtists);
router.post("/populateCuratedArtists", ensureAuthenticated, usercontroller.populateCuratedArtists);

//add new user from backend
router.get("/addNewUser", ensureAuthenticated, usercontroller.addNewUser);
router.post("/postAddNewUser", ensureAuthenticated, usercontroller.validate('addNewUser'), usercontroller.postAddNewUser);

//edit collectible details
router.get("/editCollectible", ensureAuthenticated, collectibles.editCollectible);
router.post("/postEditCollectible", ensureAuthenticated, collectibles.validate('editCollectible'), collectibles.postEditCollectible);

//auction related routes
router.get("/getAuctionsList", ensureAuthenticated, auctions.getAuctionsList);
router.post("/populateAllAuctions", ensureAuthenticated, auctions.populateAllAuctions);

router.get("/viewAuctionBids", auctions.viewAuctionBids);
router.post("/populateBidsOfAuction", auctions.populateBidsOfAuction);
//
router.post("/updateAuctionStatus", ensureAuthenticated, auctions.updateAuctionStatus);

router.get('/logout', ensureAuthenticated, (req, res) => {
    req.logout();
    req.flash('success_msg', 'Now logged out');
    res.redirect('/login');
});
module.exports = router;