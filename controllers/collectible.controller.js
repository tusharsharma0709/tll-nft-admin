const Uone = require('../uone.js');
const db = require("../models");
const Op = db.Sequelize.Op;
const QueryTypes = db.Sequelize.QueryTypes;

const Sequelize = db.sequelize;
const { check, checkSchema, body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const logger = Uone.logger;
const lib = require('../includes/common.functions');

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
  UserFollower
} = require("../includes/include.models.js");

exports.getAllCollectibles = async (req, res) => {
  logger.info('[uone][controllers/collectible.controller/getAllCollectibles]');
  var page_header_data = {
    'page_title': "All Collectibles List",
    'breadcrumb1': '<a href="/dashboard" class="text-muted">Dashboard</a>',
    'breadcrumb2': 'All Collectibles',
    'req': req
  };
  res.render('pages/collectibles/collectibleList', page_header_data);
};

exports.populateAllCollectibles = async (req, res) => {
  logger.info('[uone][controllers/collectible.controller/populateAllCollectibles]');
  let input = req.body;
  let limit = parseInt(input.length);
  let skip = parseInt(input.start);
  let asc_desc = input.order[0].dir;
  let sort_column = parseInt(input.order[0].column);
  let order_by = "createdAt";
  let serial_number = skip;

  let query = `SELECT c.*, fc.collectibleId FROM collectibles c
                  LEFT JOIN featured_collectibles fc ON fc.collectibleId = c.id
                  WHERE 1 = 1`;
  /*other example queries
  SELECT *
  FROM collectiblesales
  RIGHT JOIN collectibles
  ON collectiblesales.collectibleId = collectibles.id WHERE collectibles.collectible_name LIKE '%Dangerous%';
   SELECT 
  * 
  FROM 
  collectibles 
  LEFT JOIN 
  collectiblesales ON collectiblesales.collectibleId=collectibles.id
  WHERE collectibles.collectible_name LIKE '%Dangerous%';
   SELECT 
    cb.id, cb.collectibleId, cb.tokenId, cb.userId, cb.tokenAddress, cb.user_public_address AS owner_public_address, cb.quantity AS owner_balance,
    c.user_public_address AS created_wallet_address, c.collectible_name, c.collectible_description, c.collectible_category, c.cost AS created_cost, c.collectible_type, c.is_hide, c.is_ban, 
    cs.user_public_address AS onsale_wallet_address, cs.quantity AS onsale_quantity, cs.onsale, cs.onsale_current_price
  FROM 
  collectiblebalance cb
  INNER JOIN collectibles c ON cb.collectibleId = c.id
  LEFT JOIN collectiblesales cs ON cs.collectibleId = cb.collectibleId
  WHERE 
  cb.quantity > 0
  GROUP BY cb.id;
  */

  //check for any filters from search form
  var str_cond = "";
  //search by collectible name
  if (typeof input.search_collectible != 'undefined' && input.search_collectible) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Search Term for search by collectible name] ' + input.search_collectible);
    query += " AND (c.collectible_name LIKE '%" + input.search_collectible + "%' OR c.collectible_category LIKE '%" + input.search_collectible + "%')";
  }

  if (typeof input.token_type != 'undefined' && input.token_type) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Token type] ' + input.token_type);
    query += " AND c.collectible_type='" + input.token_type + "' ";
  }

  //search by collectible category
  if (typeof input.search_collectible_by_category != 'undefined' && input.search_collectible_by_category) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Search Term for search by collectible Category] ' + input.search_collectible_by_category);
    query += " AND (c.collectible_category LIKE '%" + input.search_collectible_by_category + "%')";
  }

  //search by creator
  if (typeof input.search_collectible_by_artist != 'undefined' && input.search_collectible_by_artist) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Search Term for search by collectible Artist] ' + input.search_collectible_by_artist);
    query += " AND c.user_public_address='" + input.search_collectible_by_artist + "' ";
  }

  //search collectible by ban status active/banned
  if (typeof input.collectible_ban_status != 'undefined' && input.collectible_ban_status) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Search Term for search by collectible ban status] ' + input.collectible_ban_status);
    query += " AND c.is_ban ='" + input.collectible_ban_status + "' ";
  }

  //search collectible by hide status
  if (typeof input.collectible_hide_status != 'undefined' && input.collectible_hide_status) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Search Term for search by collectible hide status] ' + input.collectible_hide_status);
    query += " AND c.is_hide ='" + input.collectible_hide_status + "' ";
  }

  //search collectible by featured status
  if (typeof input.collectible_featured_status != 'undefined' && input.collectible_featured_status) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Search Term for search by collectible featured status] ' + input.collectible_featured_status);
    if (input.collectible_featured_status == 0) {
      query += " AND fc.collectibleId IS NULL";
    }
    if (input.collectible_featured_status == 1) {
      query += " AND fc.collectibleId IS NOT NULL";
    }
  }

  //search collectible by burn status
  if (typeof input.collectible_burn_status != 'undefined' && input.collectible_burn_status) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Search Term for search by collectible burn status] ' + input.collectible_burn_status);
    query += " AND c.is_burn ='" + input.collectible_burn_status + "' ";
  }

  query += " GROUP BY c.id ORDER BY c.createdAt DESC";
  logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Query] ' + query);

  const collectible_count = await Sequelize.query(`${query}`, { type: QueryTypes.SELECT });
  const collectibles = await Sequelize.query(`${query} limit ${limit} OFFSET ${skip}`, { type: QueryTypes.SELECT }).then(collectibles => {

    collectibles = JSON.parse(JSON.stringify(collectibles));
    let recordsFiltered = collectibles.length;
    console.log("filtered records");
    console.log(recordsFiltered);
    let formatted_result = [];
    collectibles.forEach(element => {
      let actions = ``;
      actions += `<div class="dropdown dropdown-inline">
                <a href="javascript:;" class="btn btn-sm btn-clean btn-icon" data-toggle="dropdown">
                  <i class="la la-cog"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-sm dropdown-menu-right">
                <ul class="nav nav-hoverable flex-column">`;
      actions += `<li class="nav-item"><a class="nav-link view_collectible_details" href="${process.env.FE_URL + "token/" + element.collectible_uuid + "/" + element.user_public_address}"  target="_blank" data-id="${element.id}" data-cmd="view"><i class="nav-icon fas fa-eye"></i><span class="nav-text">View Details</span></a></li>`;
      actions += `<li class="nav-item"><a class="nav-link edit_collectible_details" href="${"/editCollectible?collectible_id=" + element.id + "&collectible_uuid=" + element.collectible_uuid + "&collectible_name=" + element.collectible_name}" data-id="${element.id}"><i class="nav-icon fas fa-edit"></i><span class="nav-text">Edit</span></a></li>`;
      actions += `<li class="nav-item"><a class="nav-link change_collectible_status" href="#" data-id="${element.id}" data-cmd="${element.is_hide == 0 ? 'hide' : 'show'}"><i class="nav-icon fas fa-globe"></i><span class="nav-text">${element.is_hide == 0 ? 'Hide' : 'Show'}</span></a></li>`;
      actions += `<li class="nav-item"><a class="nav-link change_collectible_status" href="#" data-id="${element.id}" data-cmd="${element.is_ban == 0 ? 'ban' : 'unban'}"><i class="nav-icon fas fa-ban"></i><span class="nav-text">${element.is_ban == 0 ? 'Ban' : 'Un-ban'}</span></a></li>`;
      if (element.is_burn == 0) {
        actions += `<li class="nav-item"><a class="nav-link view_collectible_owner_details" href="${"/viewCollectibleOwners?collectible_uuid=" + element.collectible_uuid + "&collectible_name=" + element.collectible_name}" data-id="${element.id}"><i class="nav-icon fas fa-search"></i><span class="nav-text">View Owners</span></a></li>`;
      }
      actions += `<li class="nav-item"><a class="nav-link change_featured_art_status" href="#" data-id="${element.id}" data-cmd="${element.collectibleId != null ? 'undo_featured_art' : 'make_featured_art'}"><i class="nav-icon fas fa-bookmark"></i><span class="nav-text">${element.collectibleId != null ? 'Undo-Featured' : 'Make Featured'}</span></a></li>`;
      actions += `</ul>
							  	</div>
							      </div>
                `;
      //shop.productImagesTemp  = shop.productImages;
      formatted_result.push([serial_number += 1, element.collectible_name, element.collectible_category, element.collectible_type, element.noOfCopies, element.user_public_address, element.is_hide == 0 ? '<span class="label label-success label-pill label-inline mr-2">Public</span>' : '<span class="label label-danger label-pill label-inline mr-2">Hidden</span>', element.is_ban == 0 ? '<span class="label label-success label-pill label-inline mr-2">Active</span>' : '<span class="label label-danger label-pill label-inline mr-2">Banned</span>', element.collectibleId != null ? '<span class="label label-success label-pill label-inline mr-2">YES</span>' : '<span class="label label-danger label-pill label-inline mr-2">NO</span>', element.is_burn == 0 ? '<span class="label label-success label-pill label-inline mr-2">NO</span>' : '<span class="label label-danger label-pill label-inline mr-2">YES</span>', actions
      /* `<div class="dropdown dropdown-inline">
      <a href="javascript:;" class="btn btn-sm btn-clean btn-icon" data-toggle="dropdown">
           <i class="la la-cog"></i>
         </a>
      <div class="dropdown-menu dropdown-menu-sm dropdown-menu-right">
      <ul class="nav nav-hoverable flex-column">
      <li class="nav-item"><a class="nav-link view_collectible_details" href="${process.env.FE_URL+"token/"+element.collectible_uuid+"/"+element.user_public_address}"  target="_blank" data-id="${element.id}" data-cmd="view"><i class="nav-icon fas fa-eye"></i><span class="nav-text">View Details</span></a></li>
      <li class="nav-item"><a class="nav-link edit_collectible_details" href="${"/editCollectible?collectible_id="+element.id+"&collectible_uuid="+element.collectible_uuid+"&collectible_name="+element.collectible_name}" data-id="${element.id}"><i class="nav-icon fas fa-edit"></i><span class="nav-text">Edit</span></a></li>
            <li class="nav-item"><a class="nav-link change_collectible_status" href="#" data-id="${element.id}" data-cmd="${element.is_hide==0 ? 'hide':'show'}"><i class="nav-icon fas fa-globe"></i><span class="nav-text">${element.is_hide==0 ? 'Hide':'Show'}</span></a></li>
      <li class="nav-item"><a class="nav-link change_collectible_status" href="#" data-id="${element.id}" data-cmd="${element.is_ban==0 ? 'ban':'unban'}"><i class="nav-icon fas fa-ban"></i><span class="nav-text">${element.is_ban==0 ? 'Ban':'Un-ban'}</span></a></li>
            <li class="nav-item"><a class="nav-link view_collectible_owner_details" href="${"/viewCollectibleOwners?collectible_uuid="+element.collectible_uuid+"&collectible_name="+element.collectible_name}" data-id="${element.id}"><i class="nav-icon fas fa-search"></i><span class="nav-text">View Owners</span></a></li>
            <li class="nav-item"><a class="nav-link change_featured_art_status" href="#" data-id="${element.id}" data-cmd="${element.collectibleId != null ? 'undo_featured_art':'make_featured_art'}"><i class="nav-icon fas fa-bookmark"></i><span class="nav-text">${element.collectibleId != null ? 'Undo-Featured':'Make Featured'}</span></a></li>
            </ul>
      </div>
      </div>`*/
      ]);
    });
    //console.log(collectibles.length);
    res.json({
      "draw": input.draw,
      "recordsTotal": collectibles.length,
      "recordsFiltered": collectible_count.length,
      "data": formatted_result
    });
  });
};

