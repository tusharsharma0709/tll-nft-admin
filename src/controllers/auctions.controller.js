const Uone = require('../uone.js');
const db = require("../models");
const Op = db.Sequelize.Op;
const QueryTypes = db.Sequelize.QueryTypes;

const Sequelize = db.sequelize;
const { check, checkSchema, body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const logger = Uone.logger;
const lib = require('../includes/common.functions');
const web3 = Uone.web3;
const moment = require('moment');

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
  CollectibleAuction,
  CollectibleBid
} = require("../includes/include.models.js");

exports.getAuctionsList = async (req, res) => {
    logger.info('[uone][controllers/auctions.controller/getAuctionsList]');
    var page_header_data = { 
                            'page_title' : "All Auctions List", 
                            'breadcrumb1': '<a href="/dashboard" class="text-muted">Dashboard</a>', 
                            'breadcrumb2': 'All Auctions',
                            'req': req
                            };
    res.render('pages/auctions/auctionList', page_header_data);
  };

//populateAllAuctions
exports.populateAllAuctions = async (req, res, next) => {
    logger.info('[uone][controllers/auctions.controller/populateAllAuctions]');
      let input = req.body;
      let limit = parseInt(input.length);
      let skip = parseInt(input.start);
      let asc_desc = input.order[0].dir;
      let sort_column = parseInt(input.order[0].column);
      let order_by = "createdAt";
      let serial_number = skip;
  
      let query = `SELECT ca.*, c.collectible_uuid, c.collectible_name, c.collectible_description, c.collectible_category FROM collectibleauctions ca
                    LEFT JOIN collectibles c ON c.id = ca.collectibleId
                    WHERE 1 = 1`;
     
        //check for any filters from search form
        var str_cond = "";
        //search by collectible name
        if (typeof (input.search_collectible) != 'undefined' && input.search_collectible) {
              logger.info('[uone][controllers/auctions.controller/populateAllAuctions Search Term for search by collectible name] '+input.search_collectible);
              query += " AND (c.collectible_name LIKE '%" + input.search_collectible + "%' OR c.collectible_category LIKE '%" + input.search_collectible + "%')";
        }
  
        if (typeof (input.token_type) != 'undefined' && input.token_type) {
          logger.info('[uone][controllers/auctions.controller/populateAllAuctions Token type] '+input.token_type);
          query += " AND c.collectible_type='" + input.token_type + "' ";
        }
  
        //search by Auction status
        if (typeof (input.filter_auction_status) != 'undefined' && input.filter_auction_status) {
          logger.info('[uone][controllers/auctions.controller/populateAllAuctions Search Term for search by Auction Status] '+input.filter_auction_status);
          query += " AND ca.status='" + input.filter_auction_status + "' ";
        }
        
        //search by creator
        if (typeof (input.search_collectible_by_artist) != 'undefined' && input.search_collectible_by_artist) {
          logger.info('[uone][controllers/auctions.controller/populateAllAuctions Search Term for search by collectible Artist] '+input.search_collectible_by_artist);
          query += " AND ca.seller_address='" + input.search_collectible_by_artist + "' ";
        }
  
        //search auction by featured status
        if (typeof (input.collectible_featured_status) != 'undefined' && input.collectible_featured_status) {
            logger.info('[uone][controllers/auctions.controller/populateAllAuctions Search by Auction Is Featured Status] '+input.collectible_featured_status);
            query += " AND ca.is_featured='" + input.collectible_featured_status + "' ";
          }

        query +=" GROUP BY ca.id ORDER BY ca.createdAt DESC";
        logger.info('[uone][controllers/collectible.controller/populateAllAuctions Query] '+query);
  
        const collectible_auction_count = await Sequelize.query(`${query}`, { type: QueryTypes.SELECT });
        const collectible_auctions = await Sequelize.query(`${query} limit ${limit} OFFSET ${skip}`, { type: QueryTypes.SELECT }).then( (collectible_auctions) => {
  
            collectible_auctions = JSON.parse(JSON.stringify(collectible_auctions));
              let recordsFiltered = collectible_auctions.length;
              console.log("filtered records");
              console.log(recordsFiltered);
              let formatted_result = [];
              collectible_auctions.forEach(  (element) => {
                let actions = ``;
                  actions += `<div class="dropdown dropdown-inline">
                  <a href="javascript:;" class="btn btn-sm btn-clean btn-icon" data-toggle="dropdown">
                    <i class="la la-cog"></i>
                  </a>
                  <div class="dropdown-menu dropdown-menu-sm dropdown-menu-right">
                  <ul class="nav nav-hoverable flex-column">`;
                  //actions += `<li class="nav-item"><a class="nav-link view_collectible_details" href="${process.env.FE_URL+"token/"+element.collectible_uuid+"/"+element.user_public_address}"  target="_blank" data-id="${element.id}" data-cmd="view"><i class="nav-icon fas fa-eye"></i><span class="nav-text">View Details</span></a></li>`;
                  //actions += `<li class="nav-item"><a class="nav-link edit_collectible_details" href="${"/editCollectible?collectible_id="+element.id+"&collectible_uuid="+element.collectible_uuid+"&collectible_name="+element.collectible_name}" data-id="${element.id}"><i class="nav-icon fas fa-edit"></i><span class="nav-text">Edit</span></a></li>`;
                  //actions += `<li class="nav-item"><a class="nav-link change_collectible_status" href="#" data-id="${element.id}" data-cmd="${element.is_hide==0 ? 'hide':'show'}"><i class="nav-icon fas fa-globe"></i><span class="nav-text">${element.is_hide==0 ? 'Hide':'Show'}</span></a></li>`;
                  //actions += `<li class="nav-item"><a class="nav-link change_collectible_status" href="#" data-id="${element.id}" data-cmd="${element.is_ban==0 ? 'ban':'unban'}"><i class="nav-icon fas fa-ban"></i><span class="nav-text">${element.is_ban==0 ? 'Ban':'Un-ban'}</span></a></li>`;
                  actions += `<li class="nav-item"><a class="nav-link view_auction_bid_details" href="${"/viewAuctionBids?auction_uuid="+element.id }" data-id="${element.id}"><i class="nav-icon fas fa-search"></i><span class="nav-text">View Bid List</span></a></li>`;
                  actions += `<li class="nav-item"><a class="nav-link change_auction_status" href="#" data-id="${element.id}" data-cmd="${element.is_featured==0 ? 'make_featured':'undo_featured'}"><i class="nav-icon fas fa-bookmark"></i><span class="nav-text">${element.is_featured==0 ? 'Make Featured':'Undo Featured'}</span></a></li>`;
                  //actions += `<li class="nav-item"><a class="nav-link change_featured_art_status" href="#" data-id="${element.id}" data-cmd="${element.collectibleId != null ? 'undo_featured_art':'make_featured_art'}"><i class="nav-icon fas fa-bookmark"></i><span class="nav-text">${element.collectibleId != null ? 'Undo-Featured':'Make Featured'}</span></a></li>`;
                  actions += `</ul>
                                    </div>
                                    </div>
                  `;
                  var now = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                  console.log("NOW"+now);
                  let status = ``;

                  /*if(element.status==1 && now <= element.auction_end) {
                    status += `<span class="label label-info label-pill label-inline mr-2">Active</span>`;
                  }
                  else if(element.status==2) {
                    status += `<span class="label label-danger label-pill label-inline mr-2">Cancelled</span>`;
                  }
                  else if(element.status==3 || now >= element.auction_end) {
                    status += `<span class="label label-success label-pill label-inline mr-2">Completed</span>`;
                  }*/
                  if(element.status==1) {
                    status += `<span class="label label-info label-pill label-inline mr-2">Active</span>`;
                  }
                  else if(element.status==2) {
                    status += `<span class="label label-danger label-pill label-inline mr-2">Cancelled</span>`;
                  }
                  else if(element.status==3) {
                    status += `<span class="label label-success label-pill label-inline mr-2">Completed</span>`;
                  }

                  var BN = web3.utils.BN;
                  var starting_price_bn = new BN(element.starting_price.toString());
                  var reserved_price_bn = new BN(element.reserved_price.toString());
                  //shop.productImagesTemp  = shop.productImages;
                  formatted_result.push([
                                      serial_number += 1,
                                      element.collectible_name,
                                      element.token_type,
                                      element.seller_address,
                                      element.quantity,
                                      element.currency_symbol,
                                      element.currency_address,
                                      web3.utils.fromWei(starting_price_bn, 'ether'),
                                      web3.utils.fromWei(reserved_price_bn, 'ether'),
                                      moment.utc(element.auction_start).format("DD/MM/YYYY hh:mm:ss"),
                                      moment.utc(element.auction_end).format("DD/MM/YYYY hh:mm:ss"),
                                      element.is_featured == 0 ? '<span class="label label-danger label-pill label-inline mr-2">NO</span>' : '<span class="label label-success label-pill label-inline mr-2">YES</span>',
                                      status,
                                      actions
                                  ])
  
              });
              //console.log(collectibles.length);
              res.json({
                                  "draw": input.draw,
                                  "recordsTotal": collectible_auctions.length,
                                  "recordsFiltered": collectible_auction_count.length,
                                  "data": formatted_result
                              });
  
          });
           
  };

  //view auction bids
  //
  exports.viewAuctionBids = async (req, res) => {
    logger.info('[uone][controllers/auctions.controller/viewAuctionBids]');
    var page_header_data = { 
                            'page_title' : "All Auctions List", 
                            'breadcrumb1': '<a href="/dashboard" class="text-muted">Dashboard</a>', 
                            "breadcrumb2": '<a href="/getAuctionsList" class="text-muted">All Auctions</a>',
                            "breadcrumb3": 'Bidding List',
                            'req': req
                            };
    res.render('pages/auctions/auctionBidList', page_header_data);
  };

  //populate Bids of auction
  exports.populateBidsOfAuction = async (req, res, next) => {
    logger.info('[uone][controllers/auctions.controller/populateBidsOfAuction]');
      let input = req.body;
      let limit = parseInt(input.length);
      let skip = parseInt(input.start);
      let asc_desc = input.order[0].dir;
      let sort_column = parseInt(input.order[0].column);
      let order_by = "createdAt";
      let serial_number = skip;
  
      let query = `SELECT cb.* FROM collectiblebids cb
                    WHERE 1 = 1`;
      query += " AND cb.collectibleAuctionId='" + input.auction_uuid + "' ";
        //check for any filters from search form
        var str_cond = "";
        
        //search by Auction status
        if (typeof (input.filter_auction_status) != 'undefined' && input.filter_auction_status) {
          logger.info('[uone][controllers/auctions.controller/populateAllAuctions Search Term for search by Auction Status] '+input.filter_auction_status);
          query += " AND ca.status='" + input.filter_auction_status + "' ";
        }
        
        //search by creator
        if (typeof (input.search_collectible_by_artist) != 'undefined' && input.search_collectible_by_artist) {
          logger.info('[uone][controllers/auctions.controller/populateAllAuctions Search Term for search by collectible Artist] '+input.search_collectible_by_artist);
          query += " AND ca.seller_address='" + input.search_collectible_by_artist + "' ";
        }
  
        query +=" ORDER BY cb.createdAt DESC";
        logger.info('[uone][controllers/auctions.controller/populateAllAuctions Query] '+query);
  
        const collectible_bid_count = await Sequelize.query(`${query}`, { type: QueryTypes.SELECT });
        const collectible_auction_bids = await Sequelize.query(`${query} limit ${limit} OFFSET ${skip}`, { type: QueryTypes.SELECT }).then( (collectible_auction_bids) => {
  
            collectible_bids = JSON.parse(JSON.stringify(collectible_auction_bids));
              let recordsFiltered = collectible_bids.length;
              console.log("filtered records");
              console.log(recordsFiltered);
              let formatted_result = [];
              collectible_bids.forEach(  (element) => {
                  var now = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                  console.log("NOW"+now);
                  let status = ``;

                  /*if(element.status==1 && now <= element.auction_end) {
                    status += `<span class="label label-info label-pill label-inline mr-2">Active</span>`;
                  }
                  else if(element.status==2) {
                    status += `<span class="label label-danger label-pill label-inline mr-2">Cancelled</span>`;
                  }
                  else if(element.status==3 || now >= element.auction_end) {
                    status += `<span class="label label-success label-pill label-inline mr-2">Completed</span>`;
                  }*/
                  if(element.status==1) {
                    status += `<span class="label label-info label-pill label-inline mr-2">Active</span>`;
                  }
                  else if(element.status==2) {
                    status += `<span class="label label-success label-pill label-inline mr-2">Won Bid</span>`;
                  }
                  else if(element.status==3) {
                    status += `<span class="label label-danger label-pill label-inline mr-2">Cancelled</span>`;
                  }

                  var BN = web3.utils.BN;
                  var price_bn = new BN(element.price.toString());
                  //shop.productImagesTemp  = shop.productImages;
                  formatted_result.push([
                                      serial_number += 1,
                                      element.bidder_address,
                                      web3.utils.fromWei(price_bn, 'ether'),
                                      moment.utc(element.createdAt).format("DD/MM/YYYY hh:mm:ss"),
                                      status
                                  ])
  
              });
              //console.log(collectibles.length);
              res.json({
                                  "draw": input.draw,
                                  "recordsTotal": collectible_bids.length,
                                  "recordsFiltered": collectible_bid_count.length,
                                  "data": formatted_result
                              });
  
          });
           
  };

  //change auction feature status
  //
  exports.updateAuctionStatus = async (req, res) => {
    logger.info('[uone][controllers/auctions.controller/updateAuctionStatus]');
    logger.info("[uone][controllers/auctions.controller/updateAuctionStatus] id to update is"+ req.body.id);
    logger.info("[uone][controllers/auctions.controller/updateAuctionStatus] cmd to update is"+ req.body.cmd);
    var query = {};
    var update = {};
    if(req.body.cmd == "make_featured") {
      query.is_hide = true;
        await db.sequelize.query("UPDATE collectibleauctions SET is_featured=? WHERE id=?", {
            replacements: [
                          true,
                          req.body.id
            ],
            type: QueryTypes.UPDATE
        });
    }
    //show
    if(req.body.cmd == "undo_featured") {
      query.is_hide = true;
        await db.sequelize.query("UPDATE collectibleauctions SET is_featured=? WHERE id=?", {
            replacements: [
                          false,
                          req.body.id
            ],
            type: QueryTypes.UPDATE
        });
    }
    
    res.json({ success: true });
  };
