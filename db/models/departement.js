'use strict'
module.exports = (sequelize, DataTypes) => {
	const Departement = sequelize.define(
		'Departement',
		{
			name: DataTypes.STRING,
		},
		{}
	)
	Departement.associate = function(models) {
		// associations can be defined here
		models.Departement.hasMany(models.DepartementManager)
		models.Departement.hasMany(models.DepartementEmployee)
	}
	return Departement
}