//get collectible owners List
exports.viewCollectibleOwners = async (req, res) => {
  logger.info('[uone][controllers/collectible.controller/viewCollectibleOwners]');
  var page_header_data = {
    'page_title': "Collectible Owners",
    "breadcrumb1": '<a href="/dashboard" class="text-muted">Dashboard</a>',
    "breadcrumb2": '<a href="/getAllCollectibles" class="text-muted">All Collectibles</a>',
    "breadcrumb3": 'Collectible Owners List',
    "req": req
  };
  res.render('pages/collectibles/collectibleOwnerList', page_header_data);
};

//populate collectible owners data
exports.populateCollectibleOwners = async (req, res) => {
  logger.info('[uone][controllers/collectible.controller/populateCollectibleOwners]');
  let input = req.body;
  let limit = parseInt(input.length);
  let skip = parseInt(input.start);
  let asc_desc = input.order[0].dir;
  let sort_column = parseInt(input.order[0].column);
  let order_by = "createdAt";
  let serial_number = skip;

  let query = `SELECT 
                  cb.id, cb.collectibleId, cb.tokenId, cb.userId, cb.tokenAddress, cb.user_public_address AS owner_public_address, cb.quantity AS owner_balance, cb.createdAt as saleDate,
                  c.collectible_uuid, c.user_public_address AS created_wallet_address, c.collectible_name, c.collectible_description, c.collectible_category, c.cost AS created_cost, c.collectible_type, c.is_hide, c.is_ban, 
                  cs.user_public_address AS onsale_wallet_address, cs.quantity AS onsale_quantity, cs.onsale, cs.onsale_current_price,
                  cc.id as curated_collectible_id
                FROM 
                  collectiblebalance cb
                INNER JOIN collectibles c ON cb.collectibleId = c.id
                LEFT JOIN collectiblesales cs ON cs.collectibleId = cb.collectibleId
                LEFT JOIN curated_collectibles cc ON cc.collectibleBalanceId = cb.id
                WHERE cb.quantity > 0
                `;
  query += " AND c.collectible_uuid='" + input.collectible_uuid + "' ";

  //check for any filters from search form
  var str_cond = "";
  //search by collectible name
  if (typeof input.search_collectible != 'undefined' && input.search_collectible) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Search Term for search by collectible name] ' + input.search_collectible);
    query += " AND (collectible_name LIKE '%" + input.search_collectible + "%' OR collectible_category LIKE '%" + input.search_collectible + "%')";
  }

  if (typeof input.token_type != 'undefined' && input.token_type) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Token type] ' + input.token_type);
    query += " AND collectible_type='" + input.token_type + "' ";
  }

  //search by collectible category
  if (typeof input.search_collectible_by_category != 'undefined' && input.search_collectible_by_category) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Search Term for search by collectible Category] ' + input.search_collectible_by_category);
    query += " AND (collectible_category LIKE '%" + input.search_collectible_by_category + "%')";
  }

  //search by creator
  if (typeof input.search_collectible_by_artist != 'undefined' && input.search_collectible_by_artist) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Search Term for search by collectible Artist] ' + input.search_collectible_by_artist);
    query += " AND created_wallet_address='" + input.search_collectible_by_artist + "' ";
  }

  //search by owner
  if (typeof input.search_collectible_by_owner != 'undefined' && input.search_collectible_by_owner) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Search Term for search by collectible Owner] ' + input.search_collectible_by_owner);
    query += " AND cb.user_public_address='" + input.search_collectible_by_owner + "' ";
  }

  query += " GROUP BY cb.id ORDER BY saleDate DESC";
  logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Query] ' + query);

  const collectible_count = await Sequelize.query(`${query}`, { type: QueryTypes.SELECT });
  const collectibles = await Sequelize.query(`${query} limit ${limit} OFFSET ${skip}`, { type: QueryTypes.SELECT }).then(collectibles => {

    collectibles = JSON.parse(JSON.stringify(collectibles));
    let recordsFiltered = collectibles.length;
    console.log("filtered records");
    console.log(recordsFiltered);
    let formatted_result = [];
    collectibles.forEach(element => {

      //shop.productImagesTemp  = shop.productImages;
      formatted_result.push([serial_number += 1, element.collectible_name, element.collectible_category, element.collectible_type, element.created_wallet_address, element.owner_public_address, element.owner_balance, element.is_hide == 0 ? '<span class="label label-success label-pill label-inline mr-2">Public</span>' : '<span class="label label-danger label-pill label-inline mr-2">Hidden</span>', element.is_ban == 0 ? '<span class="label label-success label-pill label-inline mr-2">Active</span>' : '<span class="label label-danger label-pill label-inline mr-2">Banned</span>', element.curated_collectible_id != null ? '<span class="label label-success label-pill label-inline mr-2">YES</span>' : '<span class="label label-danger label-pill label-inline mr-2">NO</span>', `<div class="dropdown dropdown-inline">
								                        <a href="javascript:;" class="btn btn-sm btn-clean btn-icon" data-toggle="dropdown">
	                                        <i class="la la-cog"></i>
	                                      </a>
							  	                    <div class="dropdown-menu dropdown-menu-sm dropdown-menu-right">
									                      <ul class="nav nav-hoverable flex-column">
							    		                    <li class="nav-item"><a class="nav-link view_collectible_details" href="${process.env.FE_URL + "token/" + element.collectible_uuid + "/" + element.created_wallet_address}"  target="_blank" data-cmd="view"><i class="nav-icon fas fa-eye"></i><span class="nav-text">View Details</span></a></li>
							    	                      <li class="nav-item"><a class="nav-link change_curate_art_status" href="#" data-id="${element.id}" data-collectibleid="${element.collectibleId}" data-cmd="${element.curated_collectible_id != null ? 'undo_curated' : 'make_curated'}"><i class="nav-icon fas fa-bookmark"></i><span class="nav-text">${element.curated_collectible_id != null ? 'Undo-Curated' : 'Make Curated'}</span></a></li>
                                          </ul>
							  	                    </div>
							                      </div>`]);
    });
    //console.log(collectibles.length);
    res.json({
      "draw": input.draw,
      "recordsTotal": collectibles.length,
      "recordsFiltered": collectible_count.length,
      "data": formatted_result
    });
  });
};

