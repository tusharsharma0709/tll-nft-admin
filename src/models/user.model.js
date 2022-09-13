'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  User.init({
    user_uuid: DataTypes.UUID,
    username: DataTypes.STRING,
    user_public_address: DataTypes.STRING,
    user_first_name: DataTypes.STRING,
    user_last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    location: DataTypes.TEXT,
    city: DataTypes.STRING,
    cover_photo_path: DataTypes.TEXT,
    profile_photo_path: DataTypes.TEXT,
    website_url: DataTypes.TEXT,
    about_section_title: DataTypes.STRING,
    about_desc: DataTypes.TEXT,
    twitter_url: DataTypes.TEXT,
    telegram_url: DataTypes.TEXT,
    dribble_url: DataTypes.TEXT,
    linkedin_url: DataTypes.TEXT,
    instagram_url: DataTypes.TEXT,
    fullName: {
      type: new DataTypes.VIRTUAL(DataTypes.STRING, ['user_first_name', 'user_last_name']),
    get() {
      return `${this.user_first_name} ${this.user_last_name}`;
    }
}
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
  });
  return User;
};