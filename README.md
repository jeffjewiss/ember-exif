<h1 align="center">Ember Exif</h1>

<div align="center">
  <a href="https://travis-ci.org/jeffjewiss/ember-exif"><img src="https://travis-ci.org/jeffjewiss/ember-exif.svg?branch=master" alt="Build Status"></a>
  <a href="https://www.npmjs.com/package/ember-exif"><img src="https://img.shields.io/npm/v/ember-exif.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/ember-exif"><img src="https://img.shields.io/npm/dm/ember-exif.svg" alt="Monthly Downloads"></a>
  <a href="http://emberobserver.com/addons/ember-exif"><img src="http://emberobserver.com/badges/ember-exif.svg" alt="Ember Observer Score"></a>
</div>

<br>

*This add-on is currently an experiment and under development.*

The goal of this add-on is to read the exif data from photos in your Ember app and make them available as data to the app itself through an ES6 module that can be imported. This could be useful to photo portfolios or other sites where displaying image metadata would be valuable.

Configuration
-------------

```javascript
// ember-cli-build.js
module.exports = function(defaults) {
  const app = new EmberApp(defaults, {
    exifOptions: {
      paths: ['public/photos'],
      includedMetaData: ['FileName'], // can’t have both included and excluded
      excludedMetaData: ['FileName'], // can’t have both included and excluded
      output: {
        log: true
      }
    }
  });
```

Usage
-----

From somewhere in your application:

```javascript
import photoData from 'photos/image-manifest'
import { wrap } from 'ember-array/utils'

export default Component.extend({
  init(...args) {
    this._super(...args);

    this.set('photoNamesList', wrap(photoData.data).mapBy('RawFileName'))
  }
})
```