//update collectible status
exports.updateCollectibleStatus = async (req, res) => {
  logger.info('[uone][controllers/collectible.controller/updateCollectibleStatus]');
  logger.info("[uone][controllers/collectible.controller/updateCollectibleStatus] id to update is" + req.body.id);
  logger.info("[uone][controllers/collectible.controller/updateCollectibleStatus] cmd to update is" + req.body.cmd);
  var query = {};
  var update = {};
  if (req.body.cmd == "hide") {
    query.is_hide = true;
    await db.sequelize.query("UPDATE collectibles SET is_hide=? WHERE id=?", {
      replacements: [true, req.body.id],
      type: QueryTypes.UPDATE
    });
  }
  //show
  if (req.body.cmd == "show") {
    query.is_hide = true;
    await db.sequelize.query("UPDATE collectibles SET is_hide=? WHERE id=?", {
      replacements: [false, req.body.id],
      type: QueryTypes.UPDATE
    });
  }
  if (req.body.cmd == "ban") {
    query.is_ban = true;
    await db.sequelize.query("UPDATE collectibles SET is_ban=? WHERE id=?", {
      replacements: [true, req.body.id],
      type: QueryTypes.UPDATE
    });
  }
  //unban
  if (req.body.cmd == "unban") {
    query.is_ban = true;
    await db.sequelize.query("UPDATE collectibles SET is_ban=? WHERE id=?", {
      replacements: [false, req.body.id],
      type: QueryTypes.UPDATE
    });
  }

  res.json({ success: true });
};

