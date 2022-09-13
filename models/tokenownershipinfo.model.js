'use strict';

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TokenOwnershipInfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  TokenOwnershipInfo.init({
    userId: DataTypes.INTEGER,
    tokenId: DataTypes.INTEGER,
    collectibleId: DataTypes.INTEGER,
    user_address: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    ownership_type: DataTypes.STRING,
    is_current_owner: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'TokenOwnershipInfo',
    tableName: 'tokenownershipinfos'
  });
  return TokenOwnershipInfo;
};