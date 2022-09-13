const Uone = require("../uone");
const db = require("../models");
const Op = db.Sequelize.Op;
const Sequelize = db.sequelize;
const {
  check,
  checkSchema,
  body,
  validationResult
} = require("express-validator");

const { v4: uuidv4 } = require('uuid');
const lib = require("../includes/common.functions");

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

const cryptoRandomString = require("crypto-random-string");
const logger = Uone.logger;

module.exports.checkUserRecordExistsElseCreate = function (method) {
  logger.info('[uone][includes/common.functions/checkUserRecordExistsElseCreate] method:' + method);

  return async (req, res, next) => {
    try {
      switch (method) {
        case "createCollectible":
          {
            var userPublicAddress = req.body.extra_data.user_public_address;
            break;
          }
        case "getNonce":
          {
            var userPublicAddress = req.params.user_public_address;
            break;
          }
        case "postMintToken":
          {
            var userPublicAddress = req.body.userWalletAddress;
            break;
          }
        case "prepareSignature":
          {
            var userPublicAddress = req.body.walletAddress;
            break;
          }
        case "generateVRS":
          {
            var userPublicAddress = req.params.userPublicAddress;
            break;
          }
        case "addCollection":
          {
            var userPublicAddress = req.body.user_public_address;
            break;
          }
        case "submitTransaction":
          {
            var userPublicAddress = req.body.buyer_public_address;
            break;
          }
        case "updateusercoverphoto":
          {
            var userPublicAddress = req.body.user_public_address;
            break;
          }
        case "updateFavoriteCollectibleStatus":
          {
            var userPublicAddress = req.body.user_public_address;
            break;
          }
        case "getUserFavoriteCollectibles":
          {
            var userPublicAddress = req.params.user_public_address;
            break;
          }
        case "updateUserFollower":
          {
            var userPublicAddress = req.body.user_public_address;
            break;
          }
        case "getUserFollowDetails":
          {
            var userPublicAddress = req.params.user_public_address;
            break;
          }
        case "getUserFollowingstatus":
          {
            var userPublicAddress = req.body.user_public_address;
            break;
          }
        case "unlockCollectibleContent":
          {
            var userPublicAddress = req.body.user_public_address;
            break;
          }
      }

      //based on public address receiced process further
      logger.info("[uone][includes/common.functions/checkUserRecordExistsElseCreate] user public address" + userPublicAddress);
      if (!Uone.web3.utils.isAddress(userPublicAddress)) {
        logger.info("[uone][includes/common.functions/checkUserRecordExistsElseCreate] Error: This is not an Ethereum address, " + userPublicAddress);
        res.status(400).json({
          status: "failed",
          errors: ['Invalid Ethereum Address!']
        });
        return;
      }

      var condition = { user_public_address: userPublicAddress };
      return await User.findOne({ where: condition }).then(async obj => {
        if (obj) {
          // update
          logger.info("[uone][includes/common.functions/checkUserRecordExistsElseCreate] User Object exist return it");
          next();
        } else {
          logger.info("[uone][includes/common.functions/checkUserRecordExistsElseCreate] user record does not exist. so creating it");
          //else create a new user object
          //let username = cryptoRandomString({length: 10});
          const userinfo = {
            username: userPublicAddress,
            user_public_address: userPublicAddress,
            user_uuid: uuidv4()
          };
          const userData = await User.create(userinfo);
          logger.info("[uone][includes/common.functions/checkUserRecordExistsElseCreate] User Record created");
          next();
        }
      });
    } catch (error) {
      next(error);
    }
  };
};

//retrive user record based on user public address
module.exports.getUserDetailsUsingPublicAddress = async function (userPublicAddress) {
  return User.findOne({ where: { user_public_address: userPublicAddress } }).then(function (obj) {
    if (obj) {
      // update
      logger.info("user record exist return it. else return false");
      return obj;
    } else {
      return false;
    }
  });
};

//function to get collection info using tokenAddress
module.exports.getCollectionDataofCollectible = async function (tokenAddress) {
  return Collections.findOne({ where: { tokenAddress: tokenAddress } }).then(function (obj) {
    if (obj) {
      // update
      logger.info("collection exist . else return error");
      return obj;
    } else {
      return false;
    }
  });
};

