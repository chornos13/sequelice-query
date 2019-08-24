const { literal } = require('sequelize')
const Utils = require('./utils')
const { takeRight } = require('lodash')

class SortHelpers {
	static isKeyHandledFilter(key, handledKeys) {
		for (let i = 0; i < handledKeys.length; i++) {
			const handledKey = handledKeys[[i]]
			if (handledKey === key) {
				return true
			}

			const splitHandleKey = handledKey.split('.')
			const splitKey = key.split('.')
			const [modelHandle] = takeRight(splitHandleKey, 2)
			const [modelKey] = takeRight(splitKey, 2)
			if (modelHandle === modelKey) {
				return true
			}
		}
		return false
	}

	static async convertValue(argsConvert) {
		const { key, convertDesc, handledKeys } = argsConvert
		const argsTransform = { ...argsConvert }
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

		if (handledKeys && this.isKeyHandledFilter(key, handledKeys)) {
			return literal(`\`${key}\` ${convertDesc}`)
		}

		return [...key.split('.'), convertDesc]
	}

	static async convertDesc(argsConvert) {
		const { desc } = argsConvert
		const argsTransform = { ...argsConvert }
		const transformDescByKey = await Utils.handleTransformByKey(
			'transformDescByKey',
			argsTransform
		)

		if (!Utils.isHandleByDefault(transformDescByKey)) {
			return transformDescByKey
		}
		return desc ? 'DESC' : 'ASC'
	}
}

module.exports = SortHelpers
