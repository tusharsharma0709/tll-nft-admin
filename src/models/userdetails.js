'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserDetails extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  UserDetails.init({
    user_id: DataTypes.INTEGER,
    user_cover_photo: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UserDetails',
  });
  return UserDetails;
};