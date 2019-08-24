const { Op } = require('sequelize')
const Utils = require('./utils')

class FilterHelpers {
	static async convertKey(argsConvert) {
		const { key } = argsConvert
		const argsTransform = { ...argsConvert }
		const transformKeyByKey = await Utils.handleTransformByKey(
			'transformKeyByKey',
			argsTransform
		)

		if (!Utils.isHandleByDefault(transformKeyByKey)) {
			return transformKeyByKey
		}

		const transformKey = await Utils.handleGlobalTransform(
			'transformKey',
			argsTransform
		)

		if (!Utils.isHandleByDefault(transformKey)) {
			return transformKey
		}

		const filterSplit = key.split('.')
		return filterSplit.length > 1 ? '$' + key + '$' : key
	}

	static async convertValue(argsConvert) {
		const { key, value, model } = argsConvert
		const type = Utils.getTypeKey(model, key)
		const argsTransform = { ...argsConvert, type }
		const transformValueByKey = await Utils.handleTransformByKey(
			'transformValueByKey',
			argsTransform
		)

		if (!Utils.isHandleByDefault(transformValueByKey)) {
			return transformValueByKey
		}

		const transformValue = await Utils.handleGlobalTransform(
			'transformValue',
			argsTransform
		)

		if (!Utils.isHandleByDefault(transformValue)) {
			return transformValue
		}

		// TODO: kondisi dengan instanceof
		switch (type) {
			default:
				if (Utils.isIdKey(key)) {
					return { [Op.eq]: value }
				}
				return { [Op.like]: `%${value}%` }
		}
	}
}

module.exports = FilterHelpers