//list of all collections
exports.getAllCollections = async (req, res) => {
  logger.info('[uone][controllers/collectible.controller/getAllCollections]');
  var page_header_data = {
    'page_title': "All Collectiions List",
    "breadcrumb1": '<a href="/dashboard" class="text-muted">Dashboard</a>',
    "breadcrumb2": 'All Collections',
    'req': req
  };
  res.render('pages/collectibles/collectionList', page_header_data);
};

exports.populateAllCollections = async (req, res) => {
  logger.info('[uone][controllers/collectible.controller/populateAllCollections]');
  let input = req.body;
  let limit = parseInt(input.length);
  let skip = parseInt(input.start);
  let asc_desc = input.order[0].dir;
  let sort_column = parseInt(input.order[0].column);
  let order_by = "createdAt";
  let serial_number = skip;
  let query = "SELECT * FROM collections where 1 = 1";

  //search by collection name
  if (typeof input.collection_name != 'undefined' && input.collection_name) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollections Search Term for search by collection name] ' + input.collection_name);
    query += " AND (tokenName LIKE '%" + input.collection_name + "%' OR tokenCode LIKE '%" + input.collection_name + "%')";
  }

  if (typeof input.token_type != 'undefined' && input.token_type) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollections Token type] ' + input.token_type);
    query += " AND tokenType='" + input.token_type + "' ";
  }

  //search by collectible category
  if (typeof input.collection_type != 'undefined' && input.collection_type) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollections Search Term for search by collection type] ' + input.collection_type);
    query += " AND collectiontype ='" + input.collection_type + "' ";
  }

  query += " ORDER BY createdAt DESC";
  logger.info('[uone][controllers/collectible.controller/populateAllCollections Query] ' + query);

  const collection_count = await Sequelize.query(`${query}`, { type: QueryTypes.SELECT });
  const collections = await Sequelize.query(`${query} limit ${limit} OFFSET ${skip}`, { type: QueryTypes.SELECT }).then(collections => {

    collections = JSON.parse(JSON.stringify(collections));
    let recordsFiltered = collections.length;
    console.log("filtered records");
    console.log(recordsFiltered);
    let formatted_result = [];
    collections.forEach(element => {

      //shop.productImagesTemp  = shop.productImages;
      formatted_result.push([serial_number += 1, element.tokenName, element.tokenCode, element.tokenType, element.collectiontype, element.userPublicAddress, `<div class="dropdown dropdown-inline">
								                        <a href="javascript:;" class="btn btn-sm btn-clean btn-icon" data-toggle="dropdown">
	                                        <i class="la la-cog"></i>
	                                      </a>
							  	                    <div class="dropdown-menu dropdown-menu-sm dropdown-menu-right">
									                      <ul class="nav nav-hoverable flex-column">
							    		                    <li class="nav-item"><a class="nav-link" href="#"><i class="nav-icon la la-edit"></i><span class="nav-text">View Details</span></a></li>
							    	                    	<li class="nav-item"><a class="nav-link" href="#"><i class="nav-icon la la-leaf"></i><span class="nav-text">View Collectibles</span></a></li>
							    		                  </ul>
							  	                    </div>
							                      </div>`]);
    });
    //console.log(collectibles.length);
    res.json({
      "draw": input.draw,
      "recordsTotal": collections.length,
      "recordsFiltered": collection_count.length,
      "data": formatted_result
    });
  });
};

