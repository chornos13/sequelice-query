'use strict'
module.exports = (sequelize, DataTypes) => {
	const Salary = sequelize.define(
		'Salary',
		{
			EmployeeId: DataTypes.INTEGER,
			salary: DataTypes.INTEGER,
			fromDate: DataTypes.DATE,
			toDate: DataTypes.DATE,
		},
		{}
	)
	Salary.associate = function(models) {
		// associations can be defined here
	}
	return Salary
}
