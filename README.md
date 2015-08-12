# jQueryUISortable
## Introductions
This is a plugin extend from [jQuery Ui](http://jqueryui.com/sortable/) Sortable

In oredr to build a sortable and editable list

## What We Can Do
* Add Item to list
* Delete Item(s) from list
* Edit Selected Item
* Active/Inactive Item(s) in list
* Json Data Format

## Required
- jQuery 1.7+
- jQuery UI

## How To Use
First, you need import our js and css file in your html file's head. Don't forget to impor **jQuery** and **jQuery UI**
```html
  <link rel="stylesheet" href="../jquery-ui/jquery-ui.css">
  <script src="../jquery-ui/jquery-1.11.3.js"></script>
  <script src="../jquery-ui/jquery-ui.js"></script>
  <script src="../src/jQueryUISortable.js"></script>
  <link rel="stylesheet" href="../src/jQueryUISortable.css">
```
The plugin can also be loaded as AMD module.

In Html page, you just need put an **\<ul\>** element and some buttons like save, cancel, batch job button.

Html code snippet from demo:
```html
  some codes ...
  <ul id="sortable">
  </ul>
  <input type="button" id="sortable_acitveInactiveItem" disabled="disabled" value="Active/Inactive"/>
  <input type="button" id="sortable_batchJob"  value="Batch Job"/>
  <input type="button" id="sortable_normalMode" class="hide" value="Normal Mode"/>
  <input type="button" id="sortable_editItem" disabled="disabled" value="Edit Item"/>
  <input type="button" id="sortable_saveItem" class="hide" value="Save Item"/>
  <input type="button" id="sortable_cancelItem" class="hide" value="Cancel"/>
  <input type="button" id="sortable_addItem" value="Add Item"/>
  <input type="button" id="sortable_deleteItem" disabled="disabled" value="Delete Item"/>
  <input type="button" id="sortable_getValue" value="Get Value"/>
  other codes ...
```

#### In your own js file, first of all, you need to initialize our plugin.
```JavaScript
$("#sortable").sorttable(options);
```
Here, *options* is a json string
```JSON5
var options = {
  		startIndex : 4, //start index is used when user add a new item, and we will use this start index as a part of element id.
  		sortJsonData :  //list's data source array, json based. [{id:,isActiveFlag:,value}],
  		[{
  				id : 1,                 //unique id
  				isActiveFlag : false,   //active flag
  				value : "item 1"        //value of this item
  			}, {
  				id : 2,
  				isActiveFlag : true,
  				value : "item 2"
  			}, {
  				id : 3,
  				isActiveFlag : false,
  				value : "item 3"
  			}, {
  				id : 4,
  				isActiveFlag : true,
  				value : "item 4"
  			}
  		]
  	};
```
#### After these step, you shoud set a delegate for your buttons.
```javascript
  //set a button delegate
  $("#sortable").sorttable("SetEnableBatchButtonDelegate",enableBatchButtonDelegate);
   //in this custom function, you need implement when and how to show your button.
  function enableBatchButtonDelegate(sortElement) {
  	var sortElementId = sortElement.attr("id");
  	//in this function, it means when you enter batch mode and select some items, you should make active button activation.
  	$("#" + sortElementId + "_acitveInactiveItem").removeAttr("disabled"); 
  	$("#" + sortElementId + "_deleteItem").removeAttr("disabled");
  }
```
There are 8 delegate need to be set.
```javascript
  //set a button delegate
  $("#sortable").sorttable("name",function);
```
| Name  | Description |
| :------------ |:------------|
|selectOneItemEnableButtonsDelegate |Delegate, this is invoked when user select one item in our list|
|unselectItemDisableButtonsDelegate |Delegate, this is invoked when table is nothing selected|
|enterEditModeButtonsStatusDelegate |Delegate, this is invoked when user enter edit mode|
|exitEditModeButtonsStatusDelegate |Delegate, this is invoked when user exit edit mode|
|enterBatchJobModeButtonStatusDelegate |Delegate, this is invoked when user enter batch job mode|
|exitBatchJobModeButtonStatusDelegate |Delegate, this is invoked when user exit batch job mode|
|enableBatchButtonDelegate |Delegate, this is invoked when user enter batch job mode and check some check boxes|
|disableBatchJobButtonDelegate |Delegate, this is invoked when user enter batch job mode and select nothing|

Also, you can set these delegates when plugin initialize, just like:
```JSON5
var options = {
  		//other codes ...
  		selectOneItemEnableButtonsDelegate : selectOneItemEnableButtonsDelegate,
  		unselectItemDisableButtonsDelegate : unselectItemDisableButtonsDelegate,
  		enterEditModeButtonsStatusDelegate : enterEditModeButtonsStatusDelegate,
  		exitEditModeButtonsStatusDelegate : exitEditModeButtonsStatusDelegate
  		//other codes ...
  	};
```
#### You need bind you own click event to your buttons.
```javascript
  //active or inactive selected item
	$("#sortable_acitveInactiveItem").click(function(){
	  //tirgger active item atcion.
		$("#sortable").sorttable("AcitveInactiveItems");
	});
```
There are 8 event can be binded.
```javascript
  //set a button delegate
  $("#sortable").sorttable("actionname");
```
| Action Name  | Description |
| :------------ |:------------|
|AcitveInactiveItems |Action, active user selected item|
|EditItem |Action, edit user selected item|
|SaveItem |Action, save user selected item|
|DeleteItems |Action, delete user selected item|
|CancelEdit |Action, cancel user's editing in edit mode|
|BatchMode |Action, enter batch mode|
|AddItem |Action, add a new record|
|NormalMode |Action, exit batch mode|

#### Demo

you can find a demo in this project *demo* folder.

## Screenshot
![Demo Image](https://github.com/Mars-Shen/jQueryUISortable/blob/master/demo/demo.gif)

##License
Licensed under the MIT License

##Changelog
#####v0.0.1
origin version: 5 Aug 2015
* this is a origin version for this plugin. 
* this is my first jQuery plugin, there must be a lot defect or some bad smell, welcome any help or advice to imporve this plug. Thanks.


