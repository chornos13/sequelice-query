const departementManager = [
	{
		id: 1,
		DepartementId: 1,
		EmployeeId: 1,
		fromDate: '2019-08-24T20:28:55.000Z',
		toDate: '2019-08-24T20:28:55.000Z',
		createdAt: '2019-08-24T20:28:55.000Z',
		updatedAt: '2019-08-24T20:28:55.000Z',
	},
	{
		id: 2,
		DepartementId: 2,
		EmployeeId: 2,
		fromDate: '2019-08-24T20:28:55.000Z',
		toDate: '2019-08-24T20:28:55.000Z',
		createdAt: '2019-08-24T20:28:55.000Z',
		updatedAt: '2019-08-24T20:28:55.000Z',
	},
	{
		id: 3,
		DepartementId: 3,
		EmployeeId: 3,
		fromDate: '2019-08-24T20:28:55.000Z',
		toDate: '2019-08-24T20:28:55.000Z',
		createdAt: '2019-08-24T20:28:55.000Z',
		updatedAt: '2019-08-24T20:28:55.000Z',
	},
]

const SequeliceSeed = require('../../utils/SequeliceSeed')
module.exports = SequeliceSeed.createSeedData(
	'DepartementManagers',
	departementManager,
	['createdAt', 'updatedAt', 'fromDate', 'toDate']
)