module.exports.addNewUserRecord = function (userPublicAddress) {
  const userinfo = {
    username: cryptoRandomString({ length: 6, type: "alphanumeric" }),
    user_public_address: userPublicAddress,
    user_uuid: uuidv4()
  };
  User.create(userinfo).then(data => {
    return true;
  });
};

//generate nonce
module.exports.getNonceGenerated = async function (req) {

  console.log("calling function getNonceGenerated");
  const userData = await lib.getUserDetailsUsingPublicAddress(req.params.user_public_address);
  const count = await Nonce.count({ where: { 'user_public_address': req.params.user_public_address } });
  if (count == 0) {
    const nonce_data = await Nonce.create({ userId: userData.id, user_public_address: req.params.user_public_address, nonce: 1, user_action: req.params.user_action, is_used: false });
    return nonce_data;
  } else {
    logger.info("coming to else condition as the count is > 0");
    const t = await Sequelize.transaction();
    try {
      //get max of current nonce for this public address
      const max_nonce = await Nonce.max('nonce', { where: { user_public_address: req.params.user_public_address } }, { transaction: t });
      //update all unused nonce to make it used
      await Nonce.update({ is_used: true }, {
        where: { user_public_address: req.params.user_public_address }
      }, { transaction: t });
      const nonce_data = await Nonce.create({ userId: userData.id, user_public_address: req.params.user_public_address, nonce: max_nonce + 1, user_action: req.params.user_action, is_used: false }, { transaction: t });
      await t.commit();
      return nonce_data;
    } catch (error) {
      // We rollback the transaction.
      await t.rollback();
    }
  }
};

//get nonce attached to a user if it not used, else return false
module.exports.getUserNonceGenerated = async function (userPublicAddress, userAction) {
  console.log("calling function getUserNonceGenerated");
  return Nonce.findOne({ where: { user_public_address: userPublicAddress, 'is_used': false } }).then(function (obj) {
    if (obj) {
      // update
      logger.info("Nonce exist . else return error");
      return obj;
    } else {
      logger.info("nonce does not exist. returning false");
      return false;
    }
  });
};

//mark nonce as used after used it
module.exports.markNonceAsUsed = async function (userPublicAddress, userAction) {
  return Nonce.findOne({ where: { user_public_address: userPublicAddress, 'is_used': false } }).then(function (obj) {
    if (obj) {
      // update
      logger.info("row exist so update it");
      return obj.update({ is_used: true });
    } else {
      // insert
      logger.info("row does not exist so create it");
      return false;
    }
  });
};

//function to get collectible details based on tokenId
module.exports.getCollectibleRecordByQuery = async function (query) {
  return Collectible.findOne({ where: query }).then(function (obj) {
    if (obj) {
      // update
      logger.info("collectible record exist return it. else return false");
      return obj;
    } else {
      return false;
    }
  });
};

//function to insert or update token transaction data
module.exports.upsertTokenTransaction = async function (model, condition, data) {
  logger.info("into upsertTokenTransaction function");
  return model.findOne({ where: condition }).then(function (obj) {
    if (obj) {
      // update
      logger.info("Record found in the Model");
      logger.info("collectible transaction record exist. Update it");
      return obj.update(data);
    } else {
      logger.info("Record not found in the Model");
      logger.info("collectible transaction not record exist. Create it");
      return model.create(data);
    }
  });
};
//function to update seller balance records after buy
module.exports.upsertSellerTokenBalance = async function (model, condition, data) {
  logger.info("into upsertSellerTokenBalance function");
  return model.findOne({ where: condition }).then(function (obj) {
    if (obj) {
      // update
      logger.info("Record found in the Model");
      logger.info("collectible balance record exist for this seller");
      //return obj.update(data);
      const updateSellerBalance = obj.decrement(['quantity'], { by: data.quantity });
      return true;
    } else {
      return false;
    }
  });
};

