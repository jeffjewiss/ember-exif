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

  if (!imagePath) {
    logger.log('No image path(s) provided')

    // create empty array for exifData export to prevent consuming app from blowing up
    fs.writeFileSync(toFilePath, `export default { exifData: [] };`)
    return false
  }

  if (!checkImagePath(imagePath)) {
    logger.log(`Image directory "${imagePath}" is missing or empty`)

    // create empty array for exifData export to prevent consuming app from blowing up
    fs.writeFileSync(toFilePath, `export default { exifData: [] };`)
    return false
  }

  return ep.open().then((pid) => {
    logger.log('Started exiftool with process %s', pid)

    return ep.readMetadata(imagePath).then((res) => {
      let { data: rawData } = res
      let exifData

      if (includedMetaData) {
        if (!(includedMetaData.length > 0)) {
          throw new Error('Please provide an array of includedMetaData properties.')
        }

        exifData = rawData.map((photoData) => pick(photoData, includedMetaData))
      } else if (excludedMetaData) {
        if (!(excludedMetaData.length > 0)) {
          throw new Error('Please provide an array of excludedMetaData properties.')
        }

        exifData = rawData.map((photoData) => omit(photoData, excludedMetaData))
      } else {
        exifData = rawData
      }

      if (log) {
        logger.log('\nember-exif - image-manifest json:')
        logger.log(prettyjson.render(exifData))
      }

      if (manifest) {
        exifData = JSON.stringify(exifData)
        fs.writeFileSync(toFilePath, `export default { exifData: ${exifData} }`)
      }

      if (service) {
        // Create an ember service instead of the simple json export?
      }
    }).catch(logger.error)
  }).then(() => {
    return ep.close().then(() => {
      logger.log('Closed exiftool')
    })
  }).catch(logger.error)
}

function checkImagePath (imagePath) {
  let stat

  try {
    stat = fs.statSync(imagePath)
  } catch (err) {
    return false
  }

  if (stat.isDirectory()) {
    let items = fs.readdirSync(imagePath)

    return items && items.length
  } else {
    return false
  }
}

module.exports = ExifPlugin
