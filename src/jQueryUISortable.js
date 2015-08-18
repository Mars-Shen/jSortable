/**
 * jQueryUISortable v0.0.1
 * require jquery 1.7+
 * Mars Shen August 5, 2015,
 * MIT License
 * for more info pls visit: https://github.com/Mars-Shen/jQueryUISortable
 */
;
(function(factory) {
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
}(function($) {
	// Create the defaults once
	var pluginName = "sorttable",
		version = "v0.0.1",
		defaults = {
			groupMode: true, //Group active and inactive items in two groups.
			keyValueMode: true, //Make this plugin in key value mode or not.
			enableNewItem: false, //if this option is true, new item which you added will be enable. default is false.
			defaultNewItemKey: "NK", //default new item's key
			defaultNewItemText: "new value", //default new item's value
			sortJsonData: [], //table's data array, json based. [{key:,isActiveFlag:,value}].
			activeButton: true, //show active/inactive button or not, default is true.
			activeButtonText: "Active/Inactive", //text on active button.
			//batch job group
			batchButton: true, //show batch mode/normal button or not, default is true.
			batchButtonText: "Batch Mode", //text on batch mode button.
			normalModeButtonText: "Normal Mode", //text on normal mode button.
			//edit mode group
			editButton: true, //show edit button or not, default is true.
			editButtonText: "Edit", //text on edit button.
			saveButtonText: "Save", //text on save button.
			cancelButtonText: "Cancel", //text on cancel button.

			addButton: true, //show add item button or not, default is true.
			addButtonText: "Add", //text on add item button.
			deleteButton: true, //show delete button or not, default is true.
			deleteButtonText: "Delete", //text on delete button.
			submitButton: true, //show submit button or not, default is true.
			submitButtonText: "Submit", //text on submit button.
			submitCallBack: function() {}, //submit button callback.
			buttonClass: "" // custom button class.
		};

	var SortTable = function(element, options) {
		this.element = element;
		this.elementId = $(element).attr("id");
		this.disableUlElement = null;
		this.ulElement = null;
		this.buttonElements = null;
		this.sortableObj = null;
		this.startIndex = 0;
		this.options = $.extend({}, defaults, options); //this.options.sortJsonData is using to store source data
		this.activedData = [];
		this.inactivedData = [];
		this.selectedItem = {};
		this.isBatchJob = false;
		this.isEditMode = false;
		this.selectNumber = 0;
		this._defaults = defaults;
		this._name = pluginName;
		this._version = version;
		this.init();
	};

	//method of jQueryUISortTableBeautifier
	SortTable.prototype = {

		init: function() {
			//init sortable
			this.buildSortHTML();
			this.buildSortTable();
			this.refreshData();
			var that = this;
			//select item
			$(this.element).on("click", "li", function() {
				that.selectItemFunction($(this));
			});
			//submit button clicked
			$(this.element).on("click", "#" + this.elementId + "_submit", function(event) {
				that.options.submitCallBack(event);
			});
			//active or inactive selected item
			$(this.element).on("click", "#" + this.elementId + "_acitveInactiveItem", function() {
				that.activeInactiveFunction();
			});
			//edit item
			$(this.element).on("click", "#" + this.elementId + "_editItem", function() {
				that.editFunction();
			});
			//save item
			$(this.element).on("click", "#" + this.elementId + "_saveItem", function() {
				that.saveFunction();
			});
			//Delete item
			$(this.element).on("click", "#" + this.elementId + "_deleteItem", function() {
				that.deleteFunction();
			});
			//Cancel item
			$(this.element).on("click", "#" + this.elementId + "_cancelItem", function() {
				that.cancelFunction();
			});
			//Batch Job
			$(this.element).on("click", "#" + this.elementId + "_batchJob", function() {
				that.batchJobFunction();
			});
			//Add Item
			$(this.element).on("click", "#" + this.elementId + "_addItem", function() {
				that.addItemFunction();
			});
			//normal mode
			$(this.element).on("click", "#" + this.elementId + "_normalMode", function() {
				that.normalModeFunction();
			});

			//bind checkbox click event
			$(this.element).on("click", "input[type='checkbox']", function() {
				if ($(this).prop("checked")) {
					that.selectNumber++;
				} else {
					that.selectNumber--;
				}
				that.batchModeButtonStatus();
			});
		},
		/*
		 *prepare to init jquery ui sortable 
		 */
		buildSortHTML: function() {
			var element = $(this.element);
			element.empty();
			element.addClass("sortable_div_container");
			//add ul element
			var divClass = "sortable_list_container";
			if (!this.options.groupMode) {
				divClass = "sortable_list_single_container";
			}
			var divElement = $("<div class=\"" + divClass + "\" id=\"div_" + this.elementId + "\"></div>");
			var ulElement = $("<ul id=\"ul_" + this.elementId + "\"></ul>");
			this.ulElement = ulElement;
			element.append(divElement);
			divElement.append(ulElement);
			ulElement.empty();
			ulElement.addClass("sortable_connectedSortable_" + this.elementId);
			if (this.options.groupMode) {
				ulElement.addClass("sortable_default");
				var disableUlElement = $("<ul id=\"ul_disable_" + this.elementId + "\"></ul>");
				this.disableUlElement = disableUlElement;
				disableUlElement.empty();
				disableUlElement.addClass("sortable_default");
				disableUlElement.addClass("sortable_connectedSortable_" + this.elementId);
				divElement.append(disableUlElement);
			} else {
				ulElement.addClass("sortable_single_default");
			}
			var activedDataTemp = this.activedData;
			var inactivedDataTemp = this.inactivedData;
			//add buttons group div element
			var buttonElements = $("<div id=\"buttons_" + this.elementId + "\">");
			this.buttonElements = buttonElements;
			buttonElements.addClass("sortable_button_group_default");
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
			this.prepareModelData();
		},
		/*
		 *init jquery ui sortable
		 */
		buildSortTable: function() {
			if (typeof this.sortableObj !== 'undefined' && this.sortableObj !== null) {
				// this.sortableObj.sortable( "destroy" );
				this.sortableObj = null;
			}
			var that = this;
			var argOptions = {
				placeholder: "ui-state-highlight",
				axis: "y",
				cursor: "s-resize",
				opacity: 0.8,
				stop: function(event, ui) {
					if (!that.options.groupMode) {
						that.recordNewOrder();
					}
					that.refreshData();
					ui.item.removeAttr("style");
				}
			}
			if (this.options.groupMode) {
				argOptions["connectWith"] = ".sortable_connectedSortable_" + this.elementId;
				this.sortableObj = $(".sortable_connectedSortable_" + this.elementId).sortable(argOptions);
			} else {
				this.sortableObj = $(this.ulElement).sortable(argOptions);
			}

			this.sortableObj.disableSelection();
		},

		/**
		/* record new order in list and update the data source
		 */
		recordNewOrder: function() {
			var newRecordOrders = [];
			var that = this;
			var index = 0;
			$.each($(this.element).find("li .hid_sortable_id"), function(index, v) {
				$.each(that.options.sortJsonData, function(i, value) {
					if ($(v).val() == value.id) {
						value.index = index++;
						newRecordOrders.push(value);
					}
				});
			});
			this.options.sortJsonData = newRecordOrders;
		},

		/**
		/* refresh data, refill data, and refresh display
		 */
		refreshData: function() {
			this.activedData = [];
			this.inactivedData = [];
			//log new added item
			var newAddedItems = [];
			var tempElement = $(this.ulElement);
			var activedDataTemp = this.activedData;
			var inactivedDataTemp = this.inactivedData;
			var that = this;
			$.each(this.options.sortJsonData, function(index, v) {
				var valueStr = $.trim(v.value);
				var keyStr = $.trim(v.key);
				var idStr = $.trim(v.id);
				var flag = v.isActiveFlag;
				var jqObj = $(that.element).find("#li_sortable_item_" + that.elementId + "_" + idStr);
				if (jqObj.length == 0) {
					var textString = that.getKeyValueString(keyStr, valueStr);
					var newItem = $("<li class=\"ui-state-default\" id=\"li_sortable_item_" + that.elementId + "_" + idStr + "\">" +
						"<input type=\"checkbox\" class=\"li_sortable_checkbox hide\" id=\"li_sortable_checkbox_" + idStr + "\"/>" +
						"<input type=\"hidden\" class=\"hid_sortable_id\" id=\"hid_sortable_id_" + idStr + "\" value=\"" + idStr + "\"/>" +
						"<span class=\"sortable_read_only_text\" title=\"" + textString + "\">" + textString + "</span>" +
						"<span class=\"sortable_edit_text hide\">" + that.getKeyValueString("<input type=\"text\" class=\"hid_sortable_key sortable_text_key\" id=\"hid_sortable_key_" + idStr + "\" value=\"" + keyStr + "\"/>", "<input type=\"text\" class=\"hid_sortable_value sortable_text_value\" id=\"hid_sortable_value_" + idStr + "\" value=\"" + valueStr + "\"/>") + "</span>" +
						"</li>");
					tempElement.append(newItem);
					newAddedItems.push(newItem);
					jqObj = $(that.element).find("#li_sortable_item_" + that.elementId + "_" + idStr);
				}
				//make sure value is up to data
				var itemValueObj = jqObj.find(".hid_sortable_value");
				var itemTextObj = jqObj.find(".sortable_read_only_text");
				if (valueStr != itemValueObj.val()) {
					itemValueObj.val(valueStr);
				}
				//make sure key is up to data
				var itemkeyObj = jqObj.find(".hid_sortable_key");
				if (keyStr != itemkeyObj.val()) {
					itemkeyObj.val(keyStr);
				}
				itemTextObj.html(that.getKeyValueString(keyStr, valueStr));
				//mark item depend on flag
				if (flag) {
					activedDataTemp.push($("#li_sortable_item_" + that.elementId + "_" + idStr));
					jqObj.removeClass("ui-state-disabled");
				} else {
					inactivedDataTemp.push($("#li_sortable_item_" + that.elementId + "_" + idStr));
					jqObj.addClass("ui-state-disabled");
				}
				//mark item as a processed item
				jqObj.addClass("sortable-processed");
			});
			//delete out of data record
			$(this.element).find("li").remove(":not(.sortable-processed)");
			$(this.element).find("li").removeClass("sortable-processed");
			this.refreshItemsDisplay();
			return newAddedItems;
		},
		/*
		 *get or set model data
		 */
		getOrSetModelData: function(newOptions) {
			if (typeof newOptions !== 'undefined' && newOptions !== null) {
				//TODO add validation to argument
				this.options = $.extend({}, this.options, newOptions); //this.options.sortJsonData is using to store source data
				this.init();
			} else {
				return {
					sortJsonData: this.options.sortJsonData,
					activedData: this.activedData,
					inactivedData: this.inactivedData
				};
			}
		},
		/**
		 *Select a item in single select mode
		 */
		selectItemFunction: function(jqObj) {
			if (!this.isEditMode) {
				if (!this.isBatchJob) {
					this.selectedItem = jqObj;
					if (typeof this.selectedItem !== 'undefined' && this.selectedItem !== null) {
						//Delegate, this is invoked when user select one item in our list
						this.selectOneItemEnableButtonsDelegate();
						$(this.element).find(".ui-state-active").removeClass("ui-state-active");
						this.selectedItem.addClass("ui-state-active");
					} else {
						//Delegate, this is invoked when table is nothing selected
						this.unselectItemDisableButtonsDelegate();
					}
				} else {
					this.selectedItem = null;
					$(this.element).find(".ui-state-active").removeClass("ui-state-active");
				}
			}
		},
		/**
		 *Active or inactive a item
		 */
		activeInactiveFunction: function() {
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
				$.each(checkedItems, function(i, v) {
					var foundRecord = that.findDataFromModel($.trim(v.find(".hid_sortable_id").val()));
					var activeFlag = foundRecord.isActiveFlag;
					if (activeFlag) {
						foundRecord.isActiveFlag = false;
					} else {
						foundRecord.isActiveFlag = true;
					}
				});
			}
			this.refreshData();
		},
		/**
		 *Get selected items base on check box before each records
		 */
		getSelectItems: function() {
			var checkboxes = $(this.element).find("li .li_sortable_checkbox");
			var checkedItems = [];
			var uncheckedItems = [];
			$.each(checkboxes, function(i, v) {
				if ($(v).prop("checked")) {
					checkedItems.push($(v).parent());
				} else {
					uncheckedItems.push($(v).parent());
				}
			});
			return {
				checkedItems: checkedItems,
				uncheckedItems: uncheckedItems
			};
		},
		/**
		 *Query data from sortModelData
		 */
		findDataFromModel: function(recordId) {
			var foundRecord = null;
			$.each(this.options.sortJsonData, function(i, v) {
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
		editFunction: function() {
			if (typeof this.selectedItem !== 'undefined' && this.selectedItem !== null) {
				this.isEditMode = true;
				this.changeEditModeButtonsStatus();
				var foundRecord = this.findDataFromModel($.trim(this.selectedItem.find(".hid_sortable_id").val()));
				this.selectedItem.find(".hid_sortable_value").val(foundRecord.value);
				this.selectedItem.find(".hid_sortable_key").val(foundRecord.key);
				this.selectedItem.find(".sortable_read_only_text").hide();
				this.selectedItem.find(".sortable_edit_text").removeClass("hide");
			}
		},
		/**
		 *Save
		 */
		saveFunction: function() {
			this.isEditMode = false;
			this.changeEditModeButtonsStatus();
			if (typeof this.selectedItem !== 'undefined' && this.selectedItem !== null) {
				var valueStr = $.trim(this.selectedItem.find(".hid_sortable_value").val());
				var keyStr = $.trim(this.selectedItem.find(".hid_sortable_key").val());
				var foundRecord = this.findDataFromModel($.trim(this.selectedItem.find(".hid_sortable_id").val()));
				foundRecord.value = valueStr;
				foundRecord.key = keyStr;

				this.selectedItem.find(".sortable_read_only_text").show();
				this.selectedItem.find(".sortable_edit_text").addClass("hide");
			}
			this.refreshData();
		},
		/**
		 *Cancel
		 */
		cancelFunction: function() {
			this.isEditMode = false;
			this.changeEditModeButtonsStatus();
			if (typeof this.selectedItem !== 'undefined' && this.selectedItem !== null) {
				var foundRecord = this.findDataFromModel($.trim(this.selectedItem.find(".hid_sortable_id").val()));
				this.selectedItem.find(".hid_sortable_value").val(foundRecord.value);
				this.selectedItem.find(".hid_sortable_key").val(foundRecord.key);

				this.selectedItem.find(".sortable_read_only_text").show();
				this.selectedItem.find(".sortable_edit_text").addClass("hide");
			}
			this.refreshData();
		},
		/**
		 *Delete data from sortModelData
		 */
		deleteDataFromModel: function(recordId) {
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
		deleteFunction: function() {
			if (!this.isBatchJob) {
				if (typeof this.selectedItem !== 'undefined' && this.selectedItem !== null) {
					var foundRecord = this.findDataFromModel($.trim(this.selectedItem.find(".hid_sortable_id").val()));
					this.deleteDataFromModel(foundRecord.id);
					this.selectedItem.remove();
					this.selectItemFunction(null);
				}
				this.refreshData();
			} else {
				var allItems = this.getSelectItems();
				var checkedItems = allItems.checkedItems;
				var that = this;
				$.each(checkedItems, function(index, v) {
					var foundRecord = that.findDataFromModel($.trim(v.find(".hid_sortable_id").val()));
					that.deleteDataFromModel(foundRecord.id);
					v.remove();
				});
				this.selectNumber = 0;
				this.batchModeButtonStatus();
			}
		},
		/**
		 * Add a new item to specified table
		 */
		addItemFunction: function() {
			var startIndex = this.startIndex;
			//mark sure startIndex is larger than the length of sortJsonData
			if (startIndex < this.options.sortJsonData.length) {
				startIndex = this.options.sortJsonData.length;
			}
			var id = startIndex++;
			this.options.sortJsonData.push(this.getOneItemJsonObj(this.options.defaultNewItemKey, id, this.options.enableNewItem, this.options.defaultNewItemText));
			var newItems = this.refreshData();
			this.selectItemFunction(newItems[0]);
			this.editFunction();
			this.startIndex = startIndex;
		},
		/**
		 *Get a new json data
		 */
		getOneItemJsonObj: function(keyStr, idStr, isActiveFlag, valueStr) {
			return {
				index: idStr,
				id: idStr,
				key: keyStr,
				isActiveFlag: isActiveFlag,
				value: valueStr
			};
		},
		/*
		 *enter batch job mode
		 */
		batchJobFunction: function(sortElementId) {
			this.isBatchJob = true;
			this.batchModeButtonStatus();
			this.selectItemFunction(null);
			$(this.element).find("li .li_sortable_checkbox").show();

		},
		/**
		 *Exit batch job mode
		 */
		normalModeFunction: function(sortElementId) {
			this.isBatchJob = false;
			this.selectNumber = 0;
			this.batchModeButtonStatus();
			var checkboxes = $(this.element).find("li .li_sortable_checkbox");
			checkboxes.hide();
			$.each(checkboxes, function(i, v) {
				$(v).prop("checked", false);
			});
		},
		//auxiliary function
		batchModeButtonStatus: function() {
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
		changeEditModeButtonsStatus: function() {
			if (this.isEditMode) {
				//Delegate, this is invoked when user enter edit mode
				this.enterEditModeButtonsStatusDelegate();
			} else {
				//Delegate, this is invoked when user exit edit mode
				this.exitEditModeButtonsStatusDelegate();
			}

		},
		refreshItemsDisplay: function() {
			if (this.options.groupMode) {
				var tempDisableItems = $(this.ulElement).find(".ui-state-disabled");
				$(this.ulElement).find("li").remove(".ui-state-disabled");
				$(this.disableUlElement).append(tempDisableItems);
				var tempEnableItems = $(this.disableUlElement).find("li:not(.ui-state-disabled)");
				$(this.disableUlElement).find("li").remove(":not(.ui-state-disabled)");
				$(this.ulElement).append(tempEnableItems);
				this.recordNewOrder();
			}
			//enable these Items.
			this.sortableObj.sortable("option", "items", "li:not(.ui-state-disabled)");
			//disable these Items
			this.sortableObj.sortable("option", "cancel", ".ui-state-disabled,input");
			this.sortableObj.sortable("refresh");
		},
		getButtonHtml: function(type) {
			var sHtml = "";
			var buttonClass = "ui-widget ui-button-text-only sortable_button_default ui-state-default" + this.options.buttonClass;
			switch (type) {
				case "act":
					sHtml = "<input type=\"button\" class=\"ui-state-disabled " + buttonClass + "\" id=\"" + this.elementId + "_acitveInactiveItem\" disabled=\"disabled\" value=\"" + this.options.activeButtonText + "\"/>";
					break;
				case "bat":
					sHtml = "<input type=\"button\" class=\"" + buttonClass + "\" id=\"" + this.elementId + "_batchJob\"  value=\"" + this.options.batchButtonText + "\"/>";
					break;
				case "nol":
					sHtml = "<input type=\"button\" id=\"" + this.elementId + "_normalMode\" class=\"hide " + buttonClass + "\" value=\"" + this.options.normalModeButtonText + "\"/>";
					break;
				case "edi":
					sHtml = "<input type=\"button\" class=\"ui-state-disabled " + buttonClass + "\" id=\"" + this.elementId + "_editItem\" disabled=\"disabled\" value=\"" + this.options.editButtonText + "\"/>";
					break;
				case "sav":
					sHtml = "<input type=\"button\" id=\"" + this.elementId + "_saveItem\" class=\"hide " + buttonClass + "\" value=\"" + this.options.saveButtonText + "\"/>";
					break;
				case "can":
					sHtml = "<input type=\"button\" id=\"" + this.elementId + "_cancelItem\" class=\"hide " + buttonClass + "\" value=\"" + this.options.cancelButtonText + "\"/>";
					break;
				case "add":
					sHtml = "<input type=\"button\" class=\"" + buttonClass + "\" id=\"" + this.elementId + "_addItem\" value=\"" + this.options.addButtonText + "\"/>";
					break;
				case "del":
					sHtml = "<input type=\"button\" class=\"ui-state-disabled " + buttonClass + "\" id=\"" + this.elementId + "_deleteItem\" disabled=\"disabled\" value=\"" + this.options.deleteButtonText + "\"/>";
					break;
				case "sub":
					sHtml = "<input type=\"button\" class=\"" + buttonClass + "\" id=\"" + this.elementId + "_submit\" value=\"" + this.options.submitButtonText + "\"/>";
					break;
				default:
					break;
			}
			return sHtml;
		},
		prepareModelData: function() {
			//add id to every records
			var count = 0;
			var index = 0;
			$.each(this.options.sortJsonData, function(index, value) {
				value.id = count++;
				value.index = index++;
			});
			this.startIndex = count;
		},
		selectOneItemEnableButtonsDelegate: function() {
			$("#" + this.elementId + "_editItem").removeAttr("disabled");
			$("#" + this.elementId + "_deleteItem").removeAttr("disabled");
			$("#" + this.elementId + "_acitveInactiveItem").removeAttr("disabled");
			$("#" + this.elementId + "_editItem").removeClass("ui-state-disabled");
			$("#" + this.elementId + "_deleteItem").removeClass("ui-state-disabled");
			$("#" + this.elementId + "_acitveInactiveItem").removeClass("ui-state-disabled");
		}, //Delegate, this is invoked when user select one item in our list
		unselectItemDisableButtonsDelegate: function() {
			$("#" + this.elementId + "_editItem").attr("disabled", "disabled");
			$("#" + this.elementId + "_deleteItem").attr("disabled", "disabled");
			$("#" + this.elementId + "_acitveInactiveItem").attr("disabled", "disabled");
			$("#" + this.elementId + "_editItem").addClass("ui-state-disabled");
			$("#" + this.elementId + "_deleteItem").addClass("ui-state-disabled");
			$("#" + this.elementId + "_acitveInactiveItem").addClass("ui-state-disabled");
		}, //Delegate, this is invoked when table is nothing selected
		enterEditModeButtonsStatusDelegate: function() {
			$("#" + this.elementId + "_saveItem").show();
			$("#" + this.elementId + "_cancelItem").show();
			$("#" + this.elementId + "_editItem").hide();
			$("#" + this.elementId + "_addItem").hide();
			$("#" + this.elementId + "_deleteItem").hide();
			$("#" + this.elementId + "_batchJob").hide();
		}, //Delegate, this is invoked when user enter edit mode
		exitEditModeButtonsStatusDelegate: function() {
			$("#" + this.elementId + "_saveItem").hide();
			$("#" + this.elementId + "_cancelItem").hide();
			$("#" + this.elementId + "_editItem").show();
			$("#" + this.elementId + "_addItem").show();
			$("#" + this.elementId + "_deleteItem").show();
			$("#" + this.elementId + "_batchJob").show();
		}, //Delegate, this is invoked when user exit edit mode
		enterBatchJobModeButtonStatusDelegate: function() {
			$("#" + this.elementId + "_batchJob").hide();
			$("#" + this.elementId + "_normalMode").show();
			$("#" + this.elementId + "_addItem").hide();
			$("#" + this.elementId + "_editItem").hide();
			$("#" + this.elementId + "_acitveInactiveItem").removeAttr("disabled");
			$("#" + this.elementId + "_deleteItem").removeAttr("disabled");
			$("#" + this.elementId + "_deleteItem").removeClass("ui-state-disabled");
			$("#" + this.elementId + "_acitveInactiveItem").removeClass("ui-state-disabled");
			$("#" + this.elementId + "_editItem").attr("disabled", "disabled");
			$("#" + this.elementId + "_editItem").addClass("ui-state-disabled");
		}, //Delegate, this is invoked when user enter batch job mode
		exitBatchJobModeButtonStatusDelegate: function() {
			$("#" + this.elementId + "_batchJob").show();
			$("#" + this.elementId + "_normalMode").hide();
			$("#" + this.elementId + "_editItem").show();
			$("#" + this.elementId + "_addItem").show();
			$("#" + this.elementId + "_acitveInactiveItem").attr("disabled", "disabled");
			$("#" + this.elementId + "_deleteItem").attr("disabled", "disabled");
			$("#" + this.elementId + "_deleteItem").addClass("ui-state-disabled");
			$("#" + this.elementId + "_acitveInactiveItem").addClass("ui-state-disabled");
		}, //Delegate, this is invoked when user exit batch job mode
		enableBatchButtonDelegate: function() {
			$("#" + this.elementId + "_acitveInactiveItem").removeAttr("disabled");
			$("#" + this.elementId + "_deleteItem").removeAttr("disabled");
			$("#" + this.elementId + "_deleteItem").removeClass("ui-state-disabled");
			$("#" + this.elementId + "_acitveInactiveItem").removeClass("ui-state-disabled");
		}, //Delegate, this is invoked when user enter batch job mode and check some check boxes
		disableBatchJobButtonDelegate: function() {
			$("#" + this.elementId + "_acitveInactiveItem").attr("disabled", "disabled");
			$("#" + this.elementId + "_deleteItem").attr("disabled", "disabled");
			$("#" + this.elementId + "_deleteItem").addClass("ui-state-disabled");
			$("#" + this.elementId + "_acitveInactiveItem").addClass("ui-state-disabled");
		}, //Delegate, this is invoked when user enter batch job mode and select nothing
		getKeyValueString: function(key, value) {
			if (this.options.keyValueMode) {
				return "Key: " + key + ", Value: " + value;
			} else {
				return value;
			}
		},
	};

	//interal method
	var setDelegateMethod = function(tempArguments, method) {
		if (typeof tempArguments !== 'undefined' && tempArguments !== null) {
			if (tempArguments.length > 1) {
				tempArguments[1]['options'][method] = tempArguments[0];
			}
		}
	}

	var invokeMethod = function(tempArguments, method) {
		if (typeof tempArguments !== 'undefined' && tempArguments !== null) {
			if (tempArguments.length > 1) {
				return tempArguments[1][method].call(tempArguments[1], tempArguments[0]);
			} else {
				return tempArguments[0][method].call(tempArguments[0]);
			}
		}
	}

	//plugin method
	var methods = {
		Destroy: function() {
			var cacheObj = $.data(this, "plugin_" + pluginName);
			if (cacheObj) {
				$(cacheObj.element).empty();
				$.removeData(this, "plugin_" + pluginName);
			}
		},
		ModelData: function() {
			var tempArguments = arguments;
			return invokeMethod(tempArguments, "getOrSetModelData");
		},
		SubmitCallback: function() {
			var tempArguments = arguments;
			setDelegateMethod(tempArguments, "submitCallBack");
		}
	};

	//Define plugin
	$.fn[pluginName] = function() {
		var tempArguments = arguments;
		var result = null;
		this.each(function() {
			if (!$.data(this, "plugin_" + pluginName)) {
				//init plugin
				$.data(this, "plugin_" + pluginName, new SortTable(this, tempArguments[0]));
			} else {
				var method = tempArguments[0];
				if (methods[method]) {
					method = methods[method];
					arguments = Array.prototype.slice.call(tempArguments, 1);
					arguments.push($.data(this, "plugin_" + pluginName));
					result = method.apply(this, arguments);
				} else if (typeof method === "object" || !method) {} else {
					$.error("Method" + method + "does not exist on jQuery." + pluginName);
					return this;
				}
			}
		});

		if (typeof result !== 'undefined' && result !== null) {
			return result;
		}

		// chain jQuery functions
		return this;
	};
}));