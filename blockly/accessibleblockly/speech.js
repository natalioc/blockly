'use strict';

goog.provide('Blockly.Accessibility.Speech');
goog.require('Blockly.Accessibility');
goog.require('Blockly.Accessibility.Navigation');

/*
* This file helps the screenreader say useful information while in the workspace and update when editing blocks
*/

/*
*get selected block type and call function that updates the blockreader
*@param_type..the type of block being read
*/
Blockly.Accessibility.Speech.updateBlockReader = function(type, id){
	var active = document.activeElement;
    var blockReader = document.getElementById("blockReader");

    active.setAttribute("aria-owns", "blockReader");
    active.setAttribute("aria-labelledBy", "blockReader");
    
	//get the default block string and update it
	var defaultStr = Blockly.Accessibility.menu_nav.blockToString(type);
	//var newStr   = this.changeString(defaultStr,changeKey,id);

	console.log(defaultStr);
	//update the blockReader
    blockReader.innerHTML = defaultStr;
 
}
/*
* Update the string to create a unique one for that block
* @param_defaultStr.the default string for a block of that type
* @param_changeKey..the part of the string to change. each item has a keyword or label associated with it to change
* @param_id.........id of the block so that the values can be pulled from it
*/
Blockly.Accessibility.Speech.changeString = function(defaultStr, changeKey, id){
	var newStr;


	return newStr;
}