//insert or update buyer balance data
module.exports.upsertBuyerTokenBalance = async function (model, condition, data) {
  logger.info("into upsertBuyerTokenBalance function");
  return model.findOne({ where: condition }).then(function (obj) {
    if (obj) {
      // update
      logger.info("Record found in the Model");
      logger.info("collectible balance record exist for this buyer");
      //return obj.update(data);
      const updateBuyerBalance = obj.increment(['quantity'], { by: data.quantity });
      return true;
    } else {
      //buyer dont have any record for this token id and token address combination. create it
      const buyer_balance_info = {
        collectibleId: data.collectibleId,
        tokenId: data.tokenId,
        userId: data.buyerUserId,
        tokenAddress: data.tokenAddress,
        user_public_address: data.buyer_public_address,
        quantity: data.quantity
      };
      const createBuyerBalance = model.create(buyer_balance_info);
      return true;
    }
  });
};

//update sales table for seller
module.exports.upsertSellerTokenSaleStatus = async function (model, condition, data) {
  logger.info("into upsertSellerTokenSaleStatus function");
  return model.findOne({ where: condition }).then(function (obj) {
    if (obj) {
      // update
      logger.info("Record found in the Model");
      logger.info("collectible sale info record exist for this seller. return it");
      //return obj.update(data);
      if (data.tokenType == "erc721") {
        //decrement the quantity
        const updateSellerSaleStatus = obj.decrement(['quantity'], { by: data.quantity });
        //mark sale sale status to completed
        //mark is_current_owner to false
        const update_data = { onsale: false, is_current_owner: false };
        obj.update(update_data);
      }
      if (data.tokenType == "erc1155") {
        //decrement the quantity
        const updateSellerSaleStatus = obj.decrement(['quantity'], { by: data.quantity });
        if (obj.quantity == 0) {
          const update_data = { onsale: false, is_current_owner: false };
          obj.update(update_data);
        }
      }
      return true;
    } else {
      return false;
    }
  });
};

//update or insert buyer sale status
module.exports.upsertBuyerTokenSaleStatus = async function (model, condition, data) {
  logger.info("into upsertBuyerTokenSaleStatus function");
  return model.findOne({ where: condition }).then(function (obj) {
    if (obj) {
      // update
      logger.info("Record found in the Model");
      logger.info("collectible sale record exist for this buyer");
      //return obj.update(data);
      //const updateBuyerSale =  obj.increment(['quantity'], { by: data.quantity });
      if (data.tokenType == "erc721") {
        //increment the quantity
        const updateBuyerSale = obj.increment(['quantity'], { by: data.quantity });
        const update_data = { onsale: false, is_current_owner: true };
        obj.update(update_data);
      }
      if (data.tokenType == "erc1155") {
        //increment the quantity
        const updateSellerSaleStatus = obj.increment(['quantity'], { by: data.quantity });
        if (obj.quantity == 0) {
          const update_data = { is_current_owner: true };
          obj.update(update_data);
        }
      }

      return true;
    } else {
      //buyer dont have any record for this token id and token address combination. create it
      const buyer_sale_info = {
        collectibleId: data.collectibleId,
        userId: data.buyerUserId,
        user_public_address: data.buyer_public_address,
        token_address: data.tokenAddress,
        token_type: data.tokenType,
        tokenId: data.tokenId,
        quantity: data.quantity,
        onsale: false,
        onsale_current_price: data.unit_price,
        ownership_type: 2,
        is_current_owner: true
      };
      const createBuyerSale = model.create(buyer_sale_info);
      return true;
    }
  });
};

//update Token Sales status to False/Cancel Token sale status
module.exports.updateTokenSaleStatus = async function (model, condition, data) {
  logger.info("into updateTokenSaleStatus function");
  return model.findOne({ where: condition }).then(function (obj) {
    if (obj) {
      // update
      logger.info("Record found in the CollectibleSales Model");
      logger.info("CollectibleSales record exist. Update it");
      const updateBuyerSale = obj.update(data);
      return true;
    } else {
      logger.info("Record not found in the Model");
      logger.info("collectible transaction not record exist. Return false");
      return false;
    }
  });
};

// Retrieve collectible data
module.exports.getCollectibleByTokenId = async function (tokenID, tokenAddress) {
  logger.info('[uone][includes/common.functions/getCollectibleByTokenId] tokenId:' + tokenID + ' tokenAddress:' + tokenAddress);

  return Collectible.findOne({
    where: {
      tokenID: tokenID,
      tokenAddress: tokenAddress

    }
  }).then(function (obj) {
    if (obj) {
      logger.info('[uone][includes/common.functions/getTokenByTokenId] Found tokenId:' + tokenID + ' tokenAddress:' + tokenAddress);
      return obj;
    } else {
      logger.info('[uone][includes/common.functions/getTokenByTokenId] Not found tokenId:' + tokenID + ' tokenAddress:' + tokenAddress);
      return false;
    }
  });
};

