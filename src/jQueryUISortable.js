/**
 * jQueryUISortable v0.0.1
 * require jquery 1.7+
 * Mars Shen August 5, 2015,
 * MIT License
 * for more info pls visit: https://github.com/Mars-Shen/jQueryUISortable
 */
;
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD (Register as an anonymous module)
		define(['jquery', "jqueryui"], factory);
	} else if (typeof exports === 'object') {
		// Node/CommonJS
		module.exports = factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($){
		// Create the defaults once
		var pluginName = "sorttable",
		defaults = {
			startIndex : 0, //start index is used when user add a new item, and we will use this start index as a part of element id.
			enableNewItem : false, //if this option is true, new item which you added will be enable. default is false.
			sortJsonData : [], //table's data array, json based. [{id:,isActiveFlag:,value}].
			activeButton : true, //show active/inactive button or not, default is true.
			activeButtonText : "Active/Inactive", //text on active button.
			//batch job group
			batchButton : true, //show batch mode/normal button or not, default is true.
			batchButtonText : "Batch Mode", //text on batch mode button.
			normalModeButtonText : "Normal Mode", //text on normal mode button.
			//edit mode group
			editButton : true, //show edit button or not, default is true.
			editButtonText : "Edit Item", //text on edit button.
			saveButtonText : "save Item", //text on edit button.
			cancelButtonText : "Cancel", //text on edit button.

			addButton : true, //show add item button or not, default is true.
			addButtonText : "Add Item", //text on add item button.
			deleteButton : true, //show delete button or not, default is true.
			deleteButtonText : "Delete Item", //text on delete button.
			submitButton : true, //show submit button or not, default is true.
			submitButtonText : "Submit", //text on submit button.
			submitCallBack : function () {},
		};

		var SortTable = function (element, options) {
			this.element = element;
			this.elementId = $(element).attr("id");
			this.ulElement = null;
			this.buttonElements = null;
			this.options = $.extend({}, defaults, options); //this.options.sortJsonData is using to store source data
			this.activedData = [];
			this.inactivedData = [];
			this.selectedItem = {};
			this.isBatchJob = false;
			this.isEditMode = false;
			this.selectNumber = 0;
			this._defaults = defaults;
			this._name = pluginName;
			this.version = 'v0.0.1';
			this.init();
		}

		//method of jQueryUISortTableBeautifier
		SortTable.prototype = {
			selectOneItemEnableButtonsDelegate : function () {
				$("#" + this.elementId + "_editItem").removeAttr("disabled");
				$("#" + this.elementId + "_deleteItem").removeAttr("disabled");
				$("#" + this.elementId + "_acitveInactiveItem").removeAttr("disabled");
			}, //Delegate, this is invoked when user select one item in our list
			unselectItemDisableButtonsDelegate : function () {
				$("#" + this.elementId + "_editItem").attr("disabled", "disabled");
				$("#" + this.elementId + "_deleteItem").attr("disabled", "disabled");
				$("#" + this.elementId + "_acitveInactiveItem").attr("disabled", "disabled");
			}, //Delegate, this is invoked when table is nothing selected
			enterEditModeButtonsStatusDelegate : function () {
				$("#" + this.elementId + "_saveItem").show();
				$("#" + this.elementId + "_cancelItem").show();
				$("#" + this.elementId + "_editItem").hide();
				$("#" + this.elementId + "_addItem").hide();
				$("#" + this.elementId + "_deleteItem").hide();
				$("#" + this.elementId + "_batchJob").hide();
			}, //Delegate, this is invoked when user enter edit mode
			exitEditModeButtonsStatusDelegate : function () {
				$("#" + this.elementId + "_saveItem").hide();
				$("#" + this.elementId + "_cancelItem").hide();
				$("#" + this.elementId + "_editItem").show();
				$("#" + this.elementId + "_addItem").show();
				$("#" + this.elementId + "_deleteItem").show();
				$("#" + this.elementId + "_batchJob").show();
			}, //Delegate, this is invoked when user exit edit mode
			enterBatchJobModeButtonStatusDelegate : function () {
				$("#" + this.elementId + "_batchJob").hide();
				$("#" + this.elementId + "_normalMode").show();
				$("#" + this.elementId + "_addItem").hide();
				$("#" + this.elementId + "_editItem").hide();
				$("#" + this.elementId + "_acitveInactiveItem").removeAttr("disabled");
				$("#" + this.elementId + "_deleteItem").removeAttr("disabled");
				$("#" + this.elementId + "_editItem").attr("disabled", "disabled");
			}, //Delegate, this is invoked when user enter batch job mode
			exitBatchJobModeButtonStatusDelegate : function () {
				$("#" + this.elementId + "_batchJob").show();
				$("#" + this.elementId + "_normalMode").hide();
				$("#" + this.elementId + "_editItem").show();
				$("#" + this.elementId + "_addItem").show();
				$("#" + this.elementId + "_acitveInactiveItem").attr("disabled", "disabled");
				$("#" + this.elementId + "_deleteItem").attr("disabled", "disabled");
			}, //Delegate, this is invoked when user exit batch job mode
			enableBatchButtonDelegate : function () {
				$("#" + this.elementId + "_acitveInactiveItem").removeAttr("disabled");
				$("#" + this.elementId + "_deleteItem").removeAttr("disabled");
			}, //Delegate, this is invoked when user enter batch job mode and check some check boxes
			disableBatchJobButtonDelegate : function () {
				$("#" + this.elementId + "_acitveInactiveItem").attr("disabled", "disabled");
				$("#" + this.elementId + "_deleteItem").attr("disabled", "disabled");
			}, //Delegate, this is invoked when user enter batch job mode and select nothing
			init : function () {
				//init sortable
				this.buildSortHTML();
				this.buildSortTable();
				this.reflreshData();
				var that = this;
				//select item
				$(this.ulElement).on("click", "li", function () {
					that.selectItemFuction($(this));
				});
				//submit button clicked
				$(this.element).on("click", "#" + this.elementId + "_submit", function (event) {
					that.options.submitCallBack(event);
				});
				//active or inactive selected item
				$(this.element).on("click", "#" + this.elementId + "_acitveInactiveItem", function () {
					that.activeInactiveFunction();
				});
				//edit item
				$(this.element).on("click", "#" + this.elementId + "_editItem", function () {
					that.editFunction();
				});
				//save item
				$(this.element).on("click", "#" + this.elementId + "_saveItem", function () {
					that.saveFunction();
				});
				//Delete item
				$(this.element).on("click", "#" + this.elementId + "_deleteItem", function () {
					that.deleteFunction();
				});
				//Cancel item
				$(this.element).on("click", "#" + this.elementId + "_cancelItem", function () {
					that.calcelFunction();
				});
				//Batch Job
				$(this.element).on("click", "#" + this.elementId + "_batchJob", function () {
					that.batchJobFunction();
				});
				//Add Item
				$(this.element).on("click", "#" + this.elementId + "_addItem", function () {
					that.addItemFunction();
				});
				//normal mode
				$(this.element).on("click", "#" + this.elementId + "_normalMode", function () {
					that.normalModeFunction();
				});

				//bind checkbox click event
				$(this.ulElement).on("click", "input[type='checkbox']", function () {
					if ($(this).prop("checked")) {
						that.selectNumber++;
					} else {
						that.selectNumber--;
					}
					that.batchModeButtonStatus();
				});
			},
			getButtonHtml : function (type) {
				var sHtml = "";
				switch (type) {
				case "act":
					sHtml = "<input type=\"button\" id=\"" + this.elementId + "_acitveInactiveItem\" disabled=\"disabled\" value=\"" + this.options.activeButtonText + "\"/>";
					break;
				case "bat":
					sHtml = "<input type=\"button\" id=\"" + this.elementId + "_batchJob\"  value=\"" + this.options.batchButtonText + "\"/>";
					break;
				case "nol":
					sHtml = "<input type=\"button\" id=\"" + this.elementId + "_normalMode\" class=\"hide\" value=\"" + this.options.normalModeButtonText + "\"/>";
					break;
				case "edi":
					sHtml = "<input type=\"button\" id=\"" + this.elementId + "_editItem\" disabled=\"disabled\" value=\"" + this.options.editButtonText + "\"/>";
					break;
				case "sav":
					sHtml = "<input type=\"button\" id=\"" + this.elementId + "_saveItem\" class=\"hide\" value=\"" + this.options.saveButtonText + "\"/>";
					break;
				case "can":
					sHtml = "<input type=\"button\" id=\"" + this.elementId + "_cancelItem\" class=\"hide\" value=\"" + this.options.cancelButtonText + "\"/>";
					break;
				case "add":
					sHtml = "<input type=\"button\" id=\"" + this.elementId + "_addItem\" value=\"" + this.options.addButtonText + "\"/>";
					break;
				case "del":
					sHtml = "<input type=\"button\" id=\"" + this.elementId + "_deleteItem\" disabled=\"disabled\" value=\"" + this.options.deleteButtonText + "\"/>";
					break;
				case "sub":
					sHtml = "<input type=\"button\" id=\"" + this.elementId + "_submit\" value=\"" + this.options.submitButtonText + "\"/>";
					break;
				default:
					break;
				}
				return sHtml;
			},
			buildSortHTML : function () {
				var element = $(this.element);
				var ulElement = $("<ul id=\"ul_" + this.elementId + "\"></ul>");
				this.ulElement = ulElement;
				element.append(ulElement);
				ulElement.empty();
				ulElement.addClass("sortable_default");
				var activedDataTemp = this.activedData;
				var inactivedDataTemp = this.inactivedData;
				$.each(this.options.sortJsonData, function (i, v) {
					var newItem = $("<li class=\"ui-state-default\" id=\"li_sortable_item_" + v.id + "\">" +
							"<input type=\"checkbox\" class=\"li_sortable_checkbox hide\" id=\"li_sortable_checkbox_" + v.id + "\"/>" +
							"<input type=\"hidden\" class=\"hid_sortable_id\" id=\"hid_sortable_id_" + v.id + "\" value=\"" + v.id + "\"/>" +
							"<input type=\"text\" class=\"hid_sortable_value hide\" id=\"hid_sortable_value_" + v.id + "\" value=\"" + v.value + "\"/>" +
							"<span class=\"sortable_read_only_text\">" + v.value + "</span>" +
							"</li>");
					if (v.isActiveFlag) {
						activedDataTemp.push(v);
					} else {
						inactivedDataTemp.push(v);
					}
					ulElement.append(newItem);
				});
				var buttonElements = $("<div id=\"buttons_" + this.elementId + "\">");
				this.buttonElements = buttonElements;
				element.append(buttonElements);
				if (this.options.activeButton) {
					buttonElements.append($(this.getButtonHtml("act")));
				}
				if (this.options.batchButton) {
					buttonElements.append($(this.getButtonHtml("bat")));
					buttonElements.append($(this.getButtonHtml("nol")));
				}
				if (this.options.editButton) {
					buttonElements.append($(this.getButtonHtml("edi")));
					buttonElements.append($(this.getButtonHtml("sav")));
					buttonElements.append($(this.getButtonHtml("can")));
				}
				if (this.options.addButton) {
					buttonElements.append($(this.getButtonHtml("add")));
				}
				if (this.options.deleteButton) {
					buttonElements.append($(this.getButtonHtml("del")));
				}
				if (this.options.submitButton) {
					buttonElements.append($(this.getButtonHtml("sub")));
				}
			},

			buildSortTable : function () {
				var that = this;
				$(this.ulElement).sortable({
					placeholder : "ui-state-highlight",
					axis : "y",
					cursor : "s-resize",
					opacity : 0.8,
					stop : function (event, ui) {
						that.recordNewOrder();
						that.reflreshData();
						ui.item.removeAttr("style");
					}
				});
				$(this.ulElement).disableSelection();
			},

			/**
			/* record new order in list and update the data source
			 */
			recordNewOrder : function () {
				var newRecordOrders = [];
				var that = this;
				$.each($(this.ulElement).find("li .hid_sortable_id"), function (index, v) {
					$.each(that.options.sortJsonData, function (i, value) {
						if ($(v).val() == value.id) {
							newRecordOrders.push(value);
						}
					});
				});
				this.options.sortJsonData = newRecordOrders;
			},

			/**
			/* refresh data, refill data, and refresh display
			 */
			reflreshData : function () {
				this.activedData = [];
				this.inactivedData = [];
				var newAddedItems = [];
				var tempElement = $(this.ulElement);
				var activedDataTemp = this.activedData;
				var inactivedDataTemp = this.inactivedData;
				$.each(this.options.sortJsonData, function (index, v) {
					var valueStr = $.trim(v.value);
					var idStr = $.trim(v.id);
					var flag = v.isActiveFlag;
					var jqObj = $("#li_sortable_item_" + idStr);
					if (jqObj.length == 0) {
						var newItem = $("<li class=\"ui-state-default\" id=\"li_sortable_item_" + idStr + "\">" +
								"<input type=\"checkbox\" class=\"li_sortable_checkbox hide\" id=\"li_sortable_checkbox_" + idStr + "\"/>" +
								"<input type=\"hidden\" class=\"hid_sortable_id\" id=\"hid_sortable_id_" + idStr + "\" value=\"" + idStr + "\"/>" +
								"<input type=\"text\" class=\"hid_sortable_value hide\" id=\"hid_sortable_value_" + idStr + "\" value=\"" + valueStr + "\"/>" +
								"<span class=\"sortable_read_only_text\">" + valueStr + "</span>" +
								"</li>");
						tempElement.append(newItem);
						newAddedItems.push(newItem);
					}
					if (flag) {
						activedDataTemp.push($("#li_sortable_item_" + idStr));
						jqObj.removeClass("ui-state-disabled");
					} else {
						inactivedDataTemp.push($("#li_sortable_item_" + idStr));
						jqObj.addClass("ui-state-disabled");
					}
				});
				this.reflreshItemsDisplay();
				return newAddedItems;
			},

			returnModelData : function (sortElementId) {
				return {
					sortJsonData : this.options.sortJsonData,
					activedData : this.activedData,
					inactivedData : this.inactivedData
				};
			},

			reflreshItemsDisplay : function () {
				//enable these Items.
				$(this.ulElement).sortable("option", "items", "li:not(.ui-state-disabled)");
				//disable these Items
				$(this.ulElement).sortable("option", "cancel", ".ui-state-disabled,input");
				$(this.ulElement).sortable("refresh");
			},

			/**
			 *Select a item in single select mode
			 */
			selectItemFuction : function (jqObj) {
				if (!this.isEditMode) {
					if (!this.isBatchJob) {
						this.selectedItem = jqObj;
						if (typeof this.selectedItem !== 'undefined' && this.selectedItem !== null) {
							//Delegate, this is invoked when user select one item in our list
							this.selectOneItemEnableButtonsDelegate();
							this.selectedItem.parent().find(".ui-state-active").removeClass("ui-state-active");
							this.selectedItem.addClass("ui-state-active");
						} else {
							//Delegate, this is invoked when table is nothing selected
							this.unselectItemDisableButtonsDelegate();
						}
					} else {
						this.selectedItem = null;
						$(this.ulElement).find(".ui-state-active").removeClass("ui-state-active");
					}
				}
			},
			/**
			 *Active or inactive a item
			 */
			activeInactiveFunction : function () {
				if (!this.isBatchJob) {
					if (typeof this.selectedItem !== 'undefined' && this.selectedItem !== null) {
						var foundRecord = this.findDataFromModel($.trim(this.selectedItem.find(".hid_sortable_id").val()));
						var activeFlag = foundRecord.isActiveFlag;
						if (activeFlag) {
							foundRecord.isActiveFlag = false;
						} else {
							foundRecord.isActiveFlag = true;
						}
					}
				} else {
					var allItems = this.getSelectItems();
					var checkedItems = allItems.checkedItems;
					var that = this;
					$.each(checkedItems, function (i, v) {
						var foundRecord = that.findDataFromModel($.trim(v.find(".hid_sortable_id").val()));
						var activeFlag = foundRecord.isActiveFlag;
						if (activeFlag) {
							foundRecord.isActiveFlag = false;
						} else {
							foundRecord.isActiveFlag = true;
						}
					});
				}
				this.reflreshData();
			},
			/**
			 *Get selected items base on check box before each records
			 */
			getSelectItems : function () {
				var checkboxes = $(this.element).find("li .li_sortable_checkbox");
				var checkedItems = [];
				var uncheckedItems = [];
				$.each(checkboxes, function (i, v) {
					if ($(v).prop("checked")) {
						checkedItems.push($(v).parent());
					} else {
						uncheckedItems.push($(v).parent());
					}
				});
				return {
					checkedItems : checkedItems,
					uncheckedItems : uncheckedItems
				};
			},
			/**
			 *Query data from sortModelData
			 */
			findDataFromModel : function (recordId) {
				var foundRecord = null;
				$.each(this.options.sortJsonData, function (i, v) {
					if (v.id == recordId) {
						foundRecord = v;
						return false;
					}
				});
				return foundRecord;
			},
			/**
			 *Edit Mode
			 */
			editFunction : function () {
				if (typeof this.selectedItem !== 'undefined' && this.selectedItem !== null) {
					this.isEditMode = true;
					this.changeEditModeButtonsStatus();
					var foundRecord = this.findDataFromModel($.trim(this.selectedItem.find(".hid_sortable_id").val()));
					this.selectedItem.find(".hid_sortable_value").val(foundRecord.value);
					this.selectedItem.find(".sortable_read_only_text").hide();
					this.selectedItem.find(".hid_sortable_value").removeClass("hide");
				}
			},

			changeEditModeButtonsStatus : function () {
				if (this.isEditMode) {
					//Delegate, this is invoked when user enter edit mode
					this.enterEditModeButtonsStatusDelegate();
				} else {
					//Delegate, this is invoked when user exit edit mode
					this.exitEditModeButtonsStatusDelegate();
				}

			},
			/**
			 *Save
			 */
			saveFunction : function () {
				this.isEditMode = false;
				this.changeEditModeButtonsStatus();
				if (typeof this.selectedItem !== 'undefined' && this.selectedItem !== null) {
					var valueStr = $.trim(this.selectedItem.find(".hid_sortable_value").val());
					this.selectedItem.find(".sortable_read_only_text").html(valueStr);
					var foundRecord = this.findDataFromModel($.trim(this.selectedItem.find(".hid_sortable_id").val()));
					foundRecord.value = valueStr;

					this.selectedItem.find(".sortable_read_only_text").show();
					this.selectedItem.find(".hid_sortable_value").addClass("hide");
				}
				this.reflreshData();
			},
			/**
			 *Cancel
			 */
			calcelFunction : function () {
				this.isEditMode = false;
				this.changeEditModeButtonsStatus();
				if (typeof this.selectedItem !== 'undefined' && this.selectedItem !== null) {
					var foundRecord = this.findDataFromModel($.trim(this.selectedItem.find(".hid_sortable_id").val()));
					this.selectedItem.find(".hid_sortable_value").val(foundRecord.value);
					this.selectedItem.find(".sortable_read_only_text").html(foundRecord.value);

					this.selectedItem.find(".sortable_read_only_text").show();
					this.selectedItem.find(".hid_sortable_value").addClass("hide");
				}
				this.reflreshData();
			},
			/**
			 *Delete data from sortModelData
			 */
			deleteDataFromModel : function (recordId) {
				var foundRecordIndex = -1;
				for (var i = 0; i < this.options.sortJsonData.length; i++) {
					if (this.options.sortJsonData[i].id == recordId) {
						foundRecordIndex = i;
						break;
					}
				}
				if (foundRecordIndex >= 0) {
					this.options.sortJsonData.splice(foundRecordIndex, 1);
				}
			},
			/**
			 *delete function
			 */
			deleteFunction : function () {
				if (!this.isBatchJob) {
					if (typeof this.selectedItem !== 'undefined' && this.selectedItem !== null) {
						var foundRecord = this.findDataFromModel($.trim(this.selectedItem.find(".hid_sortable_id").val()));
						this.deleteDataFromModel(foundRecord.id);
						this.selectedItem.remove();
						this.selectItemFuction(null);
					}
					this.reflreshData();
				} else {
					var allItems = this.getSelectItems();
					var checkedItems = allItems.checkedItems;
					var that = this;
					$.each(checkedItems, function (index, v) {
						var foundRecord = that.findDataFromModel($.trim(v.find(".hid_sortable_id").val()));
						that.deleteDataFromModel(foundRecord.id);
						v.remove();
					});
					this.selectNumber = 0;
					this.batchModeButtonStatus();
				}
			},
			batchModeButtonStatus : function () {
				if (this.isBatchJob) {
					//Delegate, this is invoked when user enter batch job mode
					this.enterBatchJobModeButtonStatusDelegate();
				} else {
					//Delegate, this is invoked when user exit batch job mode
					this.exitBatchJobModeButtonStatusDelegate();
				}
				if (this.selectNumber > 0) {
					//Delegate, this is invoked when user enter batch job mode and check some check boxes
					this.enableBatchButtonDelegate();
				} else {
					//Delegate, this is invoked when user enter batch job mode and select nothing
					this.disableBatchJobButtonDelegate();
				}
			},
			/**
			 * Add a new item to specified table
			 */
			addItemFunction : function () {
				var startIndex = this.options.startIndex;
				//mark sure startIndex is larger than the length of sortJsonData
				if(startIndex < this.options.sortJsonData.length){
					startIndex = this.options.sortJsonData.length;
				}
				var id = ++startIndex;
				this.options.sortJsonData.push(this.getOneItemJsonObj(id, false, "new value"));
				var newItems = this.reflreshData();
				this.selectItemFuction(newItems[0]);
				this.editFunction();
				this.options.startIndex = id;
			},
			/**
			 *Get a new json data
			 */
			getOneItemJsonObj : function (idStr, isActiveFlag, valueStr) {
				return {
					id : idStr,
					isActiveFlag : isActiveFlag,
					value : valueStr
				};
			},
			/*
			 *enter batch job mode
			 */
			batchJobFunction : function (sortElementId) {
				this.isBatchJob = true;
				this.batchModeButtonStatus();
				this.selectItemFuction(null);
				$(this.element).find("li .li_sortable_checkbox").show();

			},
			/**
			 *Exit batch job mode
			 */
			normalModeFunction : function (sortElementId) {
				this.isBatchJob = false;
				this.selectNumber = 0;
				this.batchModeButtonStatus();
				var checkboxes = $(this.element).find("li .li_sortable_checkbox");
				checkboxes.hide();
				$.each(checkboxes, function (i, v) {
					$(v).prop("checked", false);
				});
			}
		};

		//interal method
		var setDelegateMethod = function (tempArguments, method) {
			if (typeof tempArguments !== 'undefined' && tempArguments !== null) {
				if (tempArguments.length > 1) {
					tempArguments[1]['options'][method] = tempArguments[0];
				}
			}
		}

		var invokeMethod = function (tempArguments, method) {
			if (typeof tempArguments !== 'undefined' && tempArguments !== null) {
				if (tempArguments.length > 1) {
					return tempArguments[1][method].appy(tempArguments[1], tempArguments[0]);
				} else {
					return tempArguments[0][method].call(tempArguments[0]);
				}
			}
		}

		//plugin method
		var methods = {
			GetJsonData : function () {
				var tempArguments = arguments;
				return invokeMethod(tempArguments, "returnModelData");
			},
			SubmitCallback : function () {
				var tempArguments = arguments;
				setDelegateMethod(tempArguments, "submitCallBack");
			}
		};

		//Define plugin
		$.fn[pluginName] = function () {
			var tempArguments = arguments;
			var getJsonData = null;
			this.each(function () {
				if (!$.data(this, "plugin_" + pluginName)) {
					//init plugin
					$.data(this, "plugin_" + pluginName, new SortTable(this, tempArguments[0]));
				} else {
					var method = tempArguments[0];
					if (methods[method]) {
						method = methods[method];
						arguments = Array.prototype.slice.call(tempArguments, 1);
						arguments.push($.data(this, "plugin_" + pluginName));
						getJsonData = method.apply(this, arguments);
					} else if (typeof method === "object" || !method) {}
					else {
						$.error("Method" + method + "does not exist on jQuery.pluginName");
						return this;
					}
				}
			});

			if (typeof getJsonData !== 'undefined' && getJsonData !== null) {
				return getJsonData;
			}

			// chain jQuery functions
			return this;
		};
	}));
