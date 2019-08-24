const {
	isFunction,
	isObject,
	endsWith,
	takeRight,
	isArray,
	isEmpty,
	isString,
} = require('lodash')
const { Op } = require('sequelize')
const _ = require('lodash')
const { Operator } = require('../constants')

class Utils {
	static async handleTransformByKey(transformConfigName, argsTransform) {
		// TRANSFORM DENGAN SPESIFIK KEY
		const { configs, key } = argsTransform
		const transformByKey = _.get(
			configs,
			`${transformConfigName}['${key}']`,
			false
		)
		if (transformByKey) {
			return isFunction(transformByKey)
				? await transformByKey({ ...argsTransform })
				: transformByKey
		}
		return Operator.HANDLE_BY_DEFAULT
	}

	static async handleGlobalTransform(transformConfigName, argsTransform) {
		const { configs } = argsTransform

		/*
		TRANSFORM GLOBAL, USE CASE INI BIASANYA DIGUNAKAN
		KETIKA INGIN MENTRANSFORM KEY YANG NGGAK DISKIP
		 */
		const transformKey = _.get(configs, transformConfigName, false)
		if (isFunction(transformKey)) {
			return await transformKey(argsTransform)
		} else if (isArray(transformKey)) {
			for (let i = 0; i < transformKey.length; i++) {
				const transKeyFunc = transformKey[i]
				const result = await transKeyFunc(argsTransform, Operator.CONTINUE)
				if (!Utils.isContinue(result)) {
					return result
				}
			}
		}

		return Operator.HANDLE_BY_DEFAULT
	}

	static isHandleByDefault(val) {
		return val === Operator.HANDLE_BY_DEFAULT
	}

	static isContinue(val) {
		return val === Operator.CONTINUE
	}

	static parseQueryValueToJson(query) {
		if (!query) {
			return []
		} else if (isString(query)) {
			return JSON.parse(query)
		}
		return query
	}

	static isContainSymbol(x) {
		if (isObject(x)) {
			const opKeys = Object.keys(Op)
			for (let i = 0; i < opKeys.length; i++) {
				const opt = Op[opKeys[i]]
				if (x[opt]) {
					return true
				}
			}
			return false
		}
		return typeof x === 'symbol'
	}

	static isNotValidKey(key) {
		return !this.isContainSymbol(key) && (isEmpty(key) || key === undefined)
	}

	static isNotValidValue(value) {
		return value === undefined
	}

	static getTypeKey(model, key) {
		const lastKey = this.getLastKey(key)
		return _.get(model, ['attributes', lastKey, 'type'], null)
	}

	static getLastKey(key) {
		const [lastKey] = takeRight(key.split('.'))
		return lastKey
	}

	static getModelName(key) {
		if (key) {
			const splitKey = key.split('.')
			if (splitKey.length < 2) {
				return null
			}

			/*
			 Ambil Nama Modelnya
			 Ex: 'Role.Status.nama' -> takeRight(..., 2)[0] -> 'Status'
			 */
			const [modelKey] = takeRight(splitKey, 2)
			return modelKey
		}
		return null
	}

	static isIdKey(key) {
		const lastKey = this.getLastKey(key)
		return lastKey === 'id' || endsWith(lastKey, 'Id') === true
	}

	static isKeyFilteredForModel(key, modelName) {
		return this.getModelName(key) === modelName
	}

	static addFunctionTransformKeyConfig(opt, fn) {
		const transformKey = _.get(opt, 'transformKey', null)
		if (isFunction(transformKey)) {
			_.set(opt, 'transformKey', [transformKey, fn])
		} else if (isArray(transformKey)) {
			transformKey.push(fn)
		} else {
			_.set(opt, 'transformKey', fn)
		}
	}

	static setDefaultValues({ queryString, configs, keyValue }) {
		const queries = this.parseQueryValueToJson(queryString)
		const setterQuery = objQuery => {
			if (isObject(objQuery)) {
				const entriesValues = Object.entries(objQuery)
				for (let i = 0; i < entriesValues.length; i++) {
					const [key, value] = entriesValues[i]
					const curQuery = queries.find(x => x.id === key)
					if (!curQuery) {
						queries.push({
							id: key,
							[keyValue]: value,
						})
					}
				}
			}
		}

		const defaultValues = _.get(configs, 'defaultValues')
		setterQuery(defaultValues)

		if (queries.length === 0) {
			const initValues = _.get(configs, 'initValues')
			setterQuery(initValues)
		}

		return queries
	}
}

module.exports = Utils
