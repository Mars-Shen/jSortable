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
First, you need import our js and css file in your html file's head. Don't forget to import **jQuery** and **jQuery UI**
```html
  <link rel="stylesheet" href="../jquery-ui/jquery-ui.css">
  <script src="../jquery-ui/jquery-1.11.3.js"></script>
  <script src="../jquery-ui/jquery-ui.js"></script>
  <script src="../src/jQueryUISortable.js"></script>
  <link rel="stylesheet" href="../src/jQueryUISortable.css">
```
The plugin can also be loaded as AMD module.

In Html page, you just need put an **\<div\>** element! That's all!

Html code snippet from demo:
```html
  some codes ...
  <div id="sortable">
  </div>
  other codes ...
```

#### In your own js file, first of all, you need to initialize our plugin.
```JavaScript
$("#sortable").sorttable(options);
```
Here, `options` is a json string, it looks like this:
```JSON5
var options = {
		defaultNewItemText:"New Item",
  		sortJsonData :  //list's data source array, json based. [{key:,isActiveFlag:,value}],
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
This form show all options:

| Name  | Description |Default|
| :------------ |:------------|:------------|
|groupMode| Group active and inactive items in two groups.| true |
|keyValueMode| Make this plugin in key value mode or not.| true |
|enableNewItem| if this option is true, new item which you added will be enable as default. | false |
|defaultNewItemKey| Default new item's key | "NK" |
|defaultNewItemText| Default new item's value | "new value" |
|sortJsonData| List's source data array, json based. [{id:,isActiveFlag:,value}].| [] |
|activeButton| Show active/inactive button or not. | true |
|activeButtonText| Default text on active button. | "Active/Inactive" |
|batchButton| Show batch mode/normal button or not. | true |
|batchButtonText| Default text on batch mode button. | "Batch Mode" |
|normalModeButtonText| Default text on normal mode button. | "Normal Mode" |
|editButton| Show edit button or not. | true |
|editButtonText| Default text on edit button. | "Edit Item" |
|saveButtonText| Default text on save button. | "Save Item" |
|cancelButtonText| Default text on cancel button. | "Cancel" |
|addButton| Show add item button or not. | true |
|addButtonText| Default text on add item button. | "Add Item" |
|deleteButton| Show delete button or not. | true |
|deleteButtonText| Default text on delete button. | "Delete Item" |
|submitButton| Show submit button or not. | true |
|submitButtonText| Default text on submit button. | "Submit" |
|submitCallBack| Submit button callback. | function(){} |
|buttonClass| Custom button css class. | "" |

#### After these step, you can set a callback for your buttons.
```javascript
sortObj.sorttable("SubmitCallback", function () {
	var str = "";
	var obj = sortObj.sorttable("ModelData");
	$.each(obj.sortJsonData, function (i, v) {
		str += "Record " + v.id + "'s status is " + v.isActiveFlag + "(key: "+ v.key +", value: " + v.value + ").\n ";
	});
   	alert(str);
});
```
There are just 2 medthod you can inovke right now.

| Name  | Description |Arguments|
| :------------ |:------------|:------------|
|ModelData|Get or reset list's options in a json format ||
|Destroy|Destroy this plugin ||
|SubmitCallback|Submit button callback|function|

Json based data from `ModelData` medthod:
```json5
	{
		sortJsonData : [{key:,isActiveFlag:,value}],//list's data source array, json based.
		activedData : [],//active data in list
		inactivedData : []//inactiva data in list
	};
```
You can aslo reset the `options` source into this plugin,
```javascript
	sortObj.sorttable("ModelData",options);
```

#### Demo

you can find a demo in this project *demo* folder.

## Screenshot
Group Mode Demo
![Group Mode Demo Image](https://github.com/Mars-Shen/jQueryUISortable/blob/master/demo/demo_group_mode.gif)
Single Mode Demo
![Demo Image](https://github.com/Mars-Shen/jQueryUISortable/blob/master/demo/demo.gif)

##License
Licensed under the MIT License

##Changelog
#####v0.0.1
origin version: 5 Aug 2015
* this is a origin version for this plugin. 
* this is my first jQuery plugin, there must be a lot defect or some bad smell, welcome any help or advice to imporve this plug. Thanks.


