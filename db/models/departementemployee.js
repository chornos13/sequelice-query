'use strict'
module.exports = (sequelize, DataTypes) => {
	const DepartementEmployee = sequelize.define(
		'DepartementEmployee',
		{
			DepartementId: DataTypes.INTEGER,
			EmployeeId: DataTypes.INTEGER,
			fromDate: DataTypes.DATE,
			toDate: DataTypes.DATE,
		},
		{}
	)
	DepartementEmployee.associate = function(models) {
		// associations can be defined here
		models.DepartementEmployee.belongsTo(models.Employee)
		models.DepartementEmployee.belongsTo(models.Departement)
	}
	return DepartementEmployee
}