//handle curated arts status add/remove
exports.updateCuratedArtList = async (req, res) => {
  logger.info('[uone][controllers/collectible.controller/updateCuratedArtList]');
  logger.info("[uone][controllers/collectible.controller/updateCuratedArtList] id to update is" + req.body.id);
  logger.info("[uone][controllers/collectible.controller/updateCuratedArtList] collectibleId to update is" + req.body.collectible_id);
  logger.info("[uone][controllers/collectible.controller/updateCuratedArtList] cmd to update is" + req.body.cmd);

  var query = {};
  var update = {};
  if (req.body.cmd == "make_curated") {

    let collecible_exist = await db.sequelize.query(`
    SELECT 
      id
    FROM curated_collectibles 
    WHERE 
    curated_collectibles.collectibleBalanceId = ?
    ;    
    `, {
      replacements: [req.body.id],
      type: QueryTypes.SELECT
    });

    if (collecible_exist.length == 0) {
      logger.error('[uone][controllers/collectible.controller/updateCuratedArtList] Info: Collectible is not Curated Yet. id:', req.body.id);

      sql = 'INSERT INTO curated_collectibles (collectibleId, collectibleBalanceId) VALUES (?, ?);';
      await db.sequelize.query(sql, {
        replacements: [req.body.collectible_id, req.body.id],
        type: QueryTypes.INSERT
      });
    }
  }
  //undo curated
  if (req.body.cmd == "undo_curated") {

    await db.sequelize.query("DELETE FROM curated_collectibles WHERE collectibleBalanceId=?", {
      replacements: [req.body.id],
      type: QueryTypes.DELETE
    });
  }

  res.json({ success: true });
};

//get curated Arts Page
exports.getCuratedArts = async (req, res) => {
  logger.info('[uone][controllers/collectible.controller/getCuratedArts]');
  var page_header_data = {
    'page_title': "Curated Arts",
    'breadcrumb1': '<a href="/dashboard" class="text-muted">Dashboard</a>',
    'breadcrumb2': 'Settings',
    "breadcrumb3": 'Curated Arts',
    "req": req
  };
  res.render('pages/collectibles/curatedArtsList', page_header_data);
};

