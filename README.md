ember-exif
==========

[![Greenkeeper badge](https://badges.greenkeeper.io/jeffjewiss/ember-exif.svg)](https://greenkeeper.io/)

*This add-on is currently an experiment and under development.*

The goal of this add-on is to read the exif data from photos in your Ember app and make them available as data to the app itself through an ES6 module that can be imported. This could be useful to photo portfolios or other sites where displaying image metadata would be valuable.

Configuration
-------------

`ember-cli-build.js`

```javascript
module.exports = function(defaults) {
  const app = new EmberApp(defaults, {
    exifOptions: {
      paths: ['public/photos'],
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
