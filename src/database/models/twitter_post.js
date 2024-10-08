const sequelize = require('../sqlite_db');
const { DataTypes } = require('sequelize')

const Post = sequelize.define("Post", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
        defaultValue: ""
    },
    profile: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    details: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    publishing_date: {
        type: DataTypes.DATE,
    },
    memo_id: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
    },
});

module.exports = Post