const { generate } = require('../core')
const models = require('../db/models')
const util = require('util')
const { cloneDeep } = require('lodash')
const sequelize = require('sequelize')
const { Op } = sequelize
const {
	Departement,
	DepartementManager,
	DepartementEmployee,
	Salary,
	Title,
	Employee,
} = models

const listIncludePath = [
	{
		table: 'DepartementManagers',
		key: 'DepartementId',
		value: '1',
		title: 'DepartementManagers, DepartementId, 1',
	},
	{
		table: 'DepartementManagers.Employee',
		key: 'lastName',
		value: 'keen',
		title: 'DepartementManagers.Employee, lastName, keen',
	},
	{
		table: 'DepartementEmployees',
		key: 'EmployeeId',
		value: '2',
		title: 'DepartementEmployees, EmployeeId, 2',
	},
	{
		table: 'DepartementEmployees.Employee',
		key: 'firstName',
		value: 'anna',
		title: 'DepartementEmployees.Employee, firstName, anna',
	},
	{
		table: 'DepartementEmployees.Employee.Salaries',
		key: 'salary',
		value: '5000000',
		title: 'DepartementEmployees.Employee.Salaries, salary, 5000000',
	},
	{
		table: 'DepartementEmployees.Employee.JobTitles',
		key: 'title',
		value: 'librarian',
		title: 'DepartementEmployees.Employee.JobTitles, title, librarian',
	},
]

const reduceConditionIncludePath = listIncludePath.reduce((acc, curVal) => {
	acc.push([curVal.title, curVal.table, curVal.key, curVal.value])
	return acc
}, [])

describe('basic config test', () => {
	const including = [
		{
			model: DepartementManager,
			include: [
				{
					model: Employee,
				},
			],
		},
		{
			model: DepartementEmployee,
			include: [
				{
					model: Employee,
					include: [
						{
							model: Salary,
						},
						{
							model: Title,
							as: 'JobTitles',
						},
					],
				},
			],
		},
	]

	let reqQuery
	let reqEmptyQuery

	beforeAll(function() {
		reqQuery = {
			query: {
				filtered: [
					{
						id: 'id',
						value: 'john',
					},
				],
			},
		}
		reqEmptyQuery = {
			query: {},
		}
	})

	test('should return error when not passing model', () => {
		async function generateNoModel() {
			await generate({})
		}
		expect(generateNoModel()).rejects.toThrow(new Error('model must be set !'))
	})

	test(
		'should return empty array or object if ' +
			'not passing req.query or empty req.query obj',
		async function() {
			const defaultCondition = {
				includeCount: [],
				include: [],
				queryFilter: {},
				querySort: [],
			}

			let condition = await generate({
				model: Departement,
			})

			expect(condition).toEqual(defaultCondition)

			condition = await generate({
				req: reqEmptyQuery,
				model: Departement,
			})

			expect(condition).toEqual(defaultCondition)
		}
	)

	test(
		'should return queryFilter ' + 'with key id and value Op.eq john',
		async function() {
			const condition = await generate({
				req: reqQuery,
				model: Departement,
			})

			expect(condition.queryFilter).toEqual({
				id: {
					[Op.eq]: 'john',
				},
			})
		}
	)

	test(
		'should return equal include ' + 'if no query for that include',
		async function() {
			const condition = await generate({
				req: reqQuery,
				model: Departement,
				configs: {
					include: cloneDeep(including),
				},
			})

			expect(condition.include).toEqual(including)
		}
	)

	test(
		'should return include with condition ' + 'if include has query',
		async function() {
			const condition = await generate({
				req: {
					query: {
						filtered: [
							{
								id: 'DepartementEmployees.Employee.nama',
								value: 'anna',
							},
						],
					},
				},
				model: Departement,
				configs: {
					include: cloneDeep(including),
				},
			})
			expect(condition.include).toMatchSnapshot()
		}
	)

	describe('test include condition', function() {
		test.each(reduceConditionIncludePath)(
			'%#.(%s)',
			async (title, column, key, value) => {
				const condition = await generate({
					req: {
						query: {
							filtered: [
								{
									id: [column, key].join('.'),
									value: value,
								},
							],
						},
					},
					model: Departement,
					configs: {
						include: cloneDeep(including),
					},
				})

				expect(condition).toMatchSnapshot()
			}
		)
	})

	test('should return all include condition', async function() {
		const condition = await generate({
			req: {
				query: {
					filtered: listIncludePath.map(item => {
						return {
							id: [item.table, item.key].join('.'),
							value: item.value,
						}
					}),
				},
			},
			model: Departement,
			configs: {
				include: cloneDeep(including),
			},
		})

		expect(condition).toMatchSnapshot()
	})
})
