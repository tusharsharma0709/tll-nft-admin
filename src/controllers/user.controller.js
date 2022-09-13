const Uone = require('../uone.js');
const db = require("../models");
const Op = db.Sequelize.Op;
const Sequelize = db.sequelize;
const QueryTypes = db.Sequelize.QueryTypes;
const { check, checkSchema, body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const moment = require('moment');
const excel = require("exceljs");

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
  AdminUser,
} = require("../includes/include.models.js");

const logger = Uone.logger;
const web3 = Uone.web3;
/*Register a new visitor*/
exports.getUserRegister = async(req, res) => {
  logger.info('[uone][controllers/user.controller/getUserRegister]'+req.body.username);
  
    const newUser = new AdminUser({
        username : req.body.username,
        email : req.body.email,
        password : req.body.password
    });
    
    //console.log("password"+ req.body.password);

    //hash password
    bcrypt.genSalt(10,(err,salt)=> 
    bcrypt.hash(newUser.password,salt,
      (err,hash)=> {
          if(err) throw err;
              //save pass to hash
              newUser.password = hash;
          //save user
          newUser.save()
          .then((value)=>{
              console.log(value)
              req.flash('success_msg','You have now registered!');
              res.render('pages/auth/login');
        })
        .catch(value=> console.log(value));
          
    }));
    
};

/*User Login Function*/
 exports.getUserLogin = async(req, res) => {
  logger.info('[uone][controllers/user.controller/getUserLogin]');
  
  res.render('pages/auth/login');
};

//post User Login
exports.postUserLogin = async(req, res) => {
  logger.info('[uone][controllers/user.controller/postUserLogin]');
  console.log("POST");
  var page_header_data = { 
    'page_title' : "Dashboard", 
    "breadcrumb1": '<a href="#" class="text-muted">Home</a>',
    'req': req
    };
  res.render('pages/dashboard', page_header_data );
  //res.render('pages/auth/login');
};

//get All User List
exports.getAllUserList = async (req, res) => {
  logger.info('[uone][controllers/user.controller/getAllUserList]');
  var page_header_data = { 
                          'page_title' : 'All Users List', 
                          'breadcrumb1': '<a href="/dashboard" class="text-muted">Dashboard</a>', 
                          'breadcrumb2': 'All Users',
                          'req': req
                          };

                          res.render('pages/users/userList', page_header_data);

};

