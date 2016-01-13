[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/barakedry/object-editor/blob/master/LICENSE)

object-editor
=============

a simple AngularJS directive for viewing and editing a javascript object

object-editor is useful for debugging an object in the scope 

[try the demo](http://jsfiddle.net/barakedry/1L8e7mwx/1/)

# How to use
## Installation

use bower or download the zip

```bash
bower install object-editor
```

Include the following files in your project:
* object-editor.js
* object-editor.css


## Inject to your angular app
```javascript
angular.module('my-app', ['objectEditor']);
```

## Use inside a view or template
```html
<object-editor object='someObjectInYourScope'></object-editor>
```

