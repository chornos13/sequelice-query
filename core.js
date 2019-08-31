const { cloneDeep, isFunction, isObject, isEmpty } = require('lodash')
const { Operator } = require('./constants')
const _ = require('lodash')
const Utils = require('./utils/utils')
const FilterHelpers = require('./utils/filterhelpers')
const SortHelpers = require('./utils/sorthelpers')

const DEFAULT_CONFIGS_GENERATE_QUERY = {
	include: undefined,
	optFilter: {
		initValues: undefined,
		defaultValues: undefined,
		isSkipKey: undefined,
		customIncludeOptions: undefined,
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

async function generate({ req, model, configs }) {
	if (!model) {
		throw new Error('model must be set !')
	}

	const curConfigs = Object.assign(
		cloneDeep(DEFAULT_CONFIGS_GENERATE_QUERY),
		configs
	)
	let { include } = curConfigs
	include = include || []

	const { filtered: filteredString, sorted: sorterdString } = req
		? req.query
		: {}

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
		model,
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

const setCustomIncludeOptions = async (objData, argsCustomIncludeOptions) => {
	const customOptions = await getCustomIncludeOptions(argsCustomIncludeOptions)
	const customKeys = Object.keys(customOptions)
	for (let i = 0; i < customKeys.length; i++) {
		const key = customKeys[i]
		_.set(objData, key, customOptions[key])
	}
}

const getModelAssociationName = (parentModel, dataModel) => {
	const { singular, plural } = dataModel.model.options.name
	const listName = [singular, plural]
	if (dataModel.as) {
		listName.splice(0, 0, dataModel.as)
	}
	for (let i = 0; i < listName.length; i++) {
		const curName = listName[i]
		const curModel = parentModel.associations[curName]
		if (curModel) {
			return curName
		}
	}
	return singular
}

async function injectQueryInclude({
	filtered,
	include,
	configs: clonedConfigs,
	handledKeys,
	initModelPaths,
	model,
}) {
	handledKeys = handledKeys || []
	if (include) {
		for (let i = 0; i < include.length; i++) {
			const data = include[i]
			const modelName = getModelAssociationName(model, data)
			const modelPaths = initModelPaths || []
			modelPaths.push(modelName)
			const modelPath = modelPaths.join('.')
			const oldHandledKeys = cloneDeep(handledKeys)
			let newHandledKeys = []
			if (data.include) {
				newHandledKeys = cloneDeep(
					await injectQueryInclude({
						model: data.model,
						filtered,
						include: data.include,
						configs: { ...clonedConfigs },
						handledKeys,
						initModelPaths: modelPaths,
					})
				)
			}

			const { condition, oriKeys } = await handlerFilter({
				model: data.model,
				filtered,
				configs: {
					...clonedConfigs,
					isSkipKey({ key }) {
						const keyPaths = key.split('.')
						keyPaths.pop()
						return !(keyPaths.join('.') === modelPath)
					},
				},
			})

			const argsCustomIncludeOptions = {
				configs: clonedConfigs,
				modelName,
				modelPath,
				model: data.model,
				handledKeys,
				filtered,
			}

			if (!isEmpty(condition) || Utils.isContainSymbol(condition)) {
				handledKeys.push(...oriKeys)
				_.set(data, ['where'], condition)
				_.set(data, ['required'], true)
				setCustomIncludeOptions(data, argsCustomIncludeOptions)
			} else if (newHandledKeys.length > oldHandledKeys.length) {
				/*
				 set required parent model true jika child ada yg dihandle,
				 kalau gk di set required true data yg tidak sesuai kondisi bakal
				 tetep tampil dengan kondisi NULL
				 */
				_.set(data, ['required'], true)
				setCustomIncludeOptions(data, argsCustomIncludeOptions)
			}

			if (initModelPaths) {
				initModelPaths.splice(initModelPaths.length - 1, initModelPaths.length)
			}
		}
	}
	if (initModelPaths) {
		initModelPaths.splice(initModelPaths.length - 1, initModelPaths.length)
	}

	return handledKeys
}

async function getCustomIncludeOptions(options) {
	const { configs, modelPath } = options
	const requiredValue = _.get(configs, ['customIncludeOptions', modelPath], {})
	if (isFunction(requiredValue)) {
		return await requiredValue(options)
	}
	return requiredValue
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