exports.populateAllUsers = async (req, res) => {
  logger.info('[uone][controllers/user.controller/populateAllUsers]');
    let input = req.body;
    let limit = parseInt(input.length);
    let skip = parseInt(input.start);
    let asc_desc = input.order[0].dir;
    let sort_column = parseInt(input.order[0].column);
    let order_by = "createdAt";
    let serial_number = skip;
    let query = `SELECT users.*, ca.id as curated_artist_id 
                FROM 
                users 
                LEFT JOIN curated_artists as ca ON ca.userId=users.id where 1 = 1
                `;

    //search by user wallet Address
    if (typeof (input.user_wallet_address) != 'undefined' && input.user_wallet_address) {
      logger.info('[uone][controllers/user.controller/populateAllUsers Search Term for search by user wallet address] '+input.user_wallet_address);
      query += " AND (users.user_public_address LIKE '%" + input.user_wallet_address + "%' OR users.username LIKE '%" + input.user_wallet_address + "%')";
    }
    //search by user status
    if (typeof (input.user_status) != 'undefined' && input.user_status) {
      logger.info('[uone][controllers/user.controller/populateAllUsers Search Term for search by user status] '+input.user_status);
      query += " AND users.is_ban =" + input.user_status;
    }
    
    query +=" ORDER BY users.createdAt DESC";
    
    logger.info('[uone][controllers/user.controller/populateAllUsers Query] '+query);

    const user_count = await Sequelize.query(`${query}`, { type: QueryTypes.SELECT });
    const users = await Sequelize.query(`${query} limit ${limit} OFFSET ${skip}`, { type: QueryTypes.SELECT }).then( (users) => {

            users = JSON.parse(JSON.stringify(users));
            let recordsFiltered = users.length;
            console.log("filtered records");
            console.log(recordsFiltered);
            let formatted_result = [];
            users.forEach(  (element) => {

                //shop.productImagesTemp  = shop.productImages;
                formatted_result.push([
                                    serial_number += 1,
                                    element.username,
                                    element.user_public_address,
                                    element.email,
                                    element.is_ban == 0 ? '<span class="label label-success label-pill label-inline mr-2">Active</span>' : '<span class="label label-danger label-pill label-inline mr-2">Banned</span>',
                                    element.curated_artist_id != null ? '<span class="label label-success label-pill label-inline mr-2">YES</span>' : '<span class="label label-danger label-pill label-inline mr-2">NO</span>',
                                    `<div class="dropdown dropdown-inline">
								                        <a href="javascript:;" class="btn btn-sm btn-clean btn-icon" data-toggle="dropdown">
	                                        <i class="la la-cog"></i>
	                                      </a>
							  	                    <div class="dropdown-menu dropdown-menu-sm dropdown-menu-right">
									                      <ul class="nav nav-hoverable flex-column">
							    		                    <li class="nav-item"><a class="nav-link" href="${process.env.FE_URL+"profile/"+element.user_public_address}" target="_blank"><i class="nav-icon la la-edit"></i><span class="nav-text">User Profile</span></a></li>
                                          <li class="nav-item"><a class="nav-link change_user_status" href="#" data-id="${element.id}" data-cmd="${element.is_ban==0 ? 'ban':'unban'}"><i class="nav-icon fas fa-ban"></i><span class="nav-text">${element.is_ban==0 ? 'Ban':'Un-ban'}</span></a></li>
                                          <li class="nav-item"><a class="nav-link change_curated_artist_status" href="#" data-id="${element.id}" data-user_public_address="${element.user_public_address}" data-cmd="${element.curated_artist_id != null ? 'undo_curated_artist':'make_curated_artist'}"><i class="nav-icon fas fa-bookmark"></i><span class="nav-text">${element.curated_artist_id != null ? 'Undo-Curated':'Make Curated'}</span></a></li>
                                        </ul>
							  	                    </div>
							                      </div>`
                                ])

            });

            //console.log("collectable length"+formatted_result.length);
            res.json({
                                "draw": input.draw,
                                "recordsTotal": users.length,
                                "recordsFiltered": user_count.length,
                                "data": formatted_result
                            });

        });
         
};

//change user status ban/unban
exports.updateUserStatus = async (req, res) => {
  logger.info('[uone][controllers/user.controller/updateUserStatus]');
  logger.info("[uone][controllers/user.controller/updateUserStatus] id to update is"+ req.body.id);
  logger.info("[uone][controllers/user.controller/updateUserStatus] cmd to update is"+ req.body.cmd);
  var query = {};
  var update = {};
  
  if(req.body.cmd == "ban") {
    query.is_ban = true;
    await db.sequelize.query("UPDATE users SET is_ban=? WHERE id=?", {
      replacements: [
                    true,
                    req.body.id
      ],
      type: QueryTypes.UPDATE
    });
  }
  //unban
  if(req.body.cmd == "unban") {
    query.is_ban = true;
    await db.sequelize.query("UPDATE users SET is_ban=? WHERE id=?", {
      replacements: [
                    false,
                    req.body.id
      ],
      type: QueryTypes.UPDATE
    });
  }

  res.json({ success: true });
};

//change user curated status
exports.updateCuratedArtistStatus = async (req, res) => {
  logger.info('[uone][controllers/user.controller/updateCuratedArtistStatus]');
  logger.info("[uone][controllers/user.controller/updateCuratedArtistStatus] id to update is"+ req.body.id);
  logger.info("[uone][controllers/user.controller/updateCuratedArtistStatus] cmd to update is"+ req.body.cmd);
  logger.info("[uone][controllers/user.controller/updateCuratedArtistStatus] user_public_address to update is"+ req.body.user_public_address);

  var query = {};
  var update = {};
  if(req.body.cmd == "make_curated_artist") {
    
    let curated_user_exist = await db.sequelize.query(`
    SELECT 
      id
    FROM curated_artists 
    WHERE 
    curated_artists.userId = ?
    ;    
    `, {
        replacements: [
          req.body.id
        ],
        type: QueryTypes.SELECT
    });

    if (curated_user_exist.length == 0) {
      logger.error('[uone][controllers/user.controller/updateCuratedArtistStatus] Info: User is not Curated Yet. id:', req.body.id);  
      
      sql = 'INSERT INTO curated_artists (userId, user_public_address) VALUES (?, ?);';
      await db.sequelize.query(sql, {
        replacements: [
          req.body.id,
          req.body.user_public_address
         ],
        type: QueryTypes.INSERT
      });
    
    }
  }
  //undo curated
  if(req.body.cmd == "undo_curated_artist") {
      
    await db.sequelize.query("DELETE FROM curated_artists WHERE userId=?", {
          replacements: [
            req.body.id
          ],
          type: QueryTypes.DELETE
      });
  }
  
  res.json({ success: true });
};

