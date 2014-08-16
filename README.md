object-editor
=============

a simple AngularJS directive for viewing and editing a javascript object

object-editor is useful for debugging an object in the scope 

[try the demo](http://jsfiddle.net/barakedry/1L8e7mwx/)

# How to use
## Installation

install using bower
```bash
bower install object-editor
```

or download the zip and embed 
* object-editor.js
* object-editor.css
in your project

## Inject to your angular application
```javascript
angular.module('my-app', ['objectEditor']);
```

## Use inside a view or template
```html
<object-editor object='someObjectInYourScope'></object-editor>
```

