'use strict';

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PostMinToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  PostMinToken.init({
    tokenId: DataTypes.INTEGER,
    tokenAddress: DataTypes.STRING,
    transactionHash: DataTypes.STRING,
    tokenType: DataTypes.STRING,
    userWalletAddress: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    txStatus: DataTypes.INTEGER,
    responseData: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'PostMinToken',
    tableName: 'postmintokens'
  });
  return PostMinToken;
};