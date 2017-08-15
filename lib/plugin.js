/* eslint-env node */
'use strict'

const fs = require('fs')
const path = require('path')
const BroccoliPlugin = require('broccoli-plugin')
const exiftool = require('node-exiftool')
const exiftoolBin = require('dist-exiftool')
const ep = new exiftool.ExiftoolProcess(exiftoolBin)
const prettyjson = require('prettyjson')

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
  let { logger } = this.options

  return ep.open().then((pid) => {
    return ep.readMetadata(imagePath).then((res) => {
      if (this.options.output.log) {
        logger.log(prettyjson.render(res.data))
      }

      if (this.options.output.manifest) {
        fs.writeFileSync(toFilePath, `export default { data: ${JSON.stringify(res.data)} }`)
      }

      if (this.options.output.service) {
        // Create an ember service instead of the simple json export?
      }
    }).catch(logger.error)
  }).catch(logger.error)
}

module.exports = ExifPlugin
