const {
	cloneDeep,
	isFunction,
	isObject,
	isEmpty,
	isBoolean,
} = require('lodash')
const { Operator } = require('./constants')
const _ = require('lodash')
const Utils = require('./utils/utils')
const FilterHelpers = require('./utils/filterhelpers')
const SortHelpers = require('./utils/sorthelpers')

const DEFAULT_CONFIGS_GENERATE_QUERY = {
	include: undefined,
	model: undefined,
	optFilter: {
		initValues: undefined,
		defaultValues: undefined,
		isSkipKey: undefined,
		requiredModel: undefined,
		transformValue: undefined,
		transformValueByKey: undefined,
		transformKey: undefined,
		transformKeyByKey: undefined,
	},
	optSort: {
		initValues: undefined,
		defaultValues: undefined,
		transformValue: undefined,
		transformValueByKey: undefined,
		transformDesc: undefined,
	},
}

async function generate({ req, configs }) {
	const curConfigs = Object.assign(
		cloneDeep(DEFAULT_CONFIGS_GENERATE_QUERY),
		configs
	)
	const { include, model } = curConfigs
	const { filtered: filteredString, sorted: sorterdString } = req.query

	const filtered = Utils.setDefaultValues({
		queryString: filteredString,
		configs: curConfigs.optFilter,
		keyValue: 'value',
	})
	const sorted = Utils.setDefaultValues({
		queryString: sorterdString,
		configs: curConfigs.optSort,
		keyValue: 'desc',
	})

	const optFilterInject = cloneDeep(curConfigs.optFilter)
	const handledKeys = []
	Utils.addFunctionTransformKeyConfig(
		optFilterInject,
		handleIncludeTransfromKey
	)

	await injectQueryInclude({
		filtered,
		include,
		configs: optFilterInject,
		handledKeys,
	})

	const defaultArgs = {
		include,
		handledKeys,
		model,
	}
	const argsFilter = {
		...defaultArgs,
		filtered,
		configs: curConfigs.optFilter,
	}
	const argsSorted = {
		...defaultArgs,
		sorted,
		configs: curConfigs.optSort,
	}

	const { condition: queryFilter } = await handlerFilter(argsFilter)
	const querySort = await handlerSort(argsSorted)
	const includeCount = filterIncludeHandledOnly({ include: cloneDeep(include) })

	return {
		includeCount,
		include,
		queryFilter,
		querySort,
	}
}

function handleIncludeTransfromKey({ key }) {
	/*
	 Ambil Key Column modelnya
	 Ex: 'Role.Status.nama' -> takeRight() -> 'nama'
	 */
	return Utils.getLastKey(key)
}

async function injectQueryInclude({
	filtered,
	include,
	configs: clonedConfigs,
	handledKeys,
	initModelPaths,
	countDeepInclude,
}) {
	handledKeys = handledKeys || []
	if (include) {
		for (let i = 0; i < include.length; i++) {
			const data = include[i]
			const { singular: modelName } = data.model.options.name
			const modelPaths = initModelPaths || []
			modelPaths.push(modelName)
			console.log(modelPaths)
			const oldHandledKeys = cloneDeep(handledKeys)
			let newHandledKeys = []
			if (data.include) {
				newHandledKeys = cloneDeep(
					await injectQueryInclude({
						filtered,
						include: data.include,
						configs: { ...clonedConfigs },
						handledKeys,
						initModelPaths: modelPaths,
						countDeepInclude: modelPaths.length,
					})
				)
			}

			const { condition, oriKeys } = await handlerFilter({
				model: data.model,
				filtered,
				configs: {
					...clonedConfigs,
					isSkipKey({ key }) {
						return !Utils.isKeyFilteredForModel(key, modelName)
					},
				},
			})

			const argsRequiredModelValue = {
				configs: clonedConfigs,
				modelName,
				modelPath: modelPaths.join('.'),
				model: data.model,
				handledKeys,
				filtered,
			}

			if (!isEmpty(condition) || Utils.isContainSymbol(condition)) {
				const required = await getRequiredModelValue(argsRequiredModelValue)
				handledKeys.push(...oriKeys)
				_.set(data, ['where'], condition)
				_.set(data, ['required'], required)
			} else if (newHandledKeys.length > oldHandledKeys.length) {
				const required = await getRequiredModelValue(argsRequiredModelValue)
				/*
				 set required parent model true jika child ada yg dihandle,
				 kalau gk di set required true data yg tidak sesuai kondisi bakal
				 tetep tampil dengan kondisi NULL
				 */
				_.set(data, ['required'], required)
			}

			if (!data.include) {
				/*
				 back to previous model path since nothing included
				 ex: Role.Status.Permission -X will be Role
				 */
				modelPaths.splice(
					modelPaths.length - countDeepInclude,
					modelPaths.length
				)
			}
		}
	}
	return handledKeys
}

