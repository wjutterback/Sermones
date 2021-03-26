const sequelize = require('../config/connection');
const { Model, DataTypes } = require('sequelize');

class Audio extends Model {}

Audio.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    channel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'audio',
    modelName: 'audio',
    sequelize,
    timestamps: false,
  }
);

module.exports = Audio;
