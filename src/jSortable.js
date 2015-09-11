/**
 * jSortable v0.0.2
 * require jquery 1.7+
 * Mars Shen August 26, 2015,
 * MIT License
 * for more info pls visit: https://github.com/Mars-Shen/jSortable
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
	var pluginName = "jSortable",
		version = "v0.0.2",
		defaults = {
			//online mode necessary group
			onlineMode: false, //Add or delete function will process on sever side.
			saveURL: "", //save function ajax url, if onlineMode is true, this url must be not null.
			deleteURL: "", //delete function ajax url, if onlineMode is true, this url must be not null.
			activeURL: "", //active function ajax url, if onlineMode is true, this url must be not null.
			saveOrderURL: "", //Save order function ajax url, if onlineMode is true, this url must be not null.

			blockfunction: function() {}, //block page when ajax call
			unblockfunction: function() {}, //block page when ajax call

			valueNotNull: true, //Value like key or value can not be null.
			keyValueMode: true, //Make this plugin in key value mode or not.
			enableNewItem: true, //if this option is true, new item which you added will be enable. default is false.
			defaultNewItemKey: "NK", //default new item's key
			defaultNewItemText: "new value", //default new item's value
			sortJsonData: [], //table's data array, json based. [{index:,key:,isActiveFlag:,value:}].
			activeButton: true, //show active/inactive button or not, default is true.
			inlineActiveButton: false, //show inline active/inactive button or not, default is true.
			activeButtonText: "Active/Inactive", //text on active button.
			//batch job group
			batchMode: true, //show checkbox or not, default is true.
			//edit mode group
			editButton: true, //show edit button or not, default is true.
			editButtonText: "Edit", //text on edit button.
			saveButtonText: "Save", //text on save button.
			cancelButtonText: "Cancel", //text on cancel button.
			addButton: true, //show add item button or not, default is true.
			addButtonText: "Add", //text on add item button.
			deleteButton: true, //show delete button or not, default is true.
			inlineDeleteButton: false, //show inline delete button or not, default is true.
			deleteButtonText: "Delete", //text on delete button.
			saveOrderButton: true, //show submit button or not, default is true.
			saveOrderButtonText: "Save", //text on submit button.
			submitCallBack: function() {}, //submit button callback.
			deleteCallBack: function(selectItems) {
				return confirm("Do you want to delete this record(s)");
			}, //delete button callback. use to confirm delete action. argument is select item(s).
			buttonClass: "", // custom button class.
			descrptionText: "Descrption",
			codeText: "Code",
			operationText: "Operation",
			noText: "No.",
		};

	var SortTable = function(element, options) {
		this.element = element;
		this.elementId = $(element).attr("id");
		this.buttonElements = null; //button groups
		this.tableBodyElement = null; //table element
		this.sortableObj = null;
		this.startIndex = 0;
		this.options = $.extend({}, defaults, options); //this.options.sortJsonData is using to store source data
		this.activedData = [];
		this.inactivedData = [];
		this.newAddedItemsArr = [];
		this.deletedItemsArr = [];
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
			//destroy sortable object if it exit.
			if (typeof this.sortableObj !== 'undefined' && this.sortableObj !== null) {
				this.sortableObj.sortable("destroy");
				this.sortableObj = null;
			}
			//init sortable
			this.buildSortHTML();
			this.buildSortTable();
			this.refreshData();
			var that = this;

			//save order button clicked
			$(this.element).off("click", "#" + this.elementId + "_saveOrder").on("click", "#" + this.elementId + "_saveOrder", function(event) {
				if (!$(this).hasClass("btn-inactive")) {
					that.saveOrderFunction(event);
				}
			});
			//active or inactive selected item
			$(this.element).off("click", "." + this.elementId + "_acitveInactiveItem").on("click", "." + this.elementId + "_acitveInactiveItem", function(e) {
				if (!$(this).hasClass("btn-inactive")) {
					that.activeInactiveFunction(e, false);
				}
			});
			//active or inactive selected item
			$(this.element).off("click", "#" + this.elementId + "_acitveInactiveItems").on("click", "#" + this.elementId + "_acitveInactiveItems", function(e) {
				if (!$(this).hasClass("btn-inactive")) {
					that.activeInactiveFunction(e, true);
				}
			});
			//edit item
			$(this.element).off("click", "." + this.elementId + "_editItem").on("click", "." + this.elementId + "_editItem", function(e, v) {
				that.editFunction(e, v);
			});
			//save item
			$(this.element).off("click", "." + this.elementId + "_saveItem").on("click", "." + this.elementId + "_saveItem", function(e, v) {
				that.saveFunction(e, v);
			});
			//Delete item
			$(this.element).off("click", "." + this.elementId + "_deleteItem").on("click", "." + this.elementId + "_deleteItem", function(e, v) {
				if (!$(this).hasClass("btn-inactive")) {
					that.deleteFunction(e, false);
				}
			});
			//Delete items
			$(this.element).off("click", "#" + this.elementId + "_deleteItems").on("click", "#" + this.elementId + "_deleteItems", function(e, v) {
				if (!$(this).hasClass("btn-inactive")) {
					that.deleteFunction(e, true);
				}
			});
			//Cancel item
			$(this.element).off("click", "." + this.elementId + "_cancelItem").on("click", "." + this.elementId + "_cancelItem", function(e, v) {
				that.cancelFunction(e, v);
			});
			//Add Item
			$(this.element).off("click", "#" + this.elementId + "_addItem").on("click", "#" + this.elementId + "_addItem", function() {
				if (!$(this).hasClass("btn-inactive")) {
					that.addItemFunction();
				}
			});
			//bind checkbox click event
			$(this.element).off("click", "input[type='checkbox']").on("click", "input[type='checkbox']", function() {
				var checkboxes = $(that.element).find("tr .td_sortable_checkbox");
				var checkAllButton = $(that.element).find(".checkAll");
				if ($(this).hasClass("checkAll")) {
					$.each(checkboxes, function() {
						if (checkAllButton.prop("checked")) {
							$(this).prop("checked", true);
						} else {
							$(this).prop("checked", false);
						}
					});
					if ($(this).prop("checked")) {
						that.selectNumber = checkboxes.length;
					} else {
						that.selectNumber = 0;
					}
				} else {
					if ($(this).prop("checked")) {
						that.selectNumber++;
						if (checkboxes.length == that.selectNumber) {
							checkAllButton.prop("checked", true);
						}
					} else {
						that.selectNumber--;
						if (checkAllButton.prop("checked")) {
							checkAllButton.prop("checked", false);
						}
					}
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
			//add button ul elements
			var buttonElements = $("<ul id=\"ul_" + this.elementId + "\"></ul>");
			buttonElements.addClass("action-menu");
			buttonElements.addClass("sortable_button_group_default");
			this.buttonElements = buttonElements;
			element.append(buttonElements);
			//add buttons into ul element
			if (this.options.activeButton && this.options.batchMode) {
				buttonElements.append($(this.getButtonHtml("acts")));
			}
			if (this.options.addButton) {
				buttonElements.append($(this.getButtonHtml("add")));
			}
			if (this.options.deleteButton && this.options.batchMode) {
				buttonElements.append($(this.getButtonHtml("dels")));
			}
			if (this.options.saveOrderButton) {
				buttonElements.append($(this.getButtonHtml("sub")));
			}
			var table = $('<table class="table responsivetable sortable_div_container" id="table_' + this.elementId + '"></table>');
			var thead = $('<thead id="table_head_' + this.elementId + '" class="sortable_Thead_Style"></thead>');
			var theadTr = $('<tr class="sortable_Thead_Tr_Style"></tr>');
			thead.append(theadTr);
			table.append(thead);
			if (this.options.batchMode) {
				var checkAllBox = $('<th class="sortable_CheckBox_Style"><div><input type="checkbox" class="checkAll" id="check_all_' + this.elementId + '"/></div></th>');
				theadTr.append(checkAllBox);
			}
			var codeDescHead = "";
			if (this.options.keyValueMode) {
				codeDescHead = '<th class="sortable_Code_Style">' + this.options.codeText + '</th><th class="sortable_Descrption_Style">' + this.options.descrptionText + '</th>';
			} else {
				codeDescHead = '<th class="sortable_Descrption_only_Style">' + this.options.descrptionText + '</th>';
			}
			var otherHead = $('<th class="sortable_CheckBox_Style">' + this.options.noText + '</th>' + codeDescHead + '<th class="sortable_Operation_Style">' + this.options.operationText + '</th>');
			theadTr.append(otherHead);
			var tbody = $('<tbody id="table_body_' + this.elementId + '"  class="sortable_Tbody_Style"></tbody>');
			table.append(tbody);
			this.tableBodyElement = tbody;
			element.append(table);
			this.prepareModelData();
		},
		/*
		 *init jquery ui sortable
		 */
		buildSortTable: function() {
			var that = this;
			var argOptions = {
				axis: "y",
				cursor: "s-resize",
				opacity: 0.8,
				stop: function(event, ui) {
					that.recordNewOrder();
					that.refreshData();
					ui.item.removeAttr("style");
					that.recordChanged();
				}
			};
			this.sortableObj = $(this.tableBodyElement).sortable(argOptions);
		},
		/**
		/* record new order in list and update the data source
		 */
		recordNewOrder: function() {
			var newRecordOrders = [];
			var that = this;
			var indexNo = 1;
			$.each($(this.element).find("tr .hid_sortable_id"), function(index, v) {
				$.each(that.options.sortJsonData, function(i, value) {
					if ($(v).val() == value.id) {
						value.index = indexNo++;
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
			var tempElement = $(this.tableBodyElement);
			var activedDataTemp = this.activedData;
			var inactivedDataTemp = this.inactivedData;
			var that = this;
			$.each(this.options.sortJsonData, function(index, v) {
				var valueStr = $.trim(v.value);
				var keyStr = $.trim(v.key);
				var idStr = $.trim(v.id);
				var flag = v.isActiveFlag;
				var vIndex = $.trim(v.index);
				var jqObj = $(that.element).find("#tr_sortable_item_" + that.elementId + "_" + idStr);
				if (jqObj.length == 0) {
					var codeDescTD = "";
					if (that.options.keyValueMode) {
						codeDescTD = "<td class=\"sortable_Code_Style\" title=\"" + keyStr + "\"><span class=\"sortable_read_only_key\">" + keyStr + "</span>" +
							"<input type=\"text\" class=\"hid_sortable_key sortable_text_key hide\" id=\"hid_sortable_key_" + idStr + "\" value=\"" + keyStr + "\" />" +
							"</td>" +
							"<td class=\"sortable_Descrption_Style\" title=\"" + valueStr + "\"><span class=\"sortable_read_only_text\">" + valueStr + "</span>" + "<input type=\"text\" class=\"hid_sortable_value sortable_text_value hide\" id=\"hid_sortable_value_" + idStr + "\" value=\"" + valueStr + "\"/></td>";
					} else {
						codeDescTD = "<td class=\"sortable_Descrption_only_Style\" title=\"" + valueStr + "\"><span class=\"sortable_read_only_text\">" + valueStr + "</span>" + "<input type=\"text\" class=\"hid_sortable_value sortable_text_value hide\" id=\"hid_sortable_value_" + idStr + "\" value=\"" + valueStr + "\"/></td>";
					}
					var editButtonHtml = "",
						saveButtonHtml = "",
						cancelButtonHtml = "",
						deleteButtonHtml = "",
						activeButtonHtml = "";
					var checkboxHtml = "";
					if (that.options.editButton) {
						editButtonHtml = that.getButtonHtml("edi");
						saveButtonHtml = that.getButtonHtml("sav");
						cancelButtonHtml = that.getButtonHtml("can");
					}
					if (that.options.deleteButton && that.options.inlineDeleteButton) {
						deleteButtonHtml = that.getButtonHtml("del");
					}
					if (that.options.activeButton && that.options.inlineActiveButton) {
						activeButtonHtml = that.getButtonHtml("act");
					}
					if (that.options.batchMode) {
						checkboxHtml = "<td class=\"sortable_CheckBox_Style\"><input type=\"checkbox\" class=\"td_sortable_checkbox\" id=\"td_sortable_checkbox_" + idStr + "\"/></td>";
					}

					var newItem = $("<tr class=\"ui-state-default sortable_Tbody_Tr_Style\" id=\"tr_sortable_item_" + that.elementId + "_" + idStr + "\">" +
						checkboxHtml +
						"<td class=\"sortable_index sortable_CheckBox_Style\">" + vIndex + "</td>" +
						codeDescTD +
						"<td class=\"sortable_Operation_Style\">" +
						editButtonHtml + saveButtonHtml + cancelButtonHtml + deleteButtonHtml + activeButtonHtml +
						"<input type=\"hidden\" class=\"hid_sortable_id\" id=\"hid_sortable_id_" + idStr + "\" value=\"" + idStr + "\"/></td>" +
						"</tr>");
					tempElement.append(newItem);
					newAddedItems.push(newItem);
					jqObj = $(that.element).find("#tr_sortable_item_" + that.elementId + "_" + idStr);
				}
				if (that.options.keyValueMode) {
					//make sure key is up to data
					var itemKeyObj = jqObj.find(".hid_sortable_key");
					if (keyStr != itemKeyObj.val()) {
						itemKeyObj.val(keyStr);
					}
					var itemCodeObj = jqObj.find(".sortable_read_only_key");
					itemCodeObj.html(keyStr);
					itemCodeObj.parents("td").attr("title", keyStr);
				}

				//make sure value is up to data
				var itemValueObj = jqObj.find(".hid_sortable_value");
				if (valueStr != itemValueObj.val()) {
					itemValueObj.val(valueStr);
				}
				var itemTextObj = jqObj.find(".sortable_read_only_text");
				itemTextObj.html(valueStr);
				itemTextObj.parents("td").attr("title", valueStr);

				//make sure index is up to data
				var itemIndex = jqObj.find(".sortable_index");
				if (vIndex != itemIndex.html()) {
					itemIndex.html(vIndex);
				}

				//mark item depend on flag
				if (flag) {
					activedDataTemp.push($("#tr_sortable_item_" + that.elementId + "_" + idStr));
					jqObj.removeClass("ui-state-disabled");
				} else {
					inactivedDataTemp.push($("#tr_sortable_item_" + that.elementId + "_" + idStr));
					jqObj.addClass("ui-state-disabled");
				}
				//mark item as a processed item
				jqObj.addClass("sortable-processed");
			});
			//delete out of data record
			$(this.tableBodyElement).find("tr").remove(":not(.sortable-processed)");
			$(this.tableBodyElement).find("tr").removeClass("sortable-processed");
			this.refreshItemsDisplay();
			return newAddedItems;
		},
		/**
		 *get or set model data
		 */
		getOrSetModelData: function(newOptions) {
			if (typeof newOptions !== 'undefined' && newOptions !== null) {
				//TODO add validation to argument
				this.options = $.extend({}, this.options, newOptions); //this.options.sortJsonData is using to store source data
				this.init();
			} else {
				//deepcopy for this data.
				var returnObj = JSON.parse(JSON.stringify({
					sortJsonData: this.options.sortJsonData,
					activedData: this.activedData,
					inactivedData: this.inactivedData,
					newAddedItems: this.newAddedItemsArr,
					deletedItems: this.deletedItemsArr
				}));
				this.newAddedItemsArr = [];
				this.deletedItemsArr = [];
				return returnObj;
			}
		},
		/**
		 *Active or inactive a item
		 */
		activeInactiveFunction: function(e, isBatch) {
			var that = this;
			if (!isBatch) {
				var selectedItem = $(e.target).parents("tr");
				if (typeof selectedItem !== 'undefined' && selectedItem !== null) {
					var foundRecord = this.findDataFromModel($.trim(selectedItem.find(".hid_sortable_id").val()));
					if (this.options.onlineMode && this.options.activeURL != "") {
						this.options.blockfunction();
						var rec = [];
						rec[0] = JSON.stringify(foundRecord);
						$.ajax({
							type: 'POST',
							dataType: 'json',
							data: {
								"activeInactiveRecord": rec
							},
							url: that.options.activeURL,
							complete: function() {
								that.options.unblockfunction();
							},
							success: function(data) {
								if (data.status == 'success') {
									var activeFlag = foundRecord.isActiveFlag;
									if (activeFlag) {
										foundRecord.isActiveFlag = false;
									} else {
										foundRecord.isActiveFlag = true;
									}
								} else {
									if (data.message) {
										alert(data.message);
									}
								}
								that.refreshData();
							}
						});
					} else {
						var activeFlag = foundRecord.isActiveFlag;
						if (activeFlag) {
							foundRecord.isActiveFlag = false;
						} else {
							foundRecord.isActiveFlag = true;
						}
						this.refreshData();
					}
				}
			} else {
				var allItems = this.getSelectItems();
				var checkedItems = allItems.checkedItems;
				var activeItems = [];
				var activeItemsJsons = [];
				$.each(checkedItems, function(i, v) {
					var foundRecord = that.findDataFromModel($.trim(v.find(".hid_sortable_id").val()));
					activeItems.push(foundRecord);
					activeItemsJsons[i] = JSON.stringify(foundRecord);
					if (!that.options.onlineMode || that.options.activeURL == "") {
						var activeFlag = foundRecord.isActiveFlag;
						if (activeFlag) {
							foundRecord.isActiveFlag = false;
						} else {
							foundRecord.isActiveFlag = true;
						}
					}
				});
				if (this.options.onlineMode && this.options.activeURL != "") {
					this.options.blockfunction();
					$.ajax({
						type: 'POST',
						dataType: 'json',
						data: {
							"activeInactiveRecord": activeItemsJsons
						},
						url: that.options.activeURL,
						complete: function() {
							that.options.unblockfunction();
						},
						success: function(data) {
							if (data.status == 'success') {
								$.each(activeItems, function(ind, value) {
									var activeFlag = value.isActiveFlag;
									if (activeFlag) {
										value.isActiveFlag = false;
									} else {
										value.isActiveFlag = true;
									}
								});
								that.refreshData();
							} else {
								if (data.message) {
									alert(data.message);
								}
							}
						}
					});
				} else {
					this.refreshData();
				}
			}
		},
		/**
		 *Get selected items base on check box before each records
		 */
		getSelectItems: function() {
			var checkboxes = $(this.element).find("tr .td_sortable_checkbox");
			var checkedItems = [];
			var uncheckedItems = [];
			$.each(checkboxes, function(i, v) {
				if ($(v).prop("checked")) {
					checkedItems.push($(v).parents("tr"));
				} else {
					uncheckedItems.push($(v).parents("tr"));
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
		editFunction: function(e, v) {
			this.isEditMode = true;
			this.changeEditModeButtonsStatus(e);
			var selectedItem = null;
			if (!$(e).is("tr")) {
				selectedItem = $(e.target).parents("tr");
			} else {
				selectedItem = $(e);
			}
			var valueObj = selectedItem.find(".hid_sortable_value");
			var keyObj = selectedItem.find(".hid_sortable_key");
			keyObj.parents("td").removeClass("has-error");
			valueObj.parents("td").removeClass("has-error");
			var foundRecord = this.findDataFromModel($.trim(selectedItem.find(".hid_sortable_id").val()));
			valueObj.val(foundRecord.value);
			selectedItem.find(".sortable_read_only_text").hide();
			valueObj.show().removeClass("hide");
			if (this.options.keyValueMode) {
				keyObj.val(foundRecord.key);
				selectedItem.find(".sortable_read_only_key").hide();
				keyObj.show().removeClass("hide");
			}
		},
		/**
		 *Save Order function
		 */
		saveOrderFunction: function(e, v) {
			var that = this;
			if (this.options.onlineMode && this.options.saveOrderURL != "") {
				var saveOrderJson = [];
				$.each(that.options.sortJsonData, function(i, v) {
					saveOrderJson[i] = JSON.stringify(v);
				});
				that.options.blockfunction();
				$.ajax({
					type: 'POST',
					dataType: 'json',
					data: {
						"saveOrder": saveOrderJson
					},
					url: that.options.saveOrderURL,
					complete: function() {
						that.options.unblockfunction();
					},
					success: function(data) {
						if (data.status == 'success') {
							alert("Save success!");
							that.recordOrderClear();
							that.options.submitCallBack(e);
						} else {
							if (data.message) {
								alert(data.message);
							}
						}
					}
				});
			} else {
				if (typeof that.options.submitCallBack == "function") {
					that.recordOrderClear();
					that.options.submitCallBack(e);
				} else {
					$.error("SubmitCallBack " + that.options.submitCallBack + " is not a function!");
				}
			}
		},
		/**
		 *Save
		 */
		saveFunction: function(e, v) {
			var selectedItem = $(e.target).parents("tr");
			if (typeof selectedItem !== 'undefined' && selectedItem !== null) {
				var valueObj = selectedItem.find(".hid_sortable_value");
				var keyObj = null;
				var valueStr = $.trim(valueObj.val());
				var keyStr = null;
				var notNull = true;
				if (this.options.valueNotNull) {
					valueObj.parents("td").removeClass("has-error");
					if (this.options.keyValueMode) {
						keyObj = selectedItem.find(".hid_sortable_key");
						keyObj.parents("td").removeClass("has-error");
						keyStr = $.trim(keyObj.val());
						if (keyStr == "") {
							keyObj.parents("td").addClass("has-error");
							notNull = false;
						}
						if (valueStr == "") {
							valueObj.parents("td").addClass("has-error");
							notNull = false;
						}
					} else {
						if (valueStr == "") {
							valueObj.parents("td").addClass("has-error");
							notNull = false;
						}
					}
					if (!notNull) {
						return false;
					}
				}

				var foundRecord = this.findDataFromModel($.trim(selectedItem.find(".hid_sortable_id").val()));
				if (this.options.onlineMode && this.options.saveURL != "") {
					var tempKey = foundRecord.key;
					var tempValue = foundRecord.value;
					foundRecord.value = valueStr;
					if (this.options.keyValueMode) {
						foundRecord.key = keyStr;
					}
					var that = this;
					this.options.blockfunction();
					$.ajax({
						type: 'POST',
						dataType: 'json',
						data: {
							"saveRecord": JSON.stringify(foundRecord)
						},
						url: that.options.saveURL,
						complete: function() {
							that.options.unblockfunction();
						},
						success: function(data) {
							if (data.status == 'success') {
								valueObj.val(foundRecord.value);
								selectedItem.find(".sortable_read_only_text").show().removeClass("hide");
								valueObj.hide().addClass("hide");
								if (that.options.keyValueMode) {
									keyObj.val(foundRecord.key);
									selectedItem.find(".sortable_read_only_key").show().removeClass("hide");
									keyObj.hide().addClass("hide");
								}
								that.isEditMode = false;
								that.changeEditModeButtonsStatus(e);
								that.refreshData();
								if (foundRecord.newAddedFlag) {
									if (data.data.primaryKey) {
										foundRecord["primaryKey"] = data.data.primaryKey;
									}
									that.newAddedItemsArr.push(foundRecord);
									delete foundRecord["newAddedFlag"];
								}
								alert("Update sucessful!");
							} else {
								foundRecord.value = tempValue;
								foundRecord.key = tempKey;
								if (data.message) {
									alert(data.message);
								}
							}
						}
					});
				} else {
					this.isEditMode = false;
					this.changeEditModeButtonsStatus(e);
					foundRecord.value = valueStr;
					if (this.options.keyValueMode) {
						foundRecord.key = keyStr;
					}
					valueObj.val(foundRecord.value);
					selectedItem.find(".sortable_read_only_text").show().removeClass("hide");
					valueObj.hide().addClass("hide");
					if (this.options.keyValueMode) {
						keyObj.val(foundRecord.key);
						selectedItem.find(".sortable_read_only_key").show().removeClass("hide");
						keyObj.hide().addClass("hide");
					}
					this.refreshData();
					if (foundRecord.newAddedFlag) {
						this.newAddedItemsArr.push(foundRecord);
						delete foundRecord["newAddedFlag"];
					}
				}
			}
		},
		/**
		 *Cancel
		 */
		cancelFunction: function(e, v) {
			this.isEditMode = false;
			this.changeEditModeButtonsStatus(e);
			var selectedItem = null;
			if (!$(e).is("tr")) {
				selectedItem = $(e.target).parents("tr");
			} else {
				selectedItem = $(e);
			}
			if (typeof selectedItem !== 'undefined' && selectedItem !== null) {
				var foundRecord = this.findDataFromModel($.trim(selectedItem.find(".hid_sortable_id").val()));
				if (foundRecord.newAddedFlag) {
					this.deleteDataFromModel(foundRecord.id);
					selectedItem.remove();
				} else {
					selectedItem.find(".hid_sortable_value").val(foundRecord.value);
					selectedItem.find(".sortable_read_only_text").show().removeClass("hide");
					selectedItem.find(".hid_sortable_value").hide().addClass("hide");
					if (this.options.keyValueMode) {
						selectedItem.find(".hid_sortable_key").val(foundRecord.key);
						selectedItem.find(".sortable_read_only_key").show().removeClass("hide");
						selectedItem.find(".hid_sortable_key").hide().addClass("hide");
					}
				}
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
		saveOrderAfterDelete: function() {
			var that = this;
			if (this.options.onlineMode && this.options.saveOrderURL != "") {
				var saveOrderJson = [];
				$.each(that.options.sortJsonData, function(i, v) {
					saveOrderJson[i] = JSON.stringify(v);
				});
				$.ajax({
					type: 'POST',
					dataType: 'json',
					data: {
						"saveOrder": saveOrderJson
					},
					url: that.options.saveOrderURL,
					complete: function() {
						that.options.unblockfunction();
					},
					success: function(data) {
						if (data.status == 'success') {
							alert("Delete sucessful!");
						} else {
							if (data.message) {
								alert(data.message);
							}
						}
					}
				});
			}
		},
		/**
		 *delete function
		 */
		deleteFunction: function(e, isBatch) {
			var that = this;
			if (typeof this.options.deleteCallBack == "function") {
				if (this.options.deleteCallBack(this.selectedItem)) {
					if (!isBatch) {
						var selectedItem = $(e.target).parents("tr");
						if (typeof selectedItem !== 'undefined' && selectedItem !== null) {
							var foundRecord = this.findDataFromModel($.trim(selectedItem.find(".hid_sortable_id").val()));
							if (this.options.onlineMode && this.options.deleteURL != "") {
								this.options.blockfunction();
								var rec = [];
								rec[0] = JSON.stringify(foundRecord);
								$.ajax({
									type: 'POST',
									dataType: 'json',
									data: {
										"deleteRecord": rec
									},
									url: that.options.deleteURL,
									success: function(data) {
										if (data.status == 'success') {
											that.deleteDataFromModel(foundRecord.id);
											selectedItem.remove();
											var isNewAddedItem = false;
											$.each(that.newAddedItemsArr, function(i, v) {
												if (v.id == foundRecord.id) {
													that.newAddedItemsArr.splice(i, 1);
													isNewAddedItem = true;
													return false;
												}
											});
											if (!isNewAddedItem) {
												that.deletedItemsArr.push(foundRecord);
											}
											that.recordNewOrder();
											that.refreshData();
											selectedItem = null;
											that.saveOrderAfterDelete();
										} else {
											if (data.message) {
												alert(data.message);
											}
										}
									}
								});
							} else {
								this.deleteDataFromModel(foundRecord.id);
								selectedItem.remove();
								var isNewAddedItem = false;
								$.each(that.newAddedItemsArr, function(i, v) {
									if (v.id == foundRecord.id) {
										that.newAddedItemsArr.splice(i, 1);
										isNewAddedItem = true;
										return false;
									}
								});
								if (!isNewAddedItem) {
									this.deletedItemsArr.push(foundRecord);
								}
								that.recordNewOrder();
								this.refreshData();
								this.selectedItem = null;
							}
						}
					} else {
						var allItems = this.getSelectItems();
						var checkedItems = allItems.checkedItems;
						var deleteItems = [];
						var deleteItemsJsons = [];
						$.each(checkedItems, function(index, v) {
							var foundRecord = that.findDataFromModel($.trim(v.find(".hid_sortable_id").val()));
							deleteItems.push(foundRecord);
							deleteItemsJsons[index] = JSON.stringify(foundRecord);
							if (!that.options.onlineMode || that.options.deleteURL == "") {
								that.deleteDataFromModel(foundRecord.id);
								v.remove();
								var isNewAddedItem = false;
								$.each(that.newAddedItemsArr, function(i, v) {
									if (v.id == foundRecord.id) {
										that.newAddedItemsArr.splice(i, 1);
										isNewAddedItem = true;
										return false;
									}
								});
								if (!isNewAddedItem) {
									that.deletedItemsArr.push(foundRecord);
								}
							}
						});
						if (this.options.onlineMode && this.options.deleteURL != "") {
							this.options.blockfunction();
							$.ajax({
								type: 'POST',
								dataType: 'json',
								data: {
									"deleteRecord": deleteItemsJsons
								},
								url: that.options.deleteURL,
								success: function(data) {
									if (data.status == 'success') {
										$.each(deleteItems, function(ind, value) {
											that.deleteDataFromModel(value.id);
											$("#tr_sortable_item_" + that.elementId + "_" + value.id).remove();
											var isNewAddedItem = false;
											$.each(that.newAddedItemsArr, function(i, v) {
												if (v.id == value.id) {
													that.newAddedItemsArr.splice(i, 1);
													isNewAddedItem = true;
													return false;
												}
											});
											if (!isNewAddedItem) {
												that.deletedItemsArr.push(value);
											}
										});
										that.recordNewOrder();
										that.refreshData();
										that.saveOrderAfterDelete();
									} else {
										if (data.message) {
											alert(data.message);
										}
									}
								}
							});
						} else {
							that.recordNewOrder();
							that.refreshData();
						}
						this.selectNumber = 0;
						this.batchModeButtonStatus();
					}
				}
			} else {
				$.error("DeleteCallBack " + this.options.deleteCallBack + " is not a function!");
			}
		},
		/**
		 * Add a new item to specified table
		 */
		addItemFunction: function() {
			var startIndex = this.startIndex;
			//make sure startIndex is larger than the length of sortJsonData
			if (startIndex < this.options.sortJsonData.length) {
				startIndex = this.options.sortJsonData.length;
			}
			var id = ++startIndex;
			var addItemModel = this.getOneItemJsonObj(this.options.defaultNewItemKey, this.options.sortJsonData.length + 1, id, this.options.enableNewItem, this.options.defaultNewItemText, true);
			this.options.sortJsonData.push(addItemModel);
			var newItems = this.refreshData();
			this.editFunction(newItems[0]);
			this.startIndex = startIndex;
			$(this.tableBodyElement).animate({
				scrollTop: '800px'
			}, 300);
		},
		/**
		 *Get a new json data
		 */
		getOneItemJsonObj: function(keyStr, index, idStr, isActiveFlag, valueStr, newAddedFlag) {
			return {
				index: index,
				id: idStr,
				key: keyStr,
				isActiveFlag: isActiveFlag,
				value: valueStr,
				newAddedFlag: newAddedFlag
			};
		},
		//auxiliary function
		batchModeButtonStatus: function() {
			if (this.selectNumber > 0) {
				//Delegate, this is invoked when user enter batch job mode and check some check boxes
				this.enableBatchButtonDelegate();
			} else {
				//Delegate, this is invoked when user enter batch job mode and select nothing
				this.disableBatchJobButtonDelegate();
			}
		},
		changeEditModeButtonsStatus: function(trItem) {
			if (this.isEditMode) {
				//Delegate, this is invoked when user enter edit mode
				this.enterEditModeButtonsStatusDelegate(trItem);
			} else {
				//Delegate, this is invoked when user exit edit mode
				this.exitEditModeButtonsStatusDelegate(trItem);
			}

		},
		refreshItemsDisplay: function() {
			this.sortableObj.sortable("option", "items", "tr");
			this.sortableObj.sortable("refresh");
		},
		getButtonHtml: function(type) {
			var sHtml = "";
			var buttonClass = "sortable_button_default btn " + this.options.buttonClass;
			switch (type) {
				case "acts":
					sHtml = "<li><input type=\"button\" class=\"btn-inactive " + buttonClass + "\" id=\"" + this.elementId + "_acitveInactiveItems\" value=\"" + this.options.activeButtonText + "\"/></li>";
					break;
				case "act":
					sHtml = "<input type=\"button\" class=\"btn-primary " + this.elementId + "_acitveInactiveItem " + buttonClass + "\" value=\"" + this.options.activeButtonText + "\"/>";
					break;
				case "add":
					sHtml = "<li><input type=\"button\" class=\"btn-primary " + buttonClass + "\" id=\"" + this.elementId + "_addItem\" value=\"" + this.options.addButtonText + "\"/></li>";
					break;
				case "dels":
					sHtml = "<li><input type=\"button\" class=\"btn-inactive " + buttonClass + "\" id=\"" + this.elementId + "_deleteItems\" value=\"" + this.options.deleteButtonText + "\"/></li>";
					break;
				case "del":
					sHtml = "<input type=\"button\" class=\"btn-primary " + this.elementId + "_deleteItem " + buttonClass + "\" value=\"" + this.options.deleteButtonText + "\"/>";
					break;
				case "sub":
					sHtml = "<li><input type=\"button\" class=\"btn-inactive " + buttonClass + "\" id=\"" + this.elementId + "_saveOrder\" value=\"" + this.options.saveOrderButtonText + "\"/></li>";
					break;
				case "edi":
					sHtml = "<input type=\"button\" class=\"btn-primary " + this.elementId + "_editItem " + buttonClass + "\" value=\"" + this.options.editButtonText + "\"/>";
					break;
				case "sav":
					sHtml = "<input type=\"button\" class=\"btn-primary " + this.elementId + "_saveItem hide " + buttonClass + "\" value=\"" + this.options.saveButtonText + "\"/>";
					break;
				case "can":
					sHtml = "<input type=\"button\" class=\"btn-primary " + this.elementId + "_cancelItem hide " + buttonClass + "\" value=\"" + this.options.cancelButtonText + "\"/>";
					break;
				default:
					break;
			}
			return sHtml;
		},
		prepareModelData: function() {
			//add id to every records
			var count = 0;
			var index = 1;
			this.options.sortJsonData.sort(this.sortBy('index', false, parseInt));
			$.each(this.options.sortJsonData, function(i, value) {
				value.id = count++;
				value.index = index++;
			});
			this.startIndex = count;
		},
		enterEditModeButtonsStatusDelegate: function(trItem) {
			if ($(trItem).is("tr")) {
				$(trItem).find("." + this.elementId + "_saveItem").show().removeClass("hide");
				$(trItem).find("." + this.elementId + "_cancelItem").show().removeClass("hide");
				$(trItem).find("." + this.elementId + "_deleteItem").hide().addClass("hide");
				$(trItem).find("." + this.elementId + "_acitveInactiveItem").hide().addClass("hide");
				$(trItem).find("." + this.elementId + "_editItem").hide().addClass("hide");
			} else {
				$(trItem.target).parents("td").find("." + this.elementId + "_saveItem").show().removeClass("hide");
				$(trItem.target).parents("td").find("." + this.elementId + "_cancelItem").show().removeClass("hide");
				$(trItem.target).parents("td").find("." + this.elementId + "_deleteItem").hide().addClass("hide");
				$(trItem.target).parents("td").find("." + this.elementId + "_acitveInactiveItem").hide().addClass("hide");
				$(trItem.target).hide().addClass("hide");
			}
		}, //Delegate, this is invoked when user enter edit mode
		exitEditModeButtonsStatusDelegate: function(trItem) {
			$(trItem.target).parents("td").find("." + this.elementId + "_saveItem").hide().addClass("hide");
			$(trItem.target).parents("td").find("." + this.elementId + "_cancelItem").hide().addClass("hide");
			$(trItem.target).parents("td").find("." + this.elementId + "_editItem").show().removeClass("hide");
			$(trItem.target).parents("td").find("." + this.elementId + "_deleteItem").show().removeClass("hide");
			$(trItem.target).parents("td").find("." + this.elementId + "_acitveInactiveItem").show().removeClass("hide");
		}, //Delegate, this is invoked when user exit edit mode
		enableBatchButtonDelegate: function() {
			$("#" + this.elementId + "_acitveInactiveItems").removeClass("btn-inactive").addClass("btn-primary");
			$("#" + this.elementId + "_deleteItems").removeClass("btn-inactive").addClass("btn-primary");
		}, //Delegate, this is invoked when user enter batch job mode and check some check boxes
		disableBatchJobButtonDelegate: function() {
			$("#" + this.elementId + "_deleteItems").addClass("btn-inactive").removeClass("btn-primary");
			$("#" + this.elementId + "_acitveInactiveItems").addClass("btn-inactive").removeClass("btn-primary");
		}, //Delegate, this is invoked when user enter batch job mode and select nothing
		recordChanged: function() {
			$("#" + this.elementId + "_saveOrder").removeClass("btn-inactive").addClass("btn-primary");
		},
		recordOrderClear: function() {
			$("#" + this.elementId + "_saveOrder").addClass("btn-inactive").removeClass("btn-primary");
		},
		sortBy: function(filed, rev, primer) {
			rev = (rev) ? -1 : 1;
			return function(a, b) {
				a = a[filed];
				b = b[filed];
				if (typeof(primer) != 'undefined') {
					a = primer(a);
					b = primer(b);
				}
				if (a < b) {
					return rev * -1;
				}
				if (a > b) {
					return rev * 1;
				}
				return 1;
			};
		},
	};

	//interal method
	var setDelegateMethod = function(tempArguments, method) {
		if (typeof tempArguments !== 'undefined' && tempArguments !== null) {
			if (tempArguments.length > 1) {
				tempArguments[1]['options'][method] = tempArguments[0];
			}
		}
	};

	var invokeMethod = function(tempArguments, method) {
		if (typeof tempArguments !== 'undefined' && tempArguments !== null) {
			if (tempArguments.length > 1) {
				return tempArguments[1][method].call(tempArguments[1], tempArguments[0]);
			} else {
				return tempArguments[0][method].call(tempArguments[0]);
			}
		}
	};

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
		},
		DeleteCallBack: function() {
			var tempArguments = arguments;
			setDelegateMethod(tempArguments, "deleteCallBack");
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