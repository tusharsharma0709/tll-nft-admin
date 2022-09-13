'use strict';

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TokenTransaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  TokenTransaction.init({
    tokenId: DataTypes.INTEGER,
    tokenType: DataTypes.STRING,
    tokenAddress: DataTypes.STRING,
    collectibleId: DataTypes.INTEGER,
    seller_public_address: DataTypes.STRING,
    sellerUserId: DataTypes.INTEGER,
    buyer_public_address: DataTypes.STRING,
    buyerUserId: DataTypes.INTEGER,
    unit_price: DataTypes.DECIMAL,
    signature: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    transaction_type: DataTypes.STRING,
    transactionHash: DataTypes.STRING,
    verificationStatus: DataTypes.BOOLEAN,
    isBcVerified: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'TokenTransaction',
    tableName: 'tokentransactions'
  });
  return TokenTransaction;
};