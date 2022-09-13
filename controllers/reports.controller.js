const Uone = require("../uone.js");
const db = require("../models");
const Op = db.Sequelize.Op;
const QueryTypes = db.Sequelize.QueryTypes;

const Sequelize = db.sequelize;
const {
  check,
  checkSchema,
  body,
  validationResult
} = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const excel = require("exceljs");
const moment = require('moment');

const logger = Uone.logger;
const lib = require("../includes/common.functions");

const web3 = Uone.web3;

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

//Sales Report Data
exports.getSalesReport = async (req, res) => {
  logger.info("[uone][controllers/reports.controller/getSalesReport]");
  var page_header_data = {
    'page_title': "Sales Report",
    'breadcrumb1': '<a href="/dashboard" class="text-muted">Dashboard</a>',
    'breadcrumb2': 'Reports',
    'breadcrumb3': 'Sales Report',
    'req': req
  };
  res.render("pages/reports/saleReport", page_header_data);
};

exports.populateAllSales = async (req, res) => {
  logger.info("[uone][controllers/reports.controller/getSalesReport]");

  let input = req.body;
  let limit = parseInt(input.length);
  let skip = parseInt(input.start);
  let asc_desc = input.order[0].dir;
  let sort_column = parseInt(input.order[0].column);
  let order_by = "createdAt";
  let serial_number = skip;

  logger.info("from date from filter is" + input.from_date);
  logger.info("to date from filter is" + input.to_date);

  let query = `SELECT
                td.seller_address, td.buyer_address, td.value, td.price, td.createdAt, td.token_id, td.token_address,
                c.collectible_uuid, c.user_public_address AS created_wallet_address, c.collectible_name, c.collectible_description, c.collectible_category, c.cost AS created_cost, c.collectible_type, c.is_hide, c.is_ban 
                FROM transactions_data td
                INNER JOIN collectibles c
                ON td.token_id=c.tokenID AND td.token_address=c.tokenAddress 
                AND 
                td.status=true 
                AND 
                (td.action_type='buy' OR td.action_type='complete_auction')
                 `;

  //if any filters, need to amend the query here
  //search sale by token type
  if (typeof input.token_type != "undefined" && input.token_type) {
    logger.info("[uone][controllers/reports.controller/populateAllSales Token type] " + input.token_type);
    query += " AND c.collectible_type='" + input.token_type + "' ";
  }

  //search by token Address
  if (typeof input.search_sale_by_tokenid != "undefined" && input.search_sale_by_tokenid) {
    logger.info("[uone][controllers/reports.controller/populateAllSales Token ID] " + input.search_sale_by_token_address);
    query += " AND td.token_id='" + input.search_sale_by_tokenid + "' ";
  }

  //search by token Address
  if (typeof input.search_sale_by_token_address != "undefined" && input.search_sale_by_token_address) {
    logger.info("[uone][controllers/reports.controller/populateAllSales Token Address] " + input.search_sale_by_token_address);
    query += " AND td.token_address='" + input.search_sale_by_token_address + "' ";
  }

  //search with buyer wallet
  if (typeof input.search_sale_by_buyer != "undefined" && input.search_sale_by_buyer) {
    logger.info("[uone][controllers/reports.controller/populateAllSales Buyer] " + input.search_sale_by_buyer);
    query += " AND td.buyer_address='" + input.search_sale_by_buyer + "' ";
  }
  //search with seller wallet
  if (typeof input.search_sale_by_seller != "undefined" && input.search_sale_by_seller) {
    logger.info("[uone][controllers/reports.controller/populateAllSales Seller] " + input.search_sale_by_seller);
    query += " AND td.seller_address='" + input.search_sale_by_seller + "' ";
  }

  //search with transaction Date

  if (typeof input.from_date != "undefined" && input.from_date && typeof input.to_date != "undefined" && input.to_date) {
    logger.info("[uone][controllers/reports.controller/populateAllSales From Date] " + input.from_date + "to date " + input.to_date);
    query += " AND DATE(td.createdAt) >= '" + input.from_date + "' ";
    query += " AND DATE(td.createdAt) <='" + input.to_date + "' ";
  }

  query += " ORDER BY td.createdAt DESC";
  logger.info("[uone][controllers/reports.controller/populateAllSales Query] " + query);

  const sale_count = await Sequelize.query(`${query}`, {
    type: QueryTypes.SELECT
  });
  const sales = await Sequelize.query(`${query} limit ${limit} OFFSET ${skip}`, { type: QueryTypes.SELECT }).then(sales => {
    sales = JSON.parse(JSON.stringify(sales));
    let recordsFiltered = sales.length;
    console.log("filtered records");
    console.log(recordsFiltered);
    let formatted_result = [];
    sales.forEach(element => {
      //shop.productImagesTemp  = shop.productImages;
      logger.info("createdat at this moment" + element.createdAt);
      formatted_result.push([serial_number += 1, element.collectible_name, element.collectible_type, element.token_id, element.token_address, element.seller_address, element.buyer_address, element.value, web3.utils.fromWei(element.price, 'ether'), element.createdAt]);
    });
    //console.log(collectibles.length);
    res.json({
      draw: input.draw,
      recordsTotal: sales.length,
      recordsFiltered: sale_count.length,
      data: formatted_result
    });
  });
};