// Retrieve back the Vrs records by using token id and token address
module.exports.getVrsRecordByTokenId = async function (tokenID, tokenAddress) {
  logger.info('[uone][includes/common.functions/getVRSRecordByTokenId] tokenId:' + tokenID + ' tokenAddress:' + tokenAddress);

  return VrsDetails.findOne({
    where: {
      token_id: tokenID,
      token_address: tokenAddress
    }
  }).then(function (obj) {
    if (obj) {
      logger.info('[uone][includes/common.functions/getVRSRecordByTokenId] Found tokenId:' + tokenID + ' tokenAddress:' + tokenAddress);
      return obj;
    } else {
      logger.info('[uone][includes/common.functions/getVRSRecordByTokenId] Not found tokenId:' + tokenID + ' tokenAddress:' + tokenAddress);
      return false;
    }
  });
};

//get active signature for Buy Purpose
module.exports.getSignature = async function (model, condition) {
  logger.info('[uone][includes/common.functions/getSignature] model:' + model + 'condition ' + condition);

  return model.findOne({
    where: condition
  }).then(function (obj) {
    if (obj) {
      logger.info('[uone][includes/common.functions/getSignature] Found Valid Signature Record');
      return obj;
    } else {
      logger.info('[uone][includes/common.functions/getSignature] Not found Valid Signature');
      return false;
    }
  });
};

//update signature Active Status
module.exports.updateSignatureActiveStatus = async function (model, condition, data) {
  logger.info('[uone][includes/common.functions/updateSignatureActiveStatus] model:' + model + 'condition ' + condition + ' Data: ' + data);

  return model.findOne({ where: condition }).then(function (obj) {
    if (obj) {
      // update
      logger.info('[uone][includes/common.functions/updateSignatureActiveStatus] Record Found');
      obj.update(data);
      return true;
    } else {
      logger.info('[uone][includes/common.functions/updateSignatureActiveStatus] Record Not Found');
      return false;
    }
  });
};

module.exports.getWalletCollectibleBalance = async function (walletAddress, tokenId, tokenAddress) {
  logger.info('[uone][includes/common.functions/getWalletCollectibleBalance] tokenId:' + tokenId + ' tokenAddress:' + tokenAddress + ' walletAddress:' + walletAddress);

  return CollectibleBalance.findOne({
    where: {
      tokenId: tokenId,
      tokenAddress: tokenAddress,
      user_public_address: walletAddress
    }
  }).then(function (obj) {
    if (obj) {
      logger.info('[uone][includes/common.functions/getWalletCollectibleBalance] tokenId:' + tokenId + ' tokenAddress:' + tokenAddress + ' walletAddress:' + walletAddress + ' Balance:' + obj.quantity);
      return obj;
    } else {
      logger.info('[uone][includes/common.functions/getWalletCollectibleBalance] Not found tokenId:' + tokenID + ' tokenAddress:' + tokenAddress + ' walletAddress:' + walletAddress);
      return false;
    }
  });
};

