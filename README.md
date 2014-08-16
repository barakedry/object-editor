object-editor
=============

a simple AngularJS directive for viewing and editing a javascript object

object-editor is useful for debugging an object in the scope 

[try the demo](http://jsfiddle.net/barakedry/1L8e7mwx/1/)

# How to use
## Installation

###using bower
```bash
bower install object-editor
```


or download the zip and embed 
* object-editor.js
* object-editor.css

in your project

## Inject to your angular app
```javascript
angular.module('my-app', ['objectEditor']);
```

## Use inside a view or template
```html
<object-editor object='someObjectInYourScope'></object-editor>
```

