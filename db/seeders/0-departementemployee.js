const departementEmployee = [
	{
		id: 1,
		DepartementId: 1,
		EmployeeId: 4,
		fromDate: '2019-08-24T20:29:25.000Z',
		toDate: '2019-08-24T20:29:25.000Z',
		createdAt: '2019-08-24T20:29:25.000Z',
		updatedAt: '2019-08-24T20:29:25.000Z',
	},
	{
		id: 2,
		DepartementId: 1,
		EmployeeId: 5,
		fromDate: '2019-08-24T20:29:25.000Z',
		toDate: '2019-08-24T20:29:25.000Z',
		createdAt: '2019-08-24T20:29:25.000Z',
		updatedAt: '2019-08-24T20:29:25.000Z',
	},
	{
		id: 3,
		DepartementId: 2,
		EmployeeId: 6,
		fromDate: '2019-08-24T20:29:25.000Z',
		toDate: '2019-08-24T20:29:25.000Z',
		createdAt: '2019-08-24T20:29:25.000Z',
		updatedAt: '2019-08-24T20:29:25.000Z',
	},
	{
		id: 4,
		DepartementId: 2,
		EmployeeId: 7,
		fromDate: '2019-08-24T20:29:25.000Z',
		toDate: '2019-08-24T20:29:25.000Z',
		createdAt: '2019-08-24T20:29:25.000Z',
		updatedAt: '2019-08-24T20:29:25.000Z',
	},
	{
		id: 5,
		DepartementId: 3,
		EmployeeId: 8,
		fromDate: '2019-08-24T20:29:25.000Z',
		toDate: '2019-08-24T20:29:25.000Z',
		createdAt: '2019-08-24T20:29:25.000Z',
		updatedAt: '2019-08-24T20:29:25.000Z',
	},
	{
		id: 6,
		DepartementId: 3,
		EmployeeId: 9,
		fromDate: '2019-08-24T20:29:25.000Z',
		toDate: '2019-08-24T20:29:25.000Z',
		createdAt: '2019-08-24T20:29:25.000Z',
		updatedAt: '2019-08-24T20:29:25.000Z',
	},
]

const SequeliceSeed = require('../../utils/SequeliceSeed')
module.exports = SequeliceSeed.createSeedData(
	'DepartementEmployees',
	departementEmployee,
	['createdAt', 'updatedAt', 'fromDate', 'toDate']
)