//function to validate signed Hash before proceed to main function
module.exports.validateSignedHash = function (method) {
  logger.info('[uone][includes/common.functions/validateSignedHash] method:' + method);

  return async (req, res, next) => {
    try {

      const userNonceData = await lib.getUserNonceGenerated(req.body.user_public_address, method);
      if (typeof userNonceData === 'boolean' && userNonceData === false) {
        logger.info("user data is empty. so return error");
        res.status(400).json({ status: "failed", errors: ["Nonce not Generated (or) Already Used. Action Unauthorized"] });
        return;
      }

      const nonce = userNonceData.nonce;
      logger.info('[uone][includes/common.functions/validateSignedHash] Generated Nonce From DB:' + nonce);

      switch (method) {

        case "updateprofile":
          {
            var userPublicAddress = req.body.user_public_address.toLowerCase();
            var message = 'I would like to update my profile. username: ' + req.body.username + '. first_name: ' + req.body.first_name + '. last_name: ' + req.body.last_name + '. location: ' + req.body.location + '. city: ' + req.body.city + '. website_url: ' + req.body.website_url + '. about: ' + req.body.aboutus_desc + '. twitter: ' + req.body.twitter_url + '. telegram_url: ' + req.body.telegram_url + '. dribble_url: ' + req.body.dribble_url + '. linkedin_url: ' + req.body.linkedin_url + '. instagram_url: ' + req.body.instagram_url + '. profile_photo_path: ' + req.body.profile_photo_path + '. nonce: ' + nonce;
            break;
          }

        case "updateusercoverphoto":
          {
            var userPublicAddress = req.body.user_public_address.toLowerCase();
            var message = 'I would like to update my coverphoto. wallet_address: ' + userPublicAddress + '. nonce: ' + nonce;
            break;
          }

        case "updateFavoriteCollectibleStatus":
          {
            var userPublicAddress = req.body.user_public_address.toLowerCase();
            var message = 'I would like to like collectible. user_public_address: ' + userPublicAddress + '. collectibleId: ' + req.body.collectibleId + '. nonce: ' + nonce;
            break;
          }

        case "updateUserFollower":
          {
            var userPublicAddress = req.body.user_public_address.toLowerCase();
            var followingPublicAddress = req.body.following_user_public_address.toLowerCase();
            var message = 'I would like to follow a user. user_public_address: ' + userPublicAddress + '. following: ' + followingPublicAddress + '. nonce: ' + nonce;
            break;
          }

        case "getUserFollowingstatus":
          {
            var userPublicAddress = req.body.user_public_address.toLowerCase();
            var followingPublicAddress = req.body.following_user_public_address.toLowerCase();
            var message = 'I want to check following status with a user. user_public_address: ' + userPublicAddress + '. following: ' + followingPublicAddress + '. nonce: ' + nonce;
            break;
          }

        case "unlockCollectibleContent":
          {
            var userPublicAddress = req.body.user_public_address.toLowerCase();
            var tokenAddress = req.body.tokenAddress.toLowerCase();
            var message = 'I would like to view my unlocked content ' + tokenAddress + '. ' + 'tokenId:' + req.body.tokenId + '. MyWalletAddress:' + userPublicAddress + '. nonce:' + nonce;
            break;
          }

      }
      logger.info('[uone][includes/common.functions/validateSignedHash] Message Composed is:' + message);

      let web3 = Uone.web3;
      var signedBy = web3.eth.accounts.recover(message, req.body.signHash);
      logger.info('[uone][includes/common.functions/validateSignedHash] Signed By Obtained from Web3:' + signedBy);

      if (signedBy.toLowerCase() == userPublicAddress) {
        logger.info("signature verification successful. proceed Further using next()");
        logger.info('[uone][includes/common.functions/validateSignedHash] signature verification successful. proceed to target function');
        next();
      } else {
        res.status(403).json({
          status: "failed",
          errors: ["Signature Match not Successful. Action Unauthorized"]
        });
        return;
      }
    } catch (error) {
      next(error);
    }
  };
};

//get list of user followings
module.exports.getUserFollowing = async function (walletAddress) {
  logger.info('[uone][includes/common.functions/getUserFollowing] walletAddress:' + walletAddress);

  return UserFollower.findAndCountAll({
    where: {
      followerPublicAddress: walletAddress
    },
    include: [{
      model: User,
      as: "following_user",
      attributes: ['username', 'fullName', 'user_public_address', 'profile_photo_path', 'cover_photo_path']
    }, {
      model: User,
      as: "user_follower",
      attributes: ['username', 'fullName', 'user_public_address', 'profile_photo_path', 'cover_photo_path']
    }]
  }).then(data => {
    return data;
  });
};

//get list of followers of a user
module.exports.getUserFollowers = async function (walletAddress) {
  logger.info('[uone][includes/common.functions/getUserFollowers] walletAddress:' + walletAddress);

  return UserFollower.findAndCountAll({
    where: {
      followingPublicAddress: walletAddress
    },
    include: [{
      model: User,
      as: "user_follower",
      attributes: ['username', 'fullName', 'user_public_address', 'profile_photo_path', 'cover_photo_path']
    }, {
      model: User,
      as: "following_user",
      attributes: ['username', 'fullName', 'user_public_address', 'profile_photo_path', 'cover_photo_path']
    }]
  }).then(data => {
    return data;
  });
};

