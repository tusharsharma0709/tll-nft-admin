'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vrsdetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Vrsdetail.init({
    user_public_address: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    v: DataTypes.STRING,
    r: DataTypes.STRING,
    s: DataTypes.STRING,
    token_id: DataTypes.INTEGER,
    token_type: DataTypes.STRING,
    token_address: DataTypes.STRING,
    return_status: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Vrsdetail',
    tableName: 'vrsdetails',
  });
  return Vrsdetail;
};