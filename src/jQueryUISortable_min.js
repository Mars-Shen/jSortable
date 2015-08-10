<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Sortable Demo</title><link rel="stylesheet"href="../jquery-ui/jquery-ui.css"><script src="../jquery-ui/jquery-1.11.3.js"></script><script src="../jquery-ui/jquery-ui.js"></script><script src="../src/jQueryUISortable.js"></script><link rel="stylesheet"href="../src/jQueryUISortable.css"><style>body{font-family:"Trebuchet MS","Helvetica","Arial","Verdana","sans-serif";font-size:62.5%;}</style></head><body><ul id="sortable"></ul><input type="button"id="sortable_acitveInactiveItem"disabled="disabled"value="Active/Inactive"/><input type="button"id="sortable_batchJob"value="Batch Job"/><input type="button"id="sortable_normalMode"class="hide"value="Normal Mode"/><input type="button"id="sortable_editItem"disabled="disabled"value="Edit Item"/><input type="button"id="sortable_saveItem"class="hide"value="Save Item"/><input type="button"id="sortable_cancelItem"class="hide"value="Cancel"/><input type="button"id="sortable_addItem"value="Add Item"/><input type="button"id="sortable_deleteItem"disabled="disabled"value="Delete Item"/><input type="button"id="sortable_getValue"value="Get Value"/><script>$(function(){var mockData={startIndex:4,sortJsonData:[{id:1,isActiveFlag:false,value:"item 1"},{id:2,isActiveFlag:true,value:"item 2"},{id:3,isActiveFlag:false,value:"item 3"},{id:4,isActiveFlag:true,value:"item 4"}],selectOneItemEnableButtonsDelegate:selectOneItemEnableButtonsDelegate,unselectItemDisableButtonsDelegate:unselectItemDisableButtonsDelegate,enterEditModeButtonsStatusDelegate:enterEditModeButtonsStatusDelegate,exitEditModeButtonsStatusDelegate:exitEditModeButtonsStatusDelegate};var sortId="sortable";$("#sortable").sorttable(mockData);$("#sortable").sorttable("SetEnterBatchJobModeButtonStatusDelegate",enterBatchJobModeButtonStatusDelegate);$("#sortable").sorttable("SetExitBatchJobModeButtonStatusDelegate",exitBatchJobModeButtonStatusDelegate);$("#sortable").sorttable("SetEnableBatchButtonDelegate",enableBatchButtonDelegate);$("#sortable").sorttable("SetDisableBatchJobButtonDelegate",disableBatchJobButtonDelegate);$("#sortable_getValue").click(function(){var alertStr=alertData(sortId);alert(alertStr);});$("#sortable_acitveInactiveItem").click(function(){$("#sortable").sorttable("AcitveInactiveItems");});$("#sortable_editItem").click(function(){$("#sortable").sorttable("EditItem");});$("#sortable_saveItem").click(function(){$("#sortable").sorttable("SaveItem");});$("#sortable_deleteItem").click(function(){$("#sortable").sorttable("DeleteItems");});$("#sortable_cancelItem").click(function(){$("#sortable").sorttable("CancelEdit");});$("#sortable_batchJob").click(function(){$("#sortable").sorttable("BatchMode");});$("#sortable_addItem").click(function(){$("#sortable").sorttable("AddItem");});$("#sortable_normalMode").click(function(){$("#sortable").sorttable("NormalMode");});});function enterEditModeButtonsStatusDelegate(sortElement){var sortElementId=sortElement.attr("id");$("#"+sortElementId+"_saveItem").show();$("#"+sortElementId+"_cancelItem").show();$("#"+sortElementId+"_editItem").hide();$("#"+sortElementId+"_addItem").hide();$("#"+sortElementId+"_deleteItem").hide();$("#"+sortElementId+"_batchJob").hide();}
function exitEditModeButtonsStatusDelegate(sortElement){var sortElementId=sortElement.attr("id");$("#"+sortElementId+"_saveItem").hide();$("#"+sortElementId+"_cancelItem").hide();$("#"+sortElementId+"_editItem").show();$("#"+sortElementId+"_addItem").show();$("#"+sortElementId+"_deleteItem").show();$("#"+sortElementId+"_batchJob").show();}
function selectOneItemEnableButtonsDelegate(sortElement){var sortElementId=sortElement.attr("id");$("#"+sortElementId+"_editItem").removeAttr("disabled");$("#"+sortElementId+"_deleteItem").removeAttr("disabled");$("#"+sortElementId+"_acitveInactiveItem").removeAttr("disabled");}
function unselectItemDisableButtonsDelegate(sortElement){var sortElementId=sortElement.attr("id");$("#"+sortElementId+"_editItem").attr("disabled","disabled");$("#"+sortElementId+"_deleteItem").attr("disabled","disabled");$("#"+sortElementId+"_acitveInactiveItem").attr("disabled","disabled");}
function disableBatchJobButtonDelegate(sortElement){var sortElementId=sortElement.attr("id");$("#"+sortElementId+"_acitveInactiveItem").attr("disabled","disabled");$("#"+sortElementId+"_deleteItem").attr("disabled","disabled");}
function enableBatchButtonDelegate(sortElement){var sortElementId=sortElement.attr("id");$("#"+sortElementId+"_acitveInactiveItem").removeAttr("disabled");$("#"+sortElementId+"_deleteItem").removeAttr("disabled");}
function enterBatchJobModeButtonStatusDelegate(sortElement){var sortElementId=sortElement.attr("id");$("#"+sortElementId+"_batchJob").hide();$("#"+sortElementId+"_normalMode").show();$("#"+sortElementId+"_addItem").hide();$("#"+sortElementId+"_editItem").hide();$("#"+sortElementId+"_acitveInactiveItem").removeAttr("disabled");$("#"+sortElementId+"_deleteItem").removeAttr("disabled");$("#"+sortElementId+"_editItem").attr("disabled","disabled");}
function exitBatchJobModeButtonStatusDelegate(sortElement){var sortElementId=sortElement.attr("id");$("#"+sortElementId+"_batchJob").show();$("#"+sortElementId+"_normalMode").hide();$("#"+sortElementId+"_editItem").show();$("#"+sortElementId+"_addItem").show();$("#"+sortElementId+"_acitveInactiveItem").attr("disabled","disabled");$("#"+sortElementId+"_deleteItem").attr("disabled","disabled");}
function alertData(sortElementId){var str="";var obj=$("#sortable").sorttable("GetJsonData");$.each(obj.sortJsonData,function(i,v){str+=v.id+" is "+v.isActiveFlag+" its value is "+v.value+".\n ";});return str;}</script></body></html>