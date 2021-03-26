const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Room extends Model {}

Room.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    members_id: {
      type: DataTypes.JSON,
    }
  },
  {
    sequelize,
    timestamps: false,
    tableName: 'rooms',
    underscored: true,
    modelName: 'room',
  }
);

module.exports = Room;