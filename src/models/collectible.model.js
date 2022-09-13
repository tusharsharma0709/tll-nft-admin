'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Collectible extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Collectible.init({
    collectible_uuid: DataTypes.UUID,
    collectionId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    collectible_name: DataTypes.STRING,
    collectible_description: DataTypes.TEXT,
    collectible_category: DataTypes.STRING,
    user_public_address: DataTypes.STRING,
    ipfs_media_path: DataTypes.STRING,
    ipfs_hash: DataTypes.STRING,
    ipfs_path:DataTypes.STRING,
    noOfCopies: DataTypes.INTEGER,
    lock_status: DataTypes.INTEGER,
    tokenID: DataTypes.INTEGER,
    cost: DataTypes.DECIMAL,
    collectible_type: DataTypes.STRING,
    size:DataTypes.INTEGER,
    tokenAddress: DataTypes.STRING,
    royalty: DataTypes.INTEGER,
    locked_content: DataTypes.TEXT,
    collectible_image_mime_type: DataTypes.STRING,
    alternative_media_path: DataTypes.STRING,
    alternative_media_path_medium: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Collectible',
    tableName: 'collectibles'
  });
  return Collectible;
};