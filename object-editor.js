/**
 * Created by barakedry on 8/16/14.
 */

(function () {
    'use strict';

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

                        var $menu = angular.element("#objecteditor-types-menu");

                        function bodyClick(e) {
                            if ($menu.find(angular.element(e.target)).length === 0) {
                                $menu.hide();
                                angular.element(document.body).off("click", bodyClick);
                            }
                        }

                        // create menu
                        if (!$menu.length) {
                            $menu = angular.element("<ul/>").attr("id", "objecteditor-types-menu");
                            $menu.append(angular.element("<li/>").data("type", "object").text("Object"))
                                .append(angular.element("<li/>").data("type", "array").text("Array"))
                                .append(angular.element("<li/>").data("type", "string").text("String"))
                                .append(angular.element("<li/>").data("type", "number").text("Number"))
                                .append(angular.element("<li/>").data("type", "boolean").text("Boolean"));

                            angular.element(document.body).append($menu);

                            $menu.on("click", function (e) {
                                var val,
                                    type =  angular.element(e.target).data("type");

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

                                $menu.hide();
                                angular.element(document.body).off("click", bodyClick);
                                $menu.trigger("itemSelection", [val]);
                            });

                        }

                        element.find(".add").on("click", function () {

                            var $addButton = angular.element(this);

                            //show the menu
                            $menu.css({top: $addButton.offset().top + $addButton.height() + "px",
                                left: $addButton.offset().left  + "px"});

                            $menu.show();

                            function itemSelected(e, val) {
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

                                $menu.off("itemSelection", itemSelected);
                            }

                            $menu.on("itemSelection", itemSelected);
                            angular.element(document.body).on("click", bodyClick);
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
                    pre: function (scope, element) {
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

                            typeElement = element.find(".type").empty();

                            if (scope.isPrimitive) {
                                inputHTML =  "<input type='" + scope.inputType + "' data-ng-model='parent[name]' ng-switch-case='isBoolean'>";
                            }

                            actionButtonHtml = type === 'function' ? "<button class='run' title='run'>Run</button> <button class='runWithParams' title='runWithParams'>Run with arguments</button> " : "<button class='duplicate' title='Duplicate'>Duplicate</button>";

                            typeElement.html("{{prefix}}" + inputHTML  +  "<span class='textValue'>{{parent[name]}}</span>{{suffix}}</span>" + actionButtonHtml);

                            $compile(typeElement.contents())(scope);


                            element.find("span.textValue, .duplicate").unbind("click");
                            element.find("input").unbind("blur");

                            if (type === 'string' || type === 'number') {
                                element.find("span.textValue").on("click", function () {
                                    scope.editing = true;
                                    scope.editingClass = "editing";
                                    scope.$apply();
                                });

                                element.find("input").on("blur", function () {
                                    scope.editingClass = "";
                                    scope.editing = false;
                                    scope.$apply();
                                });
                            }

                            element.find(".duplicate").on("click", function () {

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


                            element.find(".run").on("click", function () {
                                scope.parent[scope.name].call(scope.parent[scope.name]);
                            });

                            element.find(".runWithParams").on("click", function () {
                                var args = prompt("arguments (comma delimited)") || "";
                                scope.parent[scope.name].apply(scope.parent[scope.name], args.split(","));
                            });

                            childElement = element.find("ul.objecteditor");
                            if (childElement.length) {
                                childElement.remove();
                                element.find(".end").remove();
                            }

                            if (typeof value === 'object') {
                                $compile(editorHTML)(scope, function (cloned) {
                                    element.append(cloned);
                                    element.append(angular.element("<span/>").addClass("end").addClass(type).text(isArray ? ']' : '}'));
                                });
                            }
                        }


                        create();

                        element.find(".expandCollapse").on("click", function () {
                            if (scope.expanedCollapsed === "expanded") {
                                scope.expanedCollapsed = "collapsed";
                            } else {
                                scope.expanedCollapsed = "expanded";
                            }

                            scope.$apply();
                        });


                        scope.$watch("editing", function (isEditing) {
                            if (isEditing) {
                                setTimeout(function () {
                                    element.find("input").focus().select();
                                }, 1);

                            }
                        });

                        element.find(".delete").on("click", function () {

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
