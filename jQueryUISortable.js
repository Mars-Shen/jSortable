/**
 * jQueryUISortable v0.0.1
 * require jquery 1.7+
 * Mars Shen August 5, 2015,
 * MIT License
 * for more info pls visit: https://github.com/Mars-Shen/jQueryUISortable
 */
;
(function ($, window, document, undefined) {

	// Create the defaults once
	var pluginName = "sorttable",
	defaults = {
		startIndex : 0, //start index is used when user add a new item, and we will use this start index as a part of element id.
		sortJsonData : []//table's data array, json based. [{id:,isActiveFlag:,value}],

	};

	var SortTable = function (element, options) {
		this.element = element;
		this.settings = $.extend({}, defaults, options); //this.settings.sortJsonData is using to store source data
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
		selectOneItemEnableButtonsDelegate : function () {}, //Delegate, this is invoked when user select one item in our list
		unselectItemDisableButtonsDelegate : function () {}, //Delegate, this is invoked when table is nothing selected
		enterEditModeButtonsStatusDelegate : function () {}, //Delegate, this is invoked when user enter edit mode
		exitEditModeButtonsStatusDelegate : function () {}, //Delegate, this is invoked when user exit edit mode
		enterBatchJobModeButtonStatusDelegate : function () {}, //Delegate, this is invoked when user enter batch job mode
		exitBatchJobModeButtonStatusDelegate : function () {}, //Delegate, this is invoked when user exit batch job mode
		enableBatchButtonDelegate : function () {}, //Delegate, this is invoked when user enter batch job mode and check some check boxes
		disableBatchJobButtonDelegate : function () {}, //Delegate, this is invoked when user enter batch job mode and select nothing

		init : function () {
			//init sortable
			this.buildSortHTML();
			this.buildSortTable();
			this.reflreshData();
			var that = this;
			//select item
			$(this.element).on("click", "li", function () {
				that.selectItemFuction($(this));
			});

			//bind checkbox click event
			$(this.element).on("click", "input[type='checkbox']", function () {
				if ($(this).prop("checked")) {
					that.selectNumber++;
				} else {
					that.selectNumber--;
				}
				that.batchModeButtonStatus();
			});
		},
		buildSortHTML : function () {
			var element = $(this.element);
			element.empty();
			var activedDataTemp = this.activedData;
			var inactivedDataTemp = this.inactivedData;
			$.each(this.settings.sortJsonData, function (i, v) {
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
				element.append(newItem);
			});
		},

		buildSortTable : function () {
			var that = this;
			$(this.element).sortable({
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
			$(this.element).disableSelection();
		},

		recordNewOrder : function () {
			var newRecordOrders = [];
			var that = this;
			$.each($(this.element).find("li .hid_sortable_id"), function (index, v) {
				$.each(that.settings.sortJsonData, function (i, value) {
					if ($(v).val() == value.id) {
						newRecordOrders.push(value);
					}
				});
			});
			this.settings.sortJsonData = newRecordOrders;
		},

		/**
		/* refresh data, refill data, and refresh display
		 */
		reflreshData : function () {
			this.activedData = [];
			this.inactivedData = [];
			var newAddedItems = [];
			var tempElement = $(this.element);
			var activedDataTemp = this.activedData;
			var inactivedDataTemp = this.inactivedData;
			$.each(this.settings.sortJsonData, function (index, v) {
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
				sortJsonData : this.settings.sortJsonData,
				activedData : this.activedData,
				inactivedData : this.inactivedData
			};
		},

		reflreshItemsDisplay : function () {
			//enable these Items.
			$(this.element).sortable("option", "items", "li:not(.ui-state-disabled)");
			//disable these Items
			$(this.element).sortable("option", "cancel", ".ui-state-disabled,input");
			$(this.element).sortable("refresh");
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
						this.selectOneItemEnableButtonsDelegate($(this.element));
						this.selectedItem.parent().find(".ui-state-active").removeClass("ui-state-active");
						this.selectedItem.addClass("ui-state-active");
					} else {
						//Delegate, this is invoked when table is nothing selected
						this.unselectItemDisableButtonsDelegate($(this.element));
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
			$.each(this.settings.sortJsonData, function (i, v) {
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
				this.enterEditModeButtonsStatusDelegate($(this.element));
			} else {
				//Delegate, this is invoked when user exit edit mode
				this.exitEditModeButtonsStatusDelegate($(this.element));
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
			for (var i = 0; i < this.settings.sortJsonData.length; i++) {
				if (this.settings.sortJsonData[i].id == recordId) {
					foundRecordIndex = i;
					break;
				}
			}
			if (foundRecordIndex >= 0) {
				this.settings.sortJsonData.splice(foundRecordIndex, 1);
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
				this.enterBatchJobModeButtonStatusDelegate($(this.element));
			} else {
				//Delegate, this is invoked when user exit batch job mode
				this.exitBatchJobModeButtonStatusDelegate($(this.element));
			}
			if (this.selectNumber > 0) {
				//Delegate, this is invoked when user enter batch job mode and check some check boxes
				this.enableBatchButtonDelegate($(this.element));
			} else {
				//Delegate, this is invoked when user enter batch job mode and select nothing
				this.disableBatchJobButtonDelegate($(this.element));
			}
		},
		/**
		 * Add a new item to specified table
		 */
		addItemFunction : function () {
			var startIndex = this.settings.startIndex;
			var id = ++startIndex;
			this.settings.sortJsonData.push(this.getOneItemJsonObj(id, false, "new value"));
			var newItems = this.reflreshData();
			this.selectItemFuction(newItems[0]);
			this.editFunction();
			this.settings.startIndex = id;
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
				tempArguments[1][method] = tempArguments[0];
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
		AcitveInactiveItems : function () {
			var tempArguments = arguments;
			invokeMethod(tempArguments, "activeInactiveFunction");
		},
		CancelEdit : function () {
			var tempArguments = arguments;
			invokeMethod(tempArguments, "calcelFunction");
		},
		SaveItem : function () {
			var tempArguments = arguments;
			invokeMethod(tempArguments, "saveFunction");
		},
		BatchMode : function () {
			var tempArguments = arguments;
			invokeMethod(tempArguments, "batchJobFunction");
		},
		NormalMode : function () {
			var tempArguments = arguments;
			invokeMethod(tempArguments, "normalModeFunction");
		},
		AddItem : function () {
			var tempArguments = arguments;
			invokeMethod(tempArguments, "addItemFunction");
		},

		DeleteItems : function () {
			var tempArguments = arguments;
			invokeMethod(tempArguments, "deleteFunction");
		},

		EditItem : function () {
			var tempArguments = arguments;
			invokeMethod(tempArguments, "editFunction");
		},

		GetJsonData : function () {
			var tempArguments = arguments;
			return invokeMethod(tempArguments, "returnModelData");
		},

		SetSelectOneItemEnableButtonsDelegate : function () {
			var tempArguments = arguments;
			setDelegateMethod(tempArguments, "selectOneItemEnableButtonsDelegate");
		},
		SetUnselectItemDisableButtonsDelegate : function () {
			var tempArguments = arguments;
			setDelegateMethod(tempArguments, "unselectItemDisableButtonsDelegate");
		},
		SetEnterEditModeButtonsStatusDelegate : function () {
			var tempArguments = arguments;
			setDelegateMethod(tempArguments, "enterEditModeButtonsStatusDelegate");
		},
		SetExitEditModeButtonsStatusDelegate : function () {
			var tempArguments = arguments;
			setDelegateMethod(tempArguments, "exitEditModeButtonsStatusDelegate");
		},
		SetEnterBatchJobModeButtonStatusDelegate : function () {
			var tempArguments = arguments;
			setDelegateMethod(tempArguments, "enterBatchJobModeButtonStatusDelegate");
		},
		SetExitBatchJobModeButtonStatusDelegate : function () {
			var tempArguments = arguments;
			setDelegateMethod(tempArguments, "exitBatchJobModeButtonStatusDelegate");
		},
		SetEnableBatchButtonDelegate : function () {
			var tempArguments = arguments;
			setDelegateMethod(tempArguments, "enableBatchButtonDelegate");
		},
		SetDisableBatchJobButtonDelegate : function () {
			var tempArguments = arguments;
			setDelegateMethod(tempArguments, "disableBatchJobButtonDelegate");
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

})(jQuery, window, document);
