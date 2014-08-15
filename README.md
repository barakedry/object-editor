object-editor
=============

a simple AngularJS directive for viewing and editing a javascript object

object-editor is useful for debugging an object in the scope 

[try the demo](http://www.github.com)

# How to use
## Installation
object-editor includes 2 files object-editor.js and object-editor.css

install using bower
```bash
bower install object-editor
```

or just download it as a zip and embed the files in your project

## Inject to your angular application
```javascript
angular.module('my-app', ['objectEditor']);
```

## Use inside a view or template
```html
<object-editor object='someObjectInYourScope'></object-editor>
```

