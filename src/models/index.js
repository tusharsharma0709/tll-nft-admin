'use strict';

const Uone = require('../uone.js');

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
//const env = process.env.NODE_ENV || 'development';
//const config = require(__dirname + '/../config/config.js')[env];

const db = {};

let sequelize = Uone.sequelize;

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.userdetails = require("./userdetails.js")(sequelize, Sequelize);
db.collectibles = require("./collectible.model.js")(sequelize, Sequelize);
db.vrsdetails = require("./vrsdetails.model.js")(sequelize, Sequelize);
db.postmintokendetails = require("./postmintoken.model.js")(sequelize, Sequelize);
db.signatures = require("./signature.model.js")(sequelize, Sequelize);
db.collections = require("./collection.model.js")(sequelize, Sequelize);
db.users = require("./user.model.js")(sequelize, Sequelize);
db.tokenownerships = require("./tokenownershipinfo.model.js")(sequelize, Sequelize);
db.tokentransactions = require("./tokentransactions.model.js")(sequelize, Sequelize);
db.collectiblebalance = require("./collectiblebalance.model.js")(sequelize, Sequelize);
db.collectiblesales = require("./collectiblesale.model.js")(sequelize, Sequelize);
db.nonce = require("./nonce.model.js")(sequelize, Sequelize);
db.usercollectiblefav = require("./usercollectiblefav.model.js")(sequelize, Sequelize);
db.userfollowers = require("./userfollowers.model.js")(sequelize, Sequelize);
db.adminusers = require("./adminuser.model.js")(sequelize, Sequelize);
db.collectibleauctions = require("./collectibleauction.model.js")(sequelize, Sequelize);
db.collectiblebids = require("./collectiblebid.model.js")(sequelize, Sequelize);

//define relations between models
//mapping between users and collectibles
db.users.hasMany(db.collectibles, { as: "user_created_collectibles" });
db.collectibles.belongsTo(db.users, {
  foreignKey: "userId",
  as: "collectibles_user",
});

//mapping between users and collections
db.users.hasMany(db.collections, { as: "user_collections" });
db.collections.belongsTo(db.users, {
  foreignKey: "userId",
  as: "collection_user",
});

//mapping between collections and collectible
db.collections.hasMany(db.collectibles, { as: "collection_collectibles" });
db.collectibles.belongsTo(db.collections, {
  foreignKey: "collectionId",
  as: "collectible_collection",
});

//mapping between collectible and onsales model
db.collectibles.hasMany(db.collectiblesales, { as: "collectible_saleinfo" });
db.collectiblesales.belongsTo(db.collectibles, {
  foreignKey: "collectibleId",
  as: "sale_collectibles",
});

//mapping between collectible and onsales model to get only creators and owner info
db.collectibles.hasMany(db.collectiblesales, { as: "collectible_owner_info" });
db.collectiblesales.belongsTo(db.collectibles, {
  foreignKey: "collectibleId",
  as: "collectible_owner",
});

//mapping between collectiblesales and userss
db.users.hasMany(db.collectiblesales, { as: "user_collectible_saleinfo" });
db.collectiblesales.belongsTo(db.users, {
  foreignKey: "userId",
  as: "collectible_saleuser",
});

//mapping between transactions and seller user
db.users.hasMany(db.tokentransactions, { as: "seller_user_transaction_info", foreignKey: 'sellerUserId' });
db.tokentransactions.belongsTo(db.users, {
  foreignKey: "sellerUserId",
  as: "collectible_seller_user",
});

//mapping between transactions and buyer user
db.users.hasMany(db.tokentransactions, { as: "buyer_user_transaction_info", foreignKey: 'buyerUserId' });
db.tokentransactions.belongsTo(db.users, {
  foreignKey: "buyerUserId",
  as: "collectible_buyer_user",
  });

//mapping between transaction and collectible
db.collectibles.hasMany(db.tokentransactions, { as: "collectible_transaction_info" });
db.tokentransactions.belongsTo(db.collectibles, {
  foreignKey: "collectibleId",
  as: "collectible_transactions",
});

//mapping between user and collectible balance
db.users.hasMany(db.collectiblebalance, { as: "user_collectible_balance_info" });
db.collectiblebalance.belongsTo(db.users, {
  foreignKey: "userId",
  as: "collectible_balance_user",
  });

//mapping between collectible in collectiblebalance and Collectibles
db.collectibles.hasMany(db.collectiblebalance, { as: "collectible_balance_info" });
db.collectiblebalance.belongsTo(db.collectibles, {
  foreignKey: "collectibleId",
  as: "collectible_balance_of_collectible",
});

//mapping between collectible and collectible favorites
db.collectibles.hasMany(db.usercollectiblefav, { as: "collectible_favorites", foreignKey: "collectibleId" });
db.usercollectiblefav.belongsTo(db.collectibles, {
  foreignKey: "collectibleId",
  as: "favorites_of_collectible",
});

//mapping between user and collectibles
db.users.hasMany(db.usercollectiblefav, { as: "user_favorite_collectible_info" });
db.usercollectiblefav.belongsTo(db.users, {
  foreignKey: "userId",
  as: "favorite_collectibles_of_user",
  });

//mapping between user and his followers
db.users.hasMany(db.userfollowers, { as: "user_followers", foreignKey: 'followerId' });
db.userfollowers.belongsTo(db.users, {
  foreignKey: "followerId",
  as: "user_follower",
});

//mapping between user and his followings
db.users.hasMany(db.userfollowers, { as: "user_following", foreignKey: 'followingId' });
db.userfollowers.belongsTo(db.users, {
  foreignKey: "followingId",
  as: "following_user",
});

module.exports = db;
