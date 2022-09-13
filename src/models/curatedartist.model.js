'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CuratedArtist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  CuratedArtist.init({
    userId: DataTypes.INTEGER,
    user_public_address: DataTypes.STRING
    
  }, {
    sequelize,
    modelName: 'CuratedArtist',
    tableName: 'curated_artists',
  });
  return CuratedArtist;
};