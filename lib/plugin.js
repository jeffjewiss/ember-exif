/* eslint-env node */
'use strict'

const fs = require('fs')
const path = require('path')
const BroccoliPlugin = require('broccoli-plugin')
const exiftool = require('node-exiftool')
const exiftoolBin = require('dist-exiftool')
const ep = new exiftool.ExiftoolProcess(exiftoolBin)
const prettyjson = require('prettyjson')
const pick = require('lodash.pick')
const omit = require('lodash.omit')

function ExifPlugin (inputNodes, options) {
  options = options || {}

  if (!(options.logger)) {
    let { log, warn, error } = console

    options.logger = { log, warn, error }
  }

  if (!(this instanceof ExifPlugin)) {
    return new ExifPlugin(inputNodes, options)
  }

  BroccoliPlugin.call(this, Array.isArray(inputNodes) ? inputNodes : [inputNodes], {
    annotation: options.annotation
  })

  this.options = options
}

ExifPlugin.prototype = Object.create(BroccoliPlugin.prototype)
ExifPlugin.prototype.constructor = ExifPlugin

ExifPlugin.prototype.build = function () {
  let toFilePath = path.join(this.outputPath, 'image-manifest.js')
  let [imagePath] = this.inputPaths
  let { includedMetaData, excludedMetaData, logger, output: { log, manifest, service } } = this.options

  if (includedMetaData && excludedMetaData) {
    throw new Error('Please provide either a includedMetaData or excludedMetaData of properties, not both.')
  }

  return ep.open().then((pid) => {
    return ep.readMetadata(imagePath).then((res) => {
      let { data: rawData } = res
      let exifData

      if (includedMetaData) {
        if (!(includedMetaData.length > 0)) {
          throw new Error('Please provide an array of includedMetaData properties.')
        }

        exifData = rawData.map((photoData) => pick(photoData, includedMetaData))
      }

      if (excludedMetaData) {
        if (!(excludedMetaData.length > 0)) {
          throw new Error('Please provide an array of excludedMetaData properties.')
        }

        exifData = rawData.map((photoData) => omit(photoData, excludedMetaData))
      }

      if (log) {
        logger.log('\nember-exif - image-manifest json:')
        logger.log(prettyjson.render(exifData))
      }

      if (manifest) {
        exifData = JSON.stringify(exifData)
        fs.writeFileSync(toFilePath, `export default { exifData: ${JSON.stringify(exifData)} }`)
      }

      if (service) {
        // Create an ember service instead of the simple json export?
      }
    }).catch(logger.error)
  }).catch(logger.error)
}

module.exports = ExifPlugin