//get curated artist list
exports.getCuratedArtists = async (req, res) => {
  logger.info('[uone][controllers/user.controller/getCuratedArtists]');
  var page_header_data = { 
                          'page_title' : "Curated Artist List", 
                          "breadcrumb1": '<a href="/dashboard" class="text-muted">Dashboard</a>',
                          "breadcrumb2": 'Settings', 
                          "breadcrumb3": 'Curated Artists',
                          'req': req 
                          };
  res.render('pages/users/curatedArtistList', page_header_data);
};

exports.populateCuratedArtists = async (req, res) => {
  logger.info('[uone][controllers/user.controller/populateCuratedArtists]');
    let input = req.body;
    let limit = parseInt(input.length);
    let skip = parseInt(input.start);
    let asc_desc = input.order[0].dir;
    let sort_column = parseInt(input.order[0].column);
    let order_by = "createdAt";
    let serial_number = skip;
    let query = `SELECT users.*, ca.id as curated_artist_id, ca.createdAt as artist_curated_datetime 
                FROM 
                users 
                INNER JOIN curated_artists as ca ON ca.userId=users.id where 1 = 1
                `;

    //search by user wallet Address
    if (typeof (input.user_wallet_address) != 'undefined' && input.user_wallet_address) {
      logger.info('[uone][controllers/user.controller/populateAllUsers Search Term for search by user wallet address] '+input.user_wallet_address);
      query += " AND (users.user_public_address LIKE '%" + input.user_wallet_address + "%' OR users.username LIKE '%" + input.user_wallet_address + "%')";
    }
    //search by user status
    if (typeof (input.user_status) != 'undefined' && input.user_status) {
      logger.info('[uone][controllers/user.controller/populateAllUsers Search Term for search by user status] '+input.user_status);
      query += " AND users.is_ban =" + input.user_status;
    }
    
    query +=" ORDER BY ca.createdAt DESC";
    
    logger.info('[uone][controllers/user.controller/populateAllUsers Query] '+query);

    const user_count = await Sequelize.query(`${query}`, { type: QueryTypes.SELECT });
    const users = await Sequelize.query(`${query} limit ${limit} OFFSET ${skip}`, { type: QueryTypes.SELECT }).then( (users) => {

            users = JSON.parse(JSON.stringify(users));
            let recordsFiltered = users.length;
            console.log("filtered records");
            console.log(recordsFiltered);
            let formatted_result = [];
            users.forEach(  (element) => {

                //shop.productImagesTemp  = shop.productImages;
                formatted_result.push([
                                    serial_number += 1,
                                    element.username,
                                    element.user_public_address,
                                    element.email,
                                    element.is_ban == 0 ? '<span class="label label-success label-pill label-inline mr-2">Active</span>' : '<span class="label label-danger label-pill label-inline mr-2">Banned</span>',
                                    element.curated_artist_id != null ? '<span class="label label-success label-pill label-inline mr-2">YES</span>' : '<span class="label label-danger label-pill label-inline mr-2">NO</span>',
                                    `<div class="dropdown dropdown-inline">
								                        <a href="javascript:;" class="btn btn-sm btn-clean btn-icon" data-toggle="dropdown">
	                                        <i class="la la-cog"></i>
	                                      </a>
							  	                    <div class="dropdown-menu dropdown-menu-sm dropdown-menu-right">
									                      <ul class="nav nav-hoverable flex-column">
							    		                    <li class="nav-item"><a class="nav-link" href="${process.env.FE_URL+"profile/"+element.user_public_address}" target="_blank"><i class="nav-icon la la-edit"></i><span class="nav-text">User Profile</span></a></li>
                                          <li class="nav-item"><a class="nav-link change_user_status" href="#" data-id="${element.id}" data-cmd="${element.is_ban==0 ? 'ban':'unban'}"><i class="nav-icon fas fa-ban"></i><span class="nav-text">${element.is_ban==0 ? 'Ban':'Un-ban'}</span></a></li>
                                          <li class="nav-item"><a class="nav-link change_curated_artist_status" href="#" data-actionfrom="curated_artist_list" data-id="${element.id}" data-user_public_address="${element.user_public_address}" data-cmd="${element.curated_artist_id != null ? 'undo_curated_artist':'make_curated_artist'}"><i class="nav-icon fas fa-bookmark"></i><span class="nav-text">${element.curated_artist_id != null ? 'Undo-Curated':'Make Curated'}</span></a></li>
                                        </ul>
							  	                    </div>
							                      </div>`
                                ])

            });
            //console.log(collectibles.length);
            res.json({
                                "draw": input.draw,
                                "recordsTotal": users.length,
                                "recordsFiltered": user_count.length,
                                "data": formatted_result
                            });

        });
         
};