async function getRequiredModelValue(options) {
	const { configs, modelPath } = options
	const requiredValue = _.get(configs, ['requiredModel', modelPath])
	if (isFunction(requiredValue)) {
		return await requiredValue(options)
	} else if (isBoolean(requiredValue)) {
		return requiredValue
	}
	// default true if handled
	return true
}

function filterIncludeHandledOnly({ include, filteredInclude }) {
	filteredInclude = filteredInclude || []
	if (include) {
		for (let i = 0; i < include.length; i++) {
			const curModel = include[i]
			let childIncludes = []
			if (curModel.include) {
				childIncludes = filterIncludeHandledOnly({
					include: curModel.include,
				})
			}

			if (curModel.where || curModel.required || childIncludes.length > 0) {
				const clonedInclude = cloneDeep(curModel)
				_.unset(clonedInclude, 'include')
				if (childIncludes.length > 0) {
					clonedInclude.include = [...childIncludes]
				}
				filteredInclude.push(clonedInclude)
			}
		}
	}
	return filteredInclude
}

async function handlerSort({ model, sorted, include, configs, handledKeys }) {
	const sortedArr = Utils.parseQueryValueToJson(sorted)
	const ordering = []

	for (let i = 0; i < sortedArr.length; i++) {
		const sorted = sortedArr[i]
		const { id: key, desc } = sorted
		const args = { key, desc, configs, include, model, handledKeys }

		const convertDesc = await SortHelpers.convertDesc(args)
		const convertValue = await SortHelpers.convertValue({
			...args,
			convertDesc,
		})

		ordering.push(convertValue)
	}
	return ordering
}

async function handlerFilter({
	model,
	filtered,
	include,
	configs,
	handledKeys,
}) {
	const filterArr = Utils.parseQueryValueToJson(filtered)
	const oriKeys = []
	const condition = {}
	for (let i = 0; i < filterArr.length; i++) {
		const filtered = filterArr[i]
		const { id: key, value } = filtered

		const args = { key, value, configs, include, model }
		if (
			(configs.isSkipKey &&
				configs.isSkipKey({ key, value, configs, include })) ||
			(handledKeys && handledKeys.includes(key))
		) {
			continue
		}
		let filterKey = await FilterHelpers.convertKey(args)
		let filterValue = await FilterHelpers.convertValue({
			...args,
			newKey: filterKey,
		})

		if (isObject(filterValue)) {
			if (
				_.has(filterValue, Operator.KEY) &&
				_.has(filterValue, Operator.VALUE)
			) {
				filterKey = filterValue[Operator.KEY]
			}

			if (_.has(filterValue, Operator.VALUE)) {
				filterValue = filterValue[Operator.VALUE]
			}
		}

		if (Utils.isNotValidKey(filterKey) || Utils.isNotValidValue(filterValue)) {
			continue
		}
		oriKeys.push(key)
		condition[filterKey] = filterValue
	}
	return { condition, oriKeys }
}

module.exports = {
	generate,
}
