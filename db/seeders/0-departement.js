const departement = [
	{
		id: 1,
		name: 'WiGen',
		createdAt: '2019-08-24T20:09:04.000Z',
		updatedAt: '2019-08-24T20:09:04.000Z',
	},
	{
		id: 2,
		name: 'Niku',
		createdAt: '2019-08-24T20:14:57.000Z',
		updatedAt: '2019-08-24T20:14:57.000Z',
	},
	{
		id: 3,
		name: 'Kuma',
		createdAt: '2019-08-24T20:09:37.000Z',
		updatedAt: '2019-08-24T20:09:40.000Z',
	},
]

const SequeliceSeed = require('../../utils/SequeliceSeed')
module.exports = SequeliceSeed.createSeedData('Departements', departement)
