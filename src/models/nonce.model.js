'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Nonce extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Nonce.init({
    userId: DataTypes.INTEGER,
    user_public_address: DataTypes.STRING,
    nonce: DataTypes.INTEGER,
    user_action: DataTypes.STRING,
    is_used: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Nonce',
    tableName: 'nonce',
  });
  return Nonce;
};