# jQueryUISortable
## Introductions
This is a plugin extend from [jQuery Ui](http://jqueryui.com/sortable/) Sortable

In oredr to build a sortable and editable list

## What We Can Do
* Add Item to list
* Delete Item(s) from list
* Edit Selected Item
* Active/Inactive Item(s) in list
* Reorder element in list using the mouse
* Json Data Format
* Online and offline mode

## Required
- jQuery 1.7+
- jQuery UI

## How To Use
First, you need import our js and css file in your html file's head. Don't forget to import **jQuery** and **jQuery UI**
```html
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
  				index : 1,		//Must, order in data sequence
  				isActiveFlag : false,   //Must, active flag
  				value : "item 1",       //Must, value of this key value pair.
  				key : 1,                 //Optional if keyValueMode is false, it's the key of key value pair.
  				primaryKey : 1543       //Optional, mapping your own bussiness logic, like if you want to store a primaryKey of database, you can put it here.
  			}, {
  				key : 2,
  				index : 2,
  				isActiveFlag : true,
  				value : "item 2"
  			}, {
  				key : 3,
  				index : 3,
  				isActiveFlag : false,
  				value : "item 3"
  			}, {
  				key : 4,
  				index : 4,
  				isActiveFlag : true,
  				value : "item 4"
  			}
  		]
  	};
```
This form show all `options`:

| Name  | Description |Default|
| :------------ |:------------|:------------|
|onlineMode|Add or delete function will process on sever side.| false |
|_saveURL_|Save function ajax url, if onlineMode is true, this url must be not null.| "" |
|_deleteURL_|Delete function ajax url, if onlineMode is true, this url must be not null.| "" |
|_activeURL_|Active function ajax url, if onlineMode is true, this url must be not null.| "" |
|_blockfunction_|Block page function when ajax call is happening| "" |
|_unblockfunction_|Unblock page function when ajax call has done| "" |
|keyValueMode| Make this plugin in key value mode or not.| true |
|enableNewItem| if this option is true, new item which you added will be enable as default. | false |
|defaultNewItemKey| Default new item's key | "NK" |
|defaultNewItemText| Default new item's value | "new value" |
|sortJsonData| List's source data array, json based. [{id:,isActiveFlag:,value}].| [] |
|activeButton| Show active/inactive button or not. | true |
|inlineActiveButton| Show inline active/inactive button or not. | false |
|activeButtonText| Default text on active button. | "Active/Inactive" |
|batchMode| show checkbox or not. | true |
|editButton| Show edit button or not. | true |
|editButtonText| Default text on edit button. | "Edit" |
|saveButtonText| Default text on save button. | "Save" |
|cancelButtonText| Default text on cancel button. | "Cancel" |
|addButton| Show add item button or not. | true |
|addButtonText| Default text on add item button. | "Add" |
|deleteButton| Show delete button or not. | true |
|inlineDeleteButton| Show inline delete button or not. | false |
|deleteButtonText| Default text on delete button. | "Delete" |
|saveOrderButton| Show save order button or not. | true |
|saveOrderButtonText| Default text on save order button. | "Save Order" |
|submitCallBack| Submit button callback. | function |
|buttonClass| Custom button css class. | "" |
|deleteCallBack|Delete button callback. use to confirm delete action. argument is select item(s).|function|

#### Online mode
coming soon..

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
There are some medthods you can inovke right now.

| Name  | Description |Arguments|
| :------------ |:------------|:------------|
|ModelData|Get or reset list's options in a json format |options|
|Destroy|Destroy this plugin ||
|SubmitCallback|Set submit button callback|function|
|DeleteCallBack|Set delete button callback|function|
You can get json based data from `ModelData` medthod
```javascript
	var data = sortObj.sorttable("ModelData");
```

Json based data structure from `ModelData` medthod:
```json5
	{
		sortJsonData : [{key:,isActiveFlag:,value}],//list's data source array, json based.
		activedData : [],//active data in list
		inactivedData : [],//inactiva data in list
		newAddedItems: [],//added items
		deletedItems: []//deleted items
	};
```
You can aslo reset the `options` source into this plugin,
```javascript
	sortObj.sorttable("ModelData",options);
```

#### Demo

you can find a demo in this project *demo* folder.

[Live Demo](http://www.marsshen.com/others/jSortable/demo/SortableDemo/)

## Screenshot
Group Mode Demo
![Group Mode Demo Image](https://github.com/Mars-Shen/jQueryUISortable/blob/master/demo/demo_group_mode.gif)


##License
Licensed under the MIT License

##Changelog
#####v0.0.2
26 Aug 2015
* new UI, new online mode.

#####v0.0.1
origin version: 5 Aug 2015
* this is a origin version for this plugin. 
* this is my first jQuery plugin, there must be a lot defect or some bad smell, welcome any help or advice to imporve this plug. Thanks.