//export sales report to Excel
exports.exportExcel = async (req, res) => {
  logger.info("[uone][controllers/reports.controller/exportExcel]");

  let input = req.query;
  let order_by = "createdAt";
  let serial_number = 0;

  let query = `SELECT
  td.seller_address, td.buyer_address, td.value, td.price, td.createdAt, td.token_id, td.token_address, td.action_type,
                c.collectible_uuid, c.user_public_address AS created_wallet_address, c.collectible_name, c.collectible_description, c.collectible_category, c.cost AS created_cost, c.collectible_type, c.is_hide, c.is_ban 
                FROM transactions_data td
                INNER JOIN collectibles c
                ON td.token_id=c.tokenID AND td.token_address=c.tokenAddress 
                AND 
                td.status=true 
                AND 
                (td.action_type='buy' OR td.action_type='complete_auction')
                 `;
  //if any filters, need to amend the query here
  logger.info("token type from form is:" + req.query.token_type);
  //search sale by token type
  if (typeof input.token_type != "undefined" && input.token_type) {
    logger.info("[uone][controllers/reports.controller/exportExcel Token type] " + input.token_type);
    query += " AND c.collectible_type='" + input.token_type + "' ";
  }

  //search by token Address
  if (typeof input.token_id != "undefined" && input.token_id) {
    logger.info("[uone][controllers/reports.controller/exportExcel Token ID] " + input.search_sale_by_token_address);

    query += " AND td.token_id='" + input.token_id + "' ";
  }

  //search by token Address
  if (typeof input.token_address != "undefined" && input.token_address) {
    logger.info("[uone][controllers/reports.controller/exportExcel Token Address] " + input.token_address);
    query += " AND td.token_address='" + input.token_address + "' ";
  }

  //search with buyer wallet
  if (typeof input.buyer_address != "undefined" && input.buyer_address) {
    logger.info("[uone][controllers/reports.controller/exportExcel Buyer] " + input.buyer_address);

    query += " AND td.buyer_address='" + input.buyer_address + "' ";
  }

  //search with seller wallet
  if (typeof input.seller_address != "undefined" && input.seller_address) {
    logger.info("[uone][controllers/reports.controller/exportExcel Seller] " + input.seller_address);

    query += " AND td.seller_address='" + input.seller_address + "' ";
  }

  if (typeof input.from_date != "undefined" && input.from_date && typeof input.to_date != "undefined" && input.to_date) {
    logger.info("[uone][controllers/reports.controller/exportExcel From Date] " + input.from_date + "to date " + input.to_date);
    query += " AND DATE(td.createdAt) >= '" + input.from_date + "' ";
    query += " AND DATE(td.createdAt) <='" + input.to_date + "' ";
  }

  query += " ORDER BY td.createdAt DESC";
  logger.info("[uone][controllers/reports.controller/exportExcel Query] " + query);

  const sales = await Sequelize.query(`${query}`, { type: QueryTypes.SELECT }).then(sales => {
    sales = JSON.parse(JSON.stringify(sales));
    let recordsFiltered = sales.length;
    console.log("filtered records");
    console.log(recordsFiltered);

    let formatted_result = [];
    sales.forEach(obj => {
      formatted_result.push({
        sno: serial_number += 1,
        collectible_name: obj.collectible_name,
        collectible_type: obj.collectible_type,
        token_id: obj.token_id,
        token_address: obj.token_address,
        seller_address: obj.seller_address,
        buyer_address: obj.buyer_address,
        value: obj.value,
        price: web3.utils.fromWei(obj.price, 'ether'),
        createdAt: moment.utc(obj.createdAt).format("DD/MM/YYYY hh:mm:ss")
      });
    });

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("UONE_SALE_REPORT");

    worksheet.columns = [{ header: "Sno", key: "sno", width: 5 }, { header: "Collectible Name", key: "collectible_name", width: 25 }, { header: "Collectible type", key: "collectible_type", width: 15 }, { header: "Token ID", key: "token_id", width: 10 }, { header: "Token Address", key: "token_address", width: 46 }, { header: "Seller Address", key: "seller_address", width: 47 }, { header: "Buyer Address", key: "buyer_address", width: 47 }, { header: "Value", key: "value", width: 10 }, { header: "Price (ETH)", key: "price", width: 20 }, { header: "Created At", key: "createdAt", width: 25 }];

    // Add Array Rows
    worksheet.addRows(formatted_result);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    res.setHeader("Content-Disposition", "attachment; filename=" + "UONE_SALE_REPORT_" + moment().format() + ".xlsx");

    return workbook.xlsx.write(res).then(function () {
      //res.json({ success: true });
      res.status(200).end();
    });
  });
};