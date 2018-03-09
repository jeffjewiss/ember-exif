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

    this.exifOptions = merge.recursive({}, {
      enabled: true,
      paths: ['public'],
      includedMetaData: false,
      excludedMetaData: false,
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
    return this.exifOptions.paths
  },

  treeForApp () {
    let appTree = this.app.trees.app
    let existingPaths = this.getImagePaths()
      .filter((path) => {
        let stat
        try {
          stat = fs.statSync(path)
          return stat && stat.isDirectory()
        } catch (err) {
          return false
        }
      })

    let imageNodes = existingPaths.map((path) => {
      return new BroccoliFunnel(path, {
        include: [
          '**.{jpg,jpeg,png,gif,webp}'
        ]
      })
    })

    let manifestTree = new ExifPlugin(imageNodes, this.exifOptions)

    return mergeTrees([appTree, manifestTree])
  }
}