//add new user from backend
exports.addNewUser = async(req, res) => {
  logger.info('[uone][controllers/user.controller/addNewUser]');
  
  var page_header_data = { 
    'page_title' : "User List", 
    "breadcrumb1": '<a href="/dashboard" class="text-muted">Home</a>', 
    "breadcrumb2": 'Add New User',
    'req': req
    };

  res.render('pages/users/addNewUser', page_header_data);
};

//validate the request
exports.validate = (method) => {
  switch (method) {
    case 'addNewUser': {
          return [ 
            checkSchema({
                "user_public_address": {
                  notEmpty: true,
                  errorMessage: 'User Public Address is Required',
                },
                "username": {
                  notEmpty: true,
                  errorMessage: 'username is Required',
                }
              }) 
            ];

        }
        break;
  }
}

//action for add new user
exports.postAddNewUser = async(req, res, next) => {
  var page_header_data = { 
    'page_title' : "User List", 
    "breadcrumb1": '<a href="/dashboard" class="text-muted">Home</a>', 
    "breadcrumb2": 'Add New User' 
    };

  try {
     const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions
    console.log(errors);
     if (!errors.isEmpty()) {
      logger.info("[uone][controllers/user.controller/postAddNewUser] Error: Validation Errors");
       res.render('pages/users/addNewUser', {
          errors :errors.array(),
          'page_title' : "User List",
          "breadcrumb1": '<a href="/dashboard" class="text-muted">Home</a>',
          "breadcrumb2": 'Add New User'
        });
        
        return;
     }

     //check username got characters other than allowed characters alphanumeric and _
     if (!req.body.username.match("^[a-zA-Z0-9_]*$")) {
          logger.info("[uone][controllers/user.controller/postAddNewUser] Error: username got restricted characters "+req.body.username);
          
          //res.status(400).json({ status: 'failed', code: '801', errors: ["Username only allowed with Alphanumeric and Underscore"] });
          res.render('pages/users/addNewUser', {
            errors : [
              {
                value: req.body.username,
                msg: 'Username only allowed with Alphanumeric and Underscore',
                param: 'username',
                location: 'body'
              },
            ],
            'page_title' : "User List",
            "breadcrumb1": '<a href="/dashboard" class="text-muted">Home</a>',
            "breadcrumb2": 'Add New User'
          });

          return;
      }
    
    //check username got any white spaces
    if (/\s/.test(req.body.username)) {
      logger.info("[uone][controllers/user.controller/postAddNewUser] Error: username got white spaces "+req.body.username);

      res.render('pages/users/addNewUser', {
        errors : [
          {
            value: req.body.username,
            msg: 'Username should be without any spaces',
            param: 'username',
            location: 'body'
          },
        ],
        'page_title' : "User List",
        "breadcrumb1": '<a href="/dashboard" class="text-muted">Home</a>',
        "breadcrumb2": 'Add New User'
      });

      return;
    }
    
    if(req.body.username.indexOf(' ') >= 0) {
      logger.info("[uone][controllers/user.controller/postAddNewUser] Error: username contain spaces "+req.body.username);
      
      res.render('pages/users/addNewUser', {
        errors : [
          {
            value: req.body.username,
            msg: 'Username should be without any spaces',
            param: 'username',
            location: 'body'
          },
        ],
        'page_title' : "User List",
        "breadcrumb1": '<a href="/dashboard" class="text-muted">Home</a>',
        "breadcrumb2": 'Add New User'
      });

      return;
    }
    
     //check username already exist for other user then return error
    // Is username already used by other user?
    let user_username_check;
    
    if(req.body.username !== null && req.body.username !== '') {
      logger.info("[uone][controllers/user.controller/postAddNewUser] Error: Username is not Null and not empty from Request "+req.body.username);

      user_username_check = await User.findOne({
        where: {
          username: req.body.username
        }
      });
    }
    
    if(user_username_check)
    {
      logger.info("[uone][controllers/user.controller/postAddNewUser] Error: User record Already Exist with this Username "+req.body.username);
      
      res.render('pages/users/addNewUser', {
        errors : [
          {
            value: req.body.username,
            msg: 'Username already taken.',
            param: 'username',
            location: 'body'
          },
        ],
        'page_title' : "User List",
        "breadcrumb1": '<a href="/dashboard" class="text-muted">Home</a>',
        "breadcrumb2": 'Add New User'
      });

      return;
    }

    //check entered wallet address is valid etherum address or not
    if (!Uone.web3.utils.isAddress(req.body.user_public_address)) {
      logger.info("[uone][controllers/user.controller/updateUserProfile] Error: User record Already Exist with this Username "+req.body.user_public_address);
      
      res.render('pages/users/addNewUser', {
        errors : [
          {
            value: req.body.user_public_address,
            msg: 'This is not an Ethereum address',
            param: 'username',
            location: 'body'
          },
        ],
        'page_title' : "User List",
        "breadcrumb1": '<a href="/dashboard" class="text-muted">Home</a>',
        "breadcrumb2": 'Add New User'
      });

      return;
    }
    
    //check wallet address already exist
    let user_wallet_address_check;
    
    if(req.body.user_public_address !== null && req.body.user_public_address !== '') {
      logger.info("[uone][controllers/user.controller/postAddNewUser] Error: Username is not Null and not empty from Request "+req.body.user_public_address);

      user_wallet_address_check = await User.findOne({
        where: {
          user_public_address: req.body.user_public_address
        }
      });
    }
    
    if(user_wallet_address_check)
    {
      logger.info("[uone][controllers/user.controller/postAddNewUser] Error: User record Already Exist with this wallet address "+req.body.user_public_address);
      
      res.render('pages/users/addNewUser', {
        errors : [
          {
            value: req.body.user_public_address,
            msg: 'User already exist with this wallet address',
            param: 'user_public_address',
            location: 'body'
          },
        ],
        'page_title' : "User List",
        "breadcrumb1": '<a href="/dashboard" class="text-muted">Home</a>',
        "breadcrumb2": 'Add New User'
      });

      return;
    }

    //all Validation pass, insert user record
    logger.info("[uone][controllers/user.controller/postAddNewUser] Validation Pass");
    const userinfo = {
      username: req.body.username,
      user_public_address: req.body.user_public_address,
      user_uuid: uuidv4(),
    };
    const userData = await User.create(userinfo);
    logger.info("[uone][controllers/user.controller/postAddNewUser] User Record created");

    res.render('pages/users/userList', {
      'success_msg': "User Added Successfully",
      'page_title' : "All Users List", 
      "breadcrumb1": '<a href="#" class="text-muted">Home</a>', 
      "breadcrumb2": '<a href="#" class="text-muted">All Users</a>',
      'req': req
    });

    return;
    
  } catch(err) {
    return next(err)
  }
}

