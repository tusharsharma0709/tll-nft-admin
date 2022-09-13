'use strict';

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CuratedCollectible extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  CuratedCollectible.init({
    collectibleId: DataTypes.INTEGER,
    collectibleBalanceId: DataTypes.INTEGER,
    collectibleSalesId: DataTypes.INTEGER

  }, {
    sequelize,
    modelName: 'CuratedCollectible',
    tableName: 'curated_collectibles'
  });
  return CuratedCollectible;
};