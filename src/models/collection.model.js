'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Collection extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Collection.init({
    collectionUuid: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    tokenName: DataTypes.STRING,
    tokenCode: DataTypes.STRING,
    tokenType: DataTypes.STRING,
    userPublicAddress: DataTypes.STRING,
    tokenAddress: DataTypes.STRING,
    tokenLogo: DataTypes.TEXT,
    collectiontype: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Collection',
    tableName: 'collections'
  });
  return Collection;
};