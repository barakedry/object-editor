/**
 * Created by barakedry on 8/16/14.
 */

(function () {
    'use strict';

    var $ = angular.element;

    angular.module('objectEditor', [])
        .directive('objectEditor', function () {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    object: '='
                },
                template: "<ul class=\"object-editor\">" +
                    "<property ng-repeat='key in keys' name='key' parent='object'></property>" +
                    "<li data-ng-show='exists' class='addSection'><button class='add'>Add {{addSubject}}</button></li>" +
                    "</ul>",
                link: {
                    pre: function (scope, element) {

                        scope.exists = typeof scope.object === 'object';

                        scope.addSubject = angular.isArray(scope.object) ? 'Value' : 'Property';

                        var $menu = $(document.getElementById("objecteditor-types-menu"));

                        function bodyClick(e) {
                            if ($menu.find($(e.target)).length === 0) {
                                //$menu[0].style.display = "none";
                                $(document.body).unbind("click", bodyClick);
                            }
                        }

                        // create menu
                        if (!$menu.length) {
                            $menu = $("<ul/>").attr("id", "objecteditor-types-menu");
                            $menu.append($("<li/>").data("type", "object").text("Object"))
                                .append($("<li/>").data("type", "array").text("Array"))
                                .append($("<li/>").data("type", "string").text("String"))
                                .append($("<li/>").data("type", "number").text("Number"))
                                .append($("<li/>").data("type", "boolean").text("Boolean"));

                            $(document.body).append($menu);

                            $menu.on("click", function (e) {
                                var val,
                                    type =  $(e.target).data("type");

                                if (type === "object") {
                                    val = {};
                                } else if (type === "array") {
                                    val = [];
                                } else if (type === "string") {
                                    val = "";
                                } else if (type === "number") {
                                    val = 0;
                                } else if (type === "boolean") {
                                    val = false;
                                }

                                $menu[0].style.display = "none";
                                $(document.body).unbind("click", bodyClick);
                                $menu.data("itemSelection")(val);
                            });

                        }

                        $(element[0].querySelector(".add")).on("click", function () {

                            var $addButton = $(this);

                            //show the menu

                            var rect = this.getBoundingClientRect();
                            $menu[0].style.top = rect.top + rect.height + "px";
                            $menu[0].style.left = rect.left + "px";
                            $menu[0].style.display = "block";

                            function itemSelected(val) {
                                var newKeyName;

                                if (angular.isArray(scope.object)) {
                                    scope.object.push(val);
                                } else {
                                    newKeyName = prompt("Property Name");
                                    if (newKeyName) {
                                        scope.object[newKeyName] = val;
                                    }
                                }
                                scope.objectChange();

                                $menu.data("itemSelection", null);
                            }

                            $menu.data("itemSelection", itemSelected);
                            $(document.body).bind("click", bodyClick);
                            return false;
                        });

                        scope.$watch("object", function () {
                            if (scope.object && typeof scope.object === 'object') {
                                scope.keys = Object.keys(scope.object);
                                scope.exists = typeof scope.object === 'object';
                            }
                        }, true);


                        scope.objectChange = function () {

                            scope.keys = Object.keys(scope.object);
                            scope.$apply();
                        };
                    }
                }
            };
        }).directive('property', function ($compile) {

            return {
                restrict: "E",
                replace: true,
                scope: {
                    name: '=',
                    parent: '='
                },
                template: "<li class='{{type}} {{expanedCollapsed}}'><button name='delete' class='delete' title='Delete'></button><button class='expandCollapse'></button><label>{{name}}:</label> {{start}} <span class='type {{type}} {{editingClass}}'></span></li>",
                link: {
                    pre: function (scope, element, attrs) {
                        var value,
                            typeElement,
                            type,
                            editorHTML = '<object-editor object="parent[name]"></object-editor>',
                            actionButtonHtml = '',
                            inputHTML = "",
                            isArray;

                        function create() {
                            var childElement;

                            value = scope.parent[scope.name];
                            type = typeof value;
                            inputHTML = "";
                            isArray = angular.isArray(value);

                            if (value === null) {
                                type = 'null';
                            }

                            scope.expanedCollapsed = "expanded";
                            scope.isContainer = type === 'object';
                            scope.isPrimitive = !scope.isContainer || type === 'function';
                            scope.isArray = isArray;
                            scope.inputType = "checkbox";
                            scope.editingClass = "";
                            scope.type = scope.isArray ? 'array' : type;

                            if (scope.isPrimitive) {
                                scope.textValue = value;
                            }

                            scope.prefix = "";
                            scope.suffix = "";
                            scope.start = "";

                            if (type === 'object') {
                                if (scope.isArray) {
                                    scope.start = "[";
                                } else {
                                    scope.start = "{";
                                }
                            } else if (type === 'function') {
                                scope.start = "function () {...}";

                            } else if (type === 'string') {
                                scope.prefix = "\"";
                                scope.suffix = "\"";
                                scope.inputType = "text";

                            } else if (type === 'number') {
                                scope.inputType = "number";
                            } else if (type === 'boolean') {
                                scope.inputType = "checkbox";
                            }

                            scope.showInput = function () {
                                return scope.isPrimitive && (scope.editing ||  scope.inputType === "checkbox");
                            };

                            typeElement = $(element[0].querySelector(".type"));
                            typeElement[0].innerHTML = 0;

                            if (scope.isPrimitive) {
                                inputHTML =  "<input type='" + scope.inputType + "' data-ng-model='parent[name]' ng-switch-case='isBoolean'>";
                            }

                            actionButtonHtml = type === 'function' ? "<button class='run' title='run'>Run</button> <button class='runWithParams' title='runWithParams'>Run with arguments</button> " : "<button class='duplicate' title='Duplicate'>Duplicate</button>";

                            typeElement.html("{{prefix}}" + inputHTML  +  "<span class='textValue'>{{parent[name]}}</span>{{suffix}}</span>" + actionButtonHtml);

                            $compile(typeElement.contents())(scope);


                            $(element[0].querySelector("span.textValue, .duplicate")).unbind("click");
                            element.find("input").unbind("blur");

                            if (type === 'string' || type === 'number') {
                                $(element[0].querySelector("span.textValue")).bind("click", function () {
                                    scope.editing = true;
                                    scope.editingClass = "editing";
                                    scope.$apply();
                                });

                                element.find("input").bind("blur", function () {
                                    scope.editingClass = "";
                                    scope.editing = false;
                                    scope.$apply();
                                });
                            }

                            $(element[0].querySelector(".duplicate")).bind("click", function () {

                                var newKeyName;

                                if (angular.isArray(scope.parent)) {
                                    scope.parent.push(angular.copy(scope.parent[scope.name]));
                                } else {
                                    newKeyName = prompt("Property Name");
                                    if (newKeyName) {
                                        scope.parent[newKeyName] = angular.copy(scope.parent[scope.name]);
                                    }
                                }

                                scope.$parent.objectChange();
                            });


                            $(element[0].querySelector(".run")).bind("click", function () {
                                scope.parent[scope.name].call(scope.parent[scope.name]);
                            });

                            $(element[0].querySelector(".runWithParams")).bind("click", function () {
                                var args = prompt("arguments (comma delimited)") || "";
                                scope.parent[scope.name].apply(scope.parent[scope.name], args.split(","));
                            });

                            childElement = $(element[0].querySelector("ul.objecteditor"));
                            if (childElement.length) {
                                childElement.remove();
                                $(element[0].querySelector(".end")).remove();
                            }

                            if (typeof value === 'object') {
                                $compile(editorHTML)(scope, function (cloned, scope) {
                                    element.append(cloned);
                                    element.append($("<span/>").addClass("end").addClass(type).text(isArray ? ']' : '}'));
                                });
                            }
                        }


                        create();

                        function expandCollapse () {
                            if (scope.expanedCollapsed === "expanded") {
                                scope.expanedCollapsed = "collapsed";
                            } else {
                                scope.expanedCollapsed = "expanded";
                            }

                            scope.$apply();
                        }

                        $(element[0].querySelector(".expandCollapse")).bind("click", expandCollapse);
                        element.find("label").eq(0).bind("dblclick", expandCollapse);


                        scope.$watch("editing", function (isEditing) {
                            if (isEditing) {
                                setTimeout(function () {
                                    element.find("input")[0].focus();
                                    element.find("input")[0].select();
                                }, 1);

                            }
                        });

                        $(element[0].querySelector(".delete")).bind("click", function () {

                            if (angular.isArray(scope.parent)) {
                                scope.parent.splice(Number(scope.name), 1);
                            } else {
                                delete scope.parent[scope.name];
                            }

                            scope.$parent.objectChange();
                        });

                        scope.$watch("parent[name]", function (newVal) {
                            var newType = typeof newVal,
                                newIsArray = angular.isArray(newVal);

                            if (newType !== type || newIsArray !== isArray) {
                                create();
                            }
                        });
                    }
                }
            };
        });
}());
