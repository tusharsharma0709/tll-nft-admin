'use strict';

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserFollowers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  UserFollowers.init({
    followerId: DataTypes.INTEGER,
    followerPublicAddress: DataTypes.STRING,
    followingId: DataTypes.INTEGER,
    followingPublicAddress: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UserFollowers',
    tableName: 'user_followers'
  });
  return UserFollowers;
};