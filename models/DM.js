const sequelize = require('../config/connection');
const { Model, DataTypes } = require('sequelize');
const User = require('./User');
class DM extends Model {}

DM.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'dms',
    modelName: 'dm',
    sequelize,
    timestamps: true,
  }
);

DM.belongsTo(User, { foreignKey: 'senderId' });
DM.belongsTo(User, { foreignKey: 'receiverId' });

module.exports = DM;