//populate curated arts page
exports.populateCuratedArts = async (req, res) => {
  logger.info('[uone][controllers/collectible.controller/populateCuratedArts]');
  let input = req.body;
  let limit = parseInt(input.length);
  let skip = parseInt(input.start);
  let asc_desc = input.order[0].dir;
  let sort_column = parseInt(input.order[0].column);
  let order_by = "createdAt";
  let serial_number = skip;

  let query = `SELECT 
                  cb.id, cb.collectibleId, cb.tokenId, cb.userId, cb.tokenAddress, cb.user_public_address AS owner_public_address, cb.quantity AS owner_balance, cb.createdAt as saleDate,
                  c.collectible_uuid, c.user_public_address AS created_wallet_address, c.collectible_name, c.collectible_description, c.collectible_category, c.cost AS created_cost, c.collectible_type, c.is_hide, c.is_ban, 
                  cc.id as curated_collectible_id, cc.createdAt as curated_on
                FROM 
                curated_collectibles cc
                INNER JOIN collectibles c ON cc.collectibleId = c.id
                INNER JOIN collectiblebalance cb ON cb.id = cc.collectibleBalanceId
                WHERE 1=1`;

  //check for any filters from search form
  logger.info("search by collectible owner with val" + input.search_collectible_by_owner);
  //search by collectible name
  if (typeof input.search_collectible_by_owner != 'undefined' && input.search_collectible_by_owner) {
    logger.info('[uone][controllers/collectible.controller/populateCuratedArts Search Term for search by owner] ' + input.search_collectible_by_owner);
    query += " AND cb.user_public_address='" + input.search_collectible_by_owner + "' ";
  }

  query += " GROUP BY cc.id ORDER BY curated_on DESC";
  logger.info('[uone][controllers/collectible.controller/populateCuratedArts Query] ' + query);

  const collectible_count = await Sequelize.query(`${query}`, { type: QueryTypes.SELECT });
  const collectibles = await Sequelize.query(`${query} limit ${limit} OFFSET ${skip}`, { type: QueryTypes.SELECT }).then(collectibles => {

    collectibles = JSON.parse(JSON.stringify(collectibles));
    let recordsFiltered = collectibles.length;
    console.log("filtered records");
    console.log(recordsFiltered);
    let formatted_result = [];
    collectibles.forEach(element => {

      //shop.productImagesTemp  = shop.productImages;
      formatted_result.push([serial_number += 1, element.collectible_name, element.collectible_category, element.collectible_type, element.created_wallet_address, element.owner_public_address, element.owner_balance, `<div class="dropdown dropdown-inline">
								                        <a href="javascript:;" class="btn btn-sm btn-clean btn-icon" data-toggle="dropdown">
	                                        <i class="la la-cog"></i>
	                                      </a>
							  	                    <div class="dropdown-menu dropdown-menu-sm dropdown-menu-right">
									                      <ul class="nav nav-hoverable flex-column">
							    		                    <li class="nav-item"><a class="nav-link view_collectible_details" href="${process.env.FE_URL + "token/" + element.collectible_uuid + "/" + element.created_wallet_address}"  target="_blank" data-cmd="view"><i class="nav-icon fas fa-eye"></i><span class="nav-text">View Details</span></a></li>
							    	                      <li class="nav-item"><a class="nav-link change_curate_art_status" href="#" data-actionfrom="curated_table" data-id="${element.id}" data-collectibleid="${element.collectibleId}" data-cmd="${element.curated_collectible_id != null ? 'undo_curated' : 'make_curated'}"><i class="nav-icon fas fa-bookmark"></i><span class="nav-text">${element.curated_collectible_id != null ? 'Undo-Curated' : 'Make Curated'}</span></a></li>
                                          </ul>
							  	                    </div>
							                      </div>`]);
    });
    //console.log(collectibles.length);
    res.json({
      "draw": input.draw,
      "recordsTotal": collectibles.length,
      "recordsFiltered": collectible_count.length,
      "data": formatted_result
    });
  });
};

