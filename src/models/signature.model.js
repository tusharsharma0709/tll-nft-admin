'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Signature extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Signature.init({
    uuid: DataTypes.UUID,
    tokenType: DataTypes.STRING,
    tokenId: DataTypes.INTEGER,
    walletAddress: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    messageSign: DataTypes.STRING,
    signature: DataTypes.TEXT,
    tokenAddress: DataTypes.STRING,
    price: DataTypes.BIGINT,
    isActive: DataTypes.BOOLEAN,
    quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Signature',
    tableName: 'signatures'
  });
  return Signature;
};