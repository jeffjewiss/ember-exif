/* eslint-env node */
'use strict'

const fs = require('fs')
const merge = require('merge')
const mergeTrees = require('broccoli-merge-trees')
const BroccoliFunnel = require('broccoli-funnel')
const ExifPlugin = require('./lib/plugin')

module.exports = {
  name: 'ember-exif',

  included (app) {
    this._super.included.apply(this, arguments)

    let { project: { ui } } = app

    this.exifOptions = merge.recursive({}, {
      enabled: true,
      paths: ['public'],
      logger: ui,
      output: {
        manifest: true,
        log: false,
        service: false
      }
    }, app.options.exifOptions)
  },

  isDevelopingAddon () {
    return true
  },

  getImagePaths () {
    if (this.isDevelopingAddon()) {
      return ['tests/dummy/public']
    }
    return this.exifOptions.paths
  },

  treeForApp (tree) {
    let existingPaths = this.getImagePaths()
      .filter((path) => fs.existsSync(path))

    let imageNodes = existingPaths.map((path) => {
      return new BroccoliFunnel(path, {
        include: [
          '**.{jpg,jpeg,png,gif,webp}'
        ]
      })
    })

    let manifestTree = new ExifPlugin(imageNodes, this.exifOptions)

    return mergeTrees([tree, manifestTree])
  }
}
