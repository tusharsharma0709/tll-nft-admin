'use strict';

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserCollectibleFav extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  UserCollectibleFav.init({
    userId: DataTypes.INTEGER,
    user_public_address: DataTypes.STRING,
    collectibleId: DataTypes.INTEGER,
    tokenId: DataTypes.INTEGER,
    tokenAddress: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UserCollectibleFav',
    tableName: 'usercollectiblefav'
  });
  return UserCollectibleFav;
};