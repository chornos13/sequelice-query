'use strict'
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('DepartementManagers', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			DepartementId: {
				type: Sequelize.INTEGER,
			},
			EmployeeId: {
				type: Sequelize.INTEGER,
			},
			fromDate: {
				type: Sequelize.DATE,
			},
			toDate: {
				type: Sequelize.DATE,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		})
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('DepartementManagers')
	},
}
