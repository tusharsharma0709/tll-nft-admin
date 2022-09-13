'use strict';

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CollectibleAuction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  CollectibleAuction.init({
    auction_uuid: DataTypes.UUID,
    collectibleId: DataTypes.INTEGER,
    token_type: DataTypes.STRING,
    token_address: DataTypes.STRING,
    token_id: DataTypes.INTEGER,
    seller_address: DataTypes.STRING,
    currency_id: DataTypes.INTEGER,
    currency_symbol: DataTypes.STRING,
    reserved_price: DataTypes.DECIMAL,
    starting_price: DataTypes.DECIMAL,
    bid_increment: DataTypes.DECIMAL,
    latest_bid: DataTypes.DECIMAL,
    auction_start: DataTypes.DATE,
    auction_end: DataTypes.DATE,
    cancelled_at: DataTypes.DATE,
    quantity: DataTypes.INTEGER,
    message_sign: DataTypes.TEXT,
    signature: DataTypes.TEXT,
    status: DataTypes.INTEGER,
    is_featured: DataTypes.BOOLEAN,
    nonce: DataTypes.INTEGER,
    currency_address: DataTypes.STRING,
    closed_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'CollectibleAuction',
    tableName: 'collectibleauctions'
  });
  return CollectibleAuction;
};