//export sales report to Excel
exports.UserListExportExcel = async (req, res) => {
  logger.info("[uone][controllers/user.controller/UserListExportExcel]");

  let input = req.query;
  let order_by = "createdAt";
  let serial_number = 0;

  let query = `SELECT users.*, ca.id as curated_artist_id 
                FROM 
                users 
                LEFT JOIN curated_artists as ca ON ca.userId=users.id where 1 = 1
                `;

    //search by user wallet Address
    if (typeof (input.user_wallet_address) != 'undefined' && input.user_wallet_address) {
      logger.info('[uone][controllers/user.controller/populateAllUsers Search Term for search by user wallet address] '+input.user_wallet_address);
      query += " AND (users.user_public_address LIKE '%" + input.user_wallet_address + "%' OR users.username LIKE '%" + input.user_wallet_address + "%')";
    }
    //search by user status
    if (typeof (input.user_status) != 'undefined' && input.user_status) {
      logger.info('[uone][controllers/user.controller/populateAllUsers Search Term for search by user status] '+input.user_status);
      query += " AND users.is_ban =" + input.user_status;
    }

    //search by user whitelist status
    if (typeof (input.is_wallet_whitelisted) != 'undefined' && input.is_wallet_whitelisted) {
      logger.info('[uone][controllers/user.controller/populateAllUsers Search Term for search by user whitelisted status] '+input.is_wallet_whitelisted);
      query += " AND users.is_kyc_verified =" + input.is_wallet_whitelisted;
    }
    //is_mint_allowed
    //search by user whitelist status
    if (typeof (input.is_mint_allowed) != 'undefined' && input.is_mint_allowed) {
      logger.info('[uone][controllers/user.controller/populateAllUsers Search Term for search by user mint status] '+input.is_mint_allowed);
      query += " AND users.is_mint_allow =" + input.is_mint_allowed;
    }
    
    query +=" ORDER BY users.createdAt DESC";
    
    logger.info('[uone][controllers/user.controller/populateAllUsers Query] '+query);

    const users = await Sequelize.query(`${query}`,
                            { type: QueryTypes.SELECT }
          ).then((users) => {
    users = JSON.parse(JSON.stringify(users));
    let recordsFiltered = users.length;
    console.log("filtered records");
    console.log(recordsFiltered);
    
    let formatted_result = [];
    users.forEach((obj) => {

      let kyc_verified_at = ``;
      if(obj.kyc_approval_at != null)
      {
        kyc_verified_at = moment.utc(obj.kyc_approval_at).format("DD/MM/YYYY hh:mm:ss");
      }
      else {
            kyc_verified_at = '- NA -'
      }

      let user_status = ``;
      if(obj.is_ban==0)
      {
        user_status = 'Active';
      }
      else {
        user_status = 'Banned';
      }

      let is_kyc_verified = ``;
      if(obj.is_kyc_verified == 1) {
        is_kyc_verified = 'YES';
      } else {
        is_kyc_verified = 'NO';
      }

      let is_mint_allow = ``;
      if(obj.is_mint_allow == 1) {
        is_mint_allow = 'YES';
      } else {
        is_mint_allow = 'NO';
      }

      formatted_result.push({
        sno: (serial_number += 1),
        user_name: obj.username,
        user_wallet_address: obj.user_public_address,
        email: obj.email,
        user_status: user_status,
        is_kyc_verified: is_kyc_verified,
        kyc_approval_at: kyc_verified_at,
        is_mint_allow: is_mint_allow,
        //kyc_approval_at: moment.utc(obj.kyc_approval_at).format("DD/MM/YYYY hh:mm:ss")
      });
    });
    
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("BAS_USER_REPORT");

    worksheet.columns = [
      { header: "Sno", key: "sno", width: 5 },
      { header: "Username", key: "user_name", width: 46 },
      { header: "Wallet Address", key: "user_wallet_address", width: 46 },
      { header: "Email", key: "email", width: 46 },
      //{ header: "User Status", key: "user_status", width: 15 },
      { header: "Is KYC Verified?", key: "is_kyc_verified", width: 15 },
      { header: "KYC Appproved At", key: "kyc_approval_at", width: 20 },
      { header: "Is Mint Allowed", key: "is_mint_allow", width: 15 },

    ];

    // Add Array Rows
    worksheet.addRows(formatted_result);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "BAS_USER_REPORT_"+moment().format()+".xlsx"
    );

    return workbook.xlsx.write(res).then(function () {
      //res.json({ success: true });
      res.status(200).end();
    });
    
  });

};



