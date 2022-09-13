'use strict';

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CollectibleBalance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  CollectibleBalance.init({
    collectibleId: DataTypes.INTEGER,
    tokenId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    tokenAddress: DataTypes.STRING,
    user_public_address: DataTypes.STRING,
    quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CollectibleBalance',
    tableName: 'collectiblebalance'
  });
  return CollectibleBalance;
};