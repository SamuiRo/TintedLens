'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      // Додаємо нове поле details
      queryInterface.addColumn('Posts', 'details', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {},
      }),
      // Видаляємо поле hey_status
      queryInterface.removeColumn('Posts', 'hey_status'),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      // Відкочуємо видалення поля hey_status
      queryInterface.addColumn('Posts', 'hey_status', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      // Відкочуємо додавання поля details
      queryInterface.removeColumn('Posts', 'details'),
    ]);
  }
};