//update featured arts status
exports.updateFeaturedArts = async (req, res) => {
  logger.info('[uone][controllers/collectible.controller/updateFeaturedArts]');
  logger.info("[uone][controllers/collectible.controller/updateFeaturedArts] id to update is" + req.body.id);
  logger.info("[uone][controllers/collectible.controller/updateFeaturedArts] cmd to update is" + req.body.cmd);

  var query = {};
  var update = {};
  if (req.body.cmd == "make_featured_art") {

    let collecible_exist = await db.sequelize.query(`
    SELECT 
      id
    FROM featured_collectibles 
    WHERE 
    featured_collectibles.collectibleId = ?
    ;    
    `, {
      replacements: [req.body.id],
      type: QueryTypes.SELECT
    });

    if (collecible_exist.length == 0) {
      logger.error('[uone][controllers/collectible.controller/updateFeaturedArts] Info: Collectible is not Featured Yet. id:', req.body.id);

      let check_max = await db.sequelize.query(`SELECT 
        featured_order
        FROM featured_collectibles order by featured_order desc limit 0,1
       ;    
      `, {
        type: QueryTypes.SELECT
      });
      var max_order;
      if (check_max.length == 0) {
        max_order = 1;
      } else {
        console.log("current max is" + parseInt(check_max[0].featured_order));
        max_order = parseInt(check_max[0].featured_order) + 1;
      }

      console.log("Max value is" + parseInt(max_order));
      sql = 'INSERT INTO featured_collectibles (collectibleId, featured_order) VALUES (?, ?);';
      await db.sequelize.query(sql, {
        replacements: [req.body.id, max_order],
        type: QueryTypes.INSERT
      });
    }
  }
  //undo curated
  if (req.body.cmd == "undo_featured_art") {

    await db.sequelize.query("DELETE FROM featured_collectibles WHERE collectibleId=?", {
      replacements: [req.body.id],
      type: QueryTypes.DELETE
    });
    //reshuffle order of featured arts
  }

  res.json({ success: true });
};

//get featured arts
exports.getFeaturedArts = async (req, res) => {
  logger.info('[uone][controllers/collectible.controller/getFeaturedArts]');
  var page_header_data = {
    'page_title': "Featured Arts",
    "breadcrumb1": '<a href="/dashboard" class="text-muted">Dashboard</a>',
    "breadcrumb2": 'Settings',
    "breadcrumb3": 'Featured Arts',
    "req": req
  };
  res.render('pages/collectibles/FeaturedArtsList', page_header_data);
};

//populateFeaturedArts
exports.populateFeaturedArts = async (req, res) => {
  logger.info('[uone][controllers/collectible.controller/populateFeaturedArts]');
  let input = req.body;
  let limit = parseInt(input.length);
  let skip = parseInt(input.start);
  let asc_desc = input.order[0].dir;
  let sort_column = parseInt(input.order[0].column);
  let order_by = "createdAt";
  let serial_number = skip;

  let query = `SELECT c.*, fc.collectibleId FROM collectibles c
                  INNER JOIN featured_collectibles fc ON fc.collectibleId = c.id
                  WHERE 1 = 1`;

  //search by collectible name
  if (typeof input.search_collectible != 'undefined' && input.search_collectible) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Search Term for search by collectible name] ' + input.search_collectible);
    query += " AND (c.collectible_name LIKE '%" + input.search_collectible + "%' OR c.collectible_category LIKE '%" + input.search_collectible + "%')";
  }

  if (typeof input.token_type != 'undefined' && input.token_type) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Token type] ' + input.token_type);
    query += " AND c.collectible_type='" + input.token_type + "' ";
  }

  //search by collectible category
  if (typeof input.search_collectible_by_category != 'undefined' && input.search_collectible_by_category) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Search Term for search by collectible Category] ' + input.search_collectible_by_category);
    query += " AND (c.collectible_category LIKE '%" + input.search_collectible_by_category + "%')";
  }

  //search by creator
  if (typeof input.search_collectible_by_artist != 'undefined' && input.search_collectible_by_artist) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Search Term for search by collectible Artist] ' + input.search_collectible_by_artist);
    query += " AND c.user_public_address='" + input.search_collectible_by_artist + "' ";
  }

  //search collectible by ban status active/banned
  if (typeof input.collectible_ban_status != 'undefined' && input.collectible_ban_status) {
    logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Search Term for search by collectible ban status] ' + input.collectible_ban_status);
    query += " AND c.is_ban ='" + input.collectible_ban_status + "' ";
  }

  query += " GROUP BY c.id ORDER BY fc.featured_order ASC";
  logger.info('[uone][controllers/collectible.controller/populateAllCollectibles Query] ' + query);

  const collectible_count = await Sequelize.query(`${query}`, { type: QueryTypes.SELECT });
  const collectibles = await Sequelize.query(`${query} limit ${limit} OFFSET ${skip}`, { type: QueryTypes.SELECT }).then(collectibles => {

    collectibles = JSON.parse(JSON.stringify(collectibles));
    let recordsFiltered = collectibles.length;
    console.log("filtered records");
    console.log(recordsFiltered);
    let formatted_result = [];
    collectibles.forEach(element => {

      //shop.productImagesTemp  = shop.productImages;
      formatted_result.push([serial_number += 1, element.collectible_name, element.collectible_category, element.collectible_type, element.noOfCopies, element.user_public_address, element.is_hide == 0 ? '<span class="label label-success label-pill label-inline mr-2">Public</span>' : '<span class="label label-danger label-pill label-inline mr-2">Hidden</span>', element.is_ban == 0 ? '<span class="label label-success label-pill label-inline mr-2">Active</span>' : '<span class="label label-danger label-pill label-inline mr-2">Banned</span>', element.collectibleId != null ? '<span class="label label-success label-pill label-inline mr-2">YES</span>' : '<span class="label label-danger label-pill label-inline mr-2">NO</span>', `<div class="dropdown dropdown-inline">
								                        <a href="javascript:;" class="btn btn-sm btn-clean btn-icon" data-toggle="dropdown">
	                                        <i class="la la-cog"></i>
	                                      </a>
							  	                    <div class="dropdown-menu dropdown-menu-sm dropdown-menu-right">
									                      <ul class="nav nav-hoverable flex-column">
							    		                    <li class="nav-item"><a class="nav-link view_collectible_details" href="${process.env.FE_URL + "token/" + element.collectible_uuid + "/" + element.user_public_address}"  target="_blank" data-id="${element.id}" data-cmd="view"><i class="nav-icon fas fa-eye"></i><span class="nav-text">View Details</span></a></li>
							    	                    	<li class="nav-item"><a class="nav-link change_collectible_status" href="#" data-id="${element.id}" data-cmd="${element.is_hide == 0 ? 'hide' : 'show'}"><i class="nav-icon fas fa-globe"></i><span class="nav-text">${element.is_hide == 0 ? 'Hide' : 'Show'}</span></a></li>
							    		                    <li class="nav-item"><a class="nav-link change_collectible_status" href="#" data-id="${element.id}" data-cmd="${element.is_ban == 0 ? 'ban' : 'unban'}"><i class="nav-icon fas fa-ban"></i><span class="nav-text">${element.is_ban == 0 ? 'Ban' : 'Un-ban'}</span></a></li>
                                          <li class="nav-item"><a class="nav-link view_collectible_owner_details" href="${"/viewCollectibleOwners?collectible_uuid=" + element.collectible_uuid + "&collectible_name=" + element.collectible_name}" data-id="${element.id}"><i class="nav-icon fas fa-search"></i><span class="nav-text">View Owners</span></a></li>
                                          <li class="nav-item"><a class="nav-link change_featured_art_status" href="#" data-actionfrom="featured_art_list" data-id="${element.id}" data-cmd="${element.collectibleId != null ? 'undo_featured_art' : 'make_featured_art'}"><i class="nav-icon fas fa-bookmark"></i><span class="nav-text">${element.collectibleId != null ? 'Undo-Featured' : 'Make Featured'}</span></a></li>
                                          </ul>
							  	                    </div>
							                      </div>`]);
    });
    //console.log(collectibles.length);
    res.json({
      "draw": input.draw,
      "recordsTotal": collectibles.length,
      "recordsFiltered": collectible_count.length,
      "data": formatted_result
    });
  });
};

//edit collectibl
exports.editCollectible = async (req, res) => {
  logger.info("[uone][controllers/collectible.controller/editCollectible]");

  var page_header_data = {
    page_title: "Collectible List",
    breadcrumb1: '<a href="/dashboard" class="text-muted">Home</a>',
    breadcrumb2: '<a href="/getAllCollectibles" class="text-muted">All Collectibles</a>',
    breadcrumb3: "Edit Collectible",
    req: req
  };
  const collectible = await Sequelize.query("SELECT * FROM collectibles WHERE collectible_uuid = ?", {
    replacements: [req.query.collectible_uuid],
    plain: true,
    type: QueryTypes.SELECT
  });
  if (collectible.length == 0) {
    req.flash("error", "Collectible not found with id = " + req.query.collectible_uuid);
    res.redirect("/getAllCollectibles");
  }
  //send collectible object along with header info
  page_header_data.collectible_data = collectible;

  res.render("pages/collectibles/editCollectible", page_header_data);
};

//action for edit collectible
exports.postEditCollectible = async (req, res, next) => {

  try {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions
    console.log(errors);
    if (!errors.isEmpty()) {
      logger.info("[uone][controllers/collectible.controller/postEditCollectible] Error: Validation Errors");
      return;
    }

    //all Validation pass, insert user record
    logger.info("[uone][controllers/collectible.controller/postEditCollectible] Validation Pass");
    const collectible_info = {
      collectible_category: req.body.collectible_category,
      lock_status: req.body.collectible_lock_status,
      locked_content: req.body.locked_content
    };

    const update = await Collectible.update(collectible_info, {
      where: { collectible_uuid: req.body.collectible_uuid },
      returning: true, // needed for affectedRows to be populated
      plain: true // makes sure that the returned instances are just plain objects
    });

    logger.info("[uone][controllers/user.controller/postAddNewUser] User Record created");

    res.json({ status: 'success', success_msg: "Data Updated Successfully", redirect_url: '/getAllCollectibles' });
    return;
  } catch (err) {
    return next(err);
  }
};

//validate function
exports.validate = method => {
  switch (method) {
    case 'editCollectible':
      {
        return [checkSchema({
          "collectible_category": {
            notEmpty: true,
            errorMessage: 'Collectible Category is required'
          },
          "collectible_lock_status": {
            notEmpty: true,
            errorMessage: 'Locked Status is required'
          }
        })];
      }
      break;
  }
};