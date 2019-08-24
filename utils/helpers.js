const { Operator } = require('../constants')
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
}

module.exports = Helpers
