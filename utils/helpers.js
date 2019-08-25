const { Operator } = require('../constants')
const sequelize = require('sequelize')
const { isObject, cloneDeep } = require('lodash')
const _ = require('lodash')
const Utils = require('./utils')

class Helpers {
	static transfromMultiKeysValue(arrKeys, fn) {
		return arrKeys.reduce((acc, key) => {
			acc[key] = fn
			return acc
		}, {})
	}

	static forceChangeKeyAndValByValue(key, value) {
		return {
			[Operator.KEY]: key,
			[Operator.VALUE]: value,
		}
	}

	static isQueryIdExits(filterQuery, id) {
		const queries = Utils.parseQueryValueToJson(filterQuery)
		return !!queries.find(x => x.id === id)
	}

	static addTicks(val) {
		return `\`${val}\``
	}

	static getColumnQueryKey(key) {
		const splitKeys = key.split('.')
		const lastKey = this.addTicks(splitKeys.pop())
		return [this.addTicks(splitKeys.join('->')), lastKey].join('.')
	}

	static handlePrefix(prefix, cb) {
		return async (args, cont) => {
			const { key, model } = args
			const { singular } = model.options.name
			const splitKey = key.split('.')
			let isParentModel = false
			splitKey.pop()
			if (splitKey.length === 0) {
				isParentModel = true
				splitKey.push(singular)
			}
			const modelPath = splitKey.join('.')
			const lastKey = Utils.getLastKey(key)
			const [prefixLastKey, columnKey] = lastKey.split('$')
			if (prefixLastKey === prefix) {
				const normalKey = [modelPath, columnKey].join('.')
				const newValue = await cb(
					{
						...args,
						key: normalKey,
						type: Utils.getTypeKey(model, normalKey),
					},
					cont
				)
				if (newValue instanceof sequelize.Utils.Literal) {
					return newValue
				}

				if (
					isObject(newValue) &&
					_.has(newValue, Operator.KEY) &&
					_.has(newValue, Operator.VALUE)
				) {
					return newValue
				}

				/*
				 use columnkey if parentmodel, because sequelize will add prefix
				 parent model ex: Deparement.name -> Departement.Departement.name
				 */
				return this.forceChangeKeyAndValByValue(
					isParentModel ? columnKey : normalKey,
					newValue
				)
			}
			return cont
		}
	}
}

module.exports = Helpers
