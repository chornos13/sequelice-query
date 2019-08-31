'use strict'
module.exports = (sequelize, DataTypes) => {
	const Title = sequelize.define(
		'Title',
		{
			EmployeeId: DataTypes.INTEGER,
			title: DataTypes.STRING,
			fromDate: DataTypes.DATE,
			toDate: DataTypes.DATE,
		},
		{}
	)
	Title.associate = function(models) {
		// associations can be defined here
	}
	return Title
}