//get pagination limit and offset
module.exports.getPagination = async function (page, size) {
  logger.info('[uone][includes/common.functions/getPagination] page:' + page + 'size' + size);

  const limit = size ? +size : 8;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

//get paging data
module.exports.getPagingData = async function (data, page, limit) {
  logger.info('[uone][includes/common.functions/getPagingData] page:' + page + 'limit' + limit);

  const { count: totalItems, rows: result } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, result, totalPages, currentPage };
};

let isFunctionExist = function (bytecodes, functionSignature) {

  let funcHash = Uone.web3.eth.abi.encodeFunctionSignature(functionSignature);
  // Remove leading 00 in hex string by convert back to number then back to hex string
  let funcNumber = Uone.web3.utils.hexToNumber(funcHash);
  let funcHash2 = Uone.web3.utils.numberToHex(funcNumber);
  let result = bytecodes.indexOf(funcHash2.slice(2, funcHash2.length)) > 0;
  //console.log('[test][isFunctionExist] hash:' + funcHash2 + ' result:' + result);
  return result;
};

module.exports.detectContract = async function (contractAddress) {

  try {
    // Retrieve bytecodes
    let byteCodes = await Uone.web3.eth.getCode(contractAddress, 'latest');
    logger.info('[uone][includes/common.functions/detectContract] typeof byteCodes:', typeof byteCodes);
    logger.info('[uone][includes/common.functions/detectContract] byteCodes len:', byteCodes.length);

    if (byteCodes <= 2) {
      logger.info('[uone][includes/common.functions/detectContract] Not smart contract address.');
      return false;
    }

    // ERC20 Interface
    // Detect name function
    let nameExist = isFunctionExist(byteCodes, 'name()');
    logger.info('[uone][includes/common.functions/detectContract] nameExist:' + nameExist);

    // Detect symbol function
    let symbolExist = isFunctionExist(byteCodes, 'symbol()');
    logger.info('[uone][includes/common.functions/detectContract] symbolExist:' + symbolExist);

    // Detect decimals function
    let decimalsExist = isFunctionExist(byteCodes, 'decimals()');
    logger.info('[uone][includes/common.functions/detectContract] decimalsExist:' + decimalsExist);

    // Detect totalSupply function
    let totalSupplyExist = isFunctionExist(byteCodes, 'totalSupply()');
    logger.info('[uone][includes/common.functions/detectContract] totalSupplyExist:' + totalSupplyExist);

    // Detect balanceOf function
    let balanceOfExist = isFunctionExist(byteCodes, 'balanceOf(address)');
    logger.info('[uone][includes/common.functions/detectContract] balanceOfExist:' + balanceOfExist);

    // Detect transfer function
    let transferExist = isFunctionExist(byteCodes, 'transfer(address,uint256)');
    logger.info('[uone][includes/common.functions/detectContract] transferExist:' + transferExist);

    // Detect allowance function
    let allowanceExist = isFunctionExist(byteCodes, 'allowance(address,address)');
    logger.info('[uone][includes/common.functions/detectContract] allowanceExist:' + allowanceExist);

    // Detect approve function
    let approveExist = isFunctionExist(byteCodes, 'approve(address,uint256)');
    logger.info('[uone][includes/common.functions/detectContract] approveExist:' + approveExist);

    // Detect transferFrom function
    let transferFromExist = isFunctionExist(byteCodes, 'transferFrom(address,address,uint256)');
    logger.info('[uone][includes/common.functions/detectContract] transferFromExist:' + transferFromExist);

    // Detect increaseAllownace function
    let increaseAllowanceExist = isFunctionExist(byteCodes, 'increaseAllowance(address,uint256)');
    logger.info('[uone][includes/common.functions/detectContract] increaseAllowanceExist:' + increaseAllowanceExist);

    // Detect increaseAllownace function
    let decreaseAllowanceExist = isFunctionExist(byteCodes, 'decreaseAllowance(address,uint256)');
    logger.info('[uone][includes/common.functions/detectContract] decreaseAllowanceExist:' + decreaseAllowanceExist);

    // ERC721 Interface
    // Detect ownerOf function
    let ownerOfExist = isFunctionExist(byteCodes, 'ownerOf(uint256)');
    logger.info('[uone][includes/common.functions/detectContract] ownerOfExist:' + ownerOfExist);

    // Detect tokenURI function
    let tokenURIExist = isFunctionExist(byteCodes, 'tokenURI(uint256)');
    logger.info('[uone][includes/common.functions/detectContract] tokenURIExist:' + tokenURIExist);

    // Detect baseURI function
    let baseURIExist = isFunctionExist(byteCodes, 'baseURI()');
    logger.info('[uone][includes/common.functions/detectContract] baseURIExist:' + baseURIExist);

    // Detect tokenOfOwnerByIndex function
    let tokenOfOwnerByIndexExist = isFunctionExist(byteCodes, 'tokenOfOwnerByIndex(address,uint256)');
    logger.info('[uone][includes/common.functions/detectContract] tokenOfOwnerByIndexExist:' + tokenOfOwnerByIndexExist);

    // Detect tokenByIndex function
    let tokenByIndexExist = isFunctionExist(byteCodes, 'tokenByIndex(uint256)');
    logger.info('[uone][includes/common.functions/detectContract] tokenByIndexExist:' + tokenByIndexExist);

    // Detect getApproved function
    let getApprovedExist = isFunctionExist(byteCodes, 'getApproved(uint256)');
    logger.info('[uone][includes/common.functions/detectContract] getApprovedExist:' + getApprovedExist);

    // Detect setApprovalForAll function
    let setApprovalForAllExist = isFunctionExist(byteCodes, 'setApprovalForAll(address,bool)');
    logger.info('[uone][includes/common.functions/detectContract] setApprovalForAllExist:' + setApprovalForAllExist);

    // Detect isApprovalForAll function
    let isApprovedForAllExist = isFunctionExist(byteCodes, 'isApprovedForAll(address,address)');
    logger.info('[uone][includes/common.functions/detectContract] isApprovedForAllExist:' + isApprovedForAllExist);

    // ERC1155
    // Detect balanceOf 1155 function
    let balanceOf1155Exist = isFunctionExist(byteCodes, 'balanceOf(address,uint256)');
    logger.info('[uone][includes/common.functions/detectContract] balanceOf1155Exist:' + balanceOf1155Exist);

    let balanceOfBatch1155Exist = isFunctionExist(byteCodes, 'balanceOfBatch(address[],uint256[])');
    logger.info('[uone][includes/common.functions/detectContract] balanceOfBatch1155Exist:' + balanceOfBatch1155Exist);

    let uriExist = isFunctionExist(byteCodes, 'uri(uint256)');
    logger.info('[uone][includes/common.functions/detectContract] uriExist:', uriExist);

    let safeTransferFrom1155Exist = isFunctionExist(byteCodes, 'safeTransferFrom(address,address,uint256,uint256,bytes)');
    logger.info('[uone][includes/common.functions/detectContract] safeTransferFrom1155Exist:' + safeTransferFrom1155Exist);

    let safeBatchTransferFrom1155Exist = isFunctionExist(byteCodes, 'safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)');
    logger.info('[uone][includes/common.functions/detectContract] safeBatchTransferFrom1155Exist:' + safeBatchTransferFrom1155Exist);

    // Unique One Special 
    let getFeeBpsExist = isFunctionExist(byteCodes, 'getFeeBps(uint256)');
    logger.info('[uone][includes/common.functions/detectContract] getFeeBpsExist:' + getFeeBpsExist);

    if (nameExist && symbolExist && totalSupplyExist && balanceOfExist) {
      if (ownerOfExist) {
        // ERC721
        if (getFeeBpsExist && tokenURIExist) {
          return 'erc721';
        } else {
          return false;
        }
      } else if (decimalsExist && transferExist) {
        return 'erc20';
      } else {
        return false;
      }
    } else if (balanceOf1155Exist && uriExist) {

      if (getFeeBpsExist) {
        return 'erc1155';
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (err) {
    console.log('[test][detectContract] Error:', err);
    throw err;
  }
};