'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CollectibleSale extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  CollectibleSale.init({
    collectibleId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    user_public_address: DataTypes.STRING,
    token_address: DataTypes.STRING,
    token_type: DataTypes.STRING,
    tokenId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    onsale: DataTypes.BOOLEAN,
    onsale_current_price: DataTypes.BIGINT,
    onsale_old_price: DataTypes.BIGINT,
    onsale_currency: DataTypes.STRING,
    ownership_type: DataTypes.INTEGER,
    is_current_owner: DataTypes.BOOLEAN,
    signature_uuid: DataTypes.STRING

  }, {
    sequelize,
    modelName: 'CollectibleSale',
    tableName: 'collectiblesales',

  });
  return CollectibleSale;
};