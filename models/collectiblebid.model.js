'use strict';

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CollectibleBid extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  CollectibleBid.init({
    collectibleAuctionId: DataTypes.INTEGER,
    collectiblebid_uuid: DataTypes.UUID,
    bidder_address: DataTypes.STRING,
    price: DataTypes.DECIMAL,
    signature: DataTypes.STRING,
    cancelledAt: DataTypes.DATE,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CollectibleBid',
    tableName: 'collectiblebids'
  });
  return CollectibleBid;
};