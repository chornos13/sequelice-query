'use strict'
module.exports = (sequelize, DataTypes) => {
	const Employee = sequelize.define(
		'Employee',
		{
			birthDate: DataTypes.DATE,
			firstName: DataTypes.STRING,
			lastName: DataTypes.STRING,
			GenderId: DataTypes.INTEGER,
			hireDate: DataTypes.DATE,
		},
		{}
	)
	Employee.associate = function(models) {
		// associations can be defined here
		models.Employee.hasMany(models.Salary)
		models.Employee.hasMany(models.Title, { as: 'JobTitles' })
	}
	return Employee
}
