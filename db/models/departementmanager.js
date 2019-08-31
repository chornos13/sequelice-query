'use strict'
module.exports = (sequelize, DataTypes) => {
	const DepartementManager = sequelize.define(
		'DepartementManager',
		{
			DepartementId: DataTypes.INTEGER,
			EmployeeId: DataTypes.INTEGER,
			fromDate: DataTypes.DATE,
			toDate: DataTypes.DATE,
		},
		{}
	)
	DepartementManager.associate = function(models) {
		// associations can be defined here
		models.DepartementManager.belongsTo(models.Departement)
		models.DepartementManager.belongsTo(models.Employee)
	}
	return DepartementManager
}
