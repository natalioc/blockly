'use strict';

goog.provide('Blockly.Accessibility.Speech');
goog.require('Blockly.Accessibility');
goog.require('Blockly.Accessibility.InBlock');

/*
*Licensed under the Apache License, Version 2.0 (the "License");
*you may not use this file except in compliance with the License.
*You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
*Unless required by applicable law or agreed to in writing, software
*distributed under the License is distributed on an "AS IS" BASIS,
*WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*See the License for the specific language governing permissions and
*limitations under the License.
*/


/*
*FILE OVERVIEW
* This file helps the screenreader say useful information while in the workspace and update as the contents of the block changes
*/

/*
* get selected block type and call function that updates the blockreader
*	@param_block.....the block being read
* 	@param_blockSvg..the svg of the block being read 
*/
Blockly.Accessibility.Speech.updateBlockReader = function(type, blockSvg){
	// get default string for the block based on type
	var newStr;
	var defaultStr  = Blockly.Accessibility.menu_nav.blockToString(type); 	

	var active      = document.activeElement;
    var blockReader = document.getElementById("blockReader");               

    //load the xml of the page and get all the blocks XML
    var xmlDoc      = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);	
   	var blocksArr   = xmlDoc.getElementsByTagName("block");   				


   	//go through the blocks on the workspace and find the matching one based on type and id
   	for (var i = 0; i<blocksArr.length; i++){
   		var blockType = blocksArr[i].getAttribute("type");
   		if(blockType == type && blocksArr[i].id == blockSvg.id){
	     newStr   = this.changeString(defaultStr, blocksArr[i],blockSvg);
   		}
   	}

   	//apply aria attributes in order to update the user audibly when anything on the workspace changes
    active.setAttribute("aria-owns", "blockReader");
    active.setAttribute("aria-labelledBy", "blockReader");
    
	//update the blockReader
    blockReader.innerHTML = newStr;
    console.log(newStr);
};

/*
* Reads the selected connection out loud 
* @param_name...name of the connection selected
* Aparam_index..index of the connection selected
*/
Blockly.Accessibility.Speech.readConnection = function(name, index){
	var blockReader = document.getElementById("blockReader");	
	var active 		= document.activeElement;
	var say;

	//top and bottom connections are named undefined
	if(name == undefined)
	{
		switch(index){
			case 0:
				name = "bottom"
				break;
			case 1:
				name = "top";
				break;
			case 2:
				name = "input";
				break;
			case 3:
				name = "previous";
				break;
			case 4:
				name = "next connection";
				break;
			default:
				name = "select a";
				break;
		}
	}
	//some names are not descriptive
	switch(name){
		case "VAR":
			name = "variable";
			break;
		case "OP":
			name = "drop down";
			break;
		default:
			break;
	}

	//blocks with multiple outputs like create list with are named add0 add1 etc. so put in a space to make it readable
	for(var i = 0; i< name.length; i++){

		if(name.indexOf(i) > -1){
			var iIndex = name.indexOf(i);
		    name = name.substring(0,iIndex) + " ";

			if(name.indexOf('ADD') > -1){
				name = name + i;
			}
		}
	}

	//screenreaders sometimes read words in all uppercase as individual letters
	name = name.toLowerCase();
	say = name + " connection."

   	//apply aria attributes in order to update the user audibly when anything on the workspace changes
    active.setAttribute("aria-owns", "blockReader");
    active.setAttribute("aria-labelledBy", "blockReader");

    //update the blockReader
    blockReader.innerHTML = say;
    console.log(say);
};


/*
* Update the string to create a unique one for that block
* 	@param_defaultStr..the default string for a block of that type
* 	@param_block.......the actual block whose string i s being changed
* 	@param_blockSvg....The svg of the block that is being changed
*/
Blockly.Accessibility.Speech.changeString = function(defaultStr, block, blockSvg){
	var newStr = defaultStr; 			  //this is what the function will return
	var re = /'([^']*)'/g;  			  //gets everything between single quotes
	var inputsArr = defaultStr.match(re); //array of the possible inputs to change

	var innerType; 						  //type of block within current block
	var getInputs = block.childNodes;     //all possible inputs for block
	var blockType = block.getAttribute("type"); 

	//switch the input order of blocks if necessary
	var readOrderArr = this.switchInputOrder(blockType, inputsArr);
    
	//go through any blocks or inputs that would change speech
	for(var i = 0; i < inputsArr.length; i++){ 

		//If there are potential fields in the block (dropdowns or textboxes)
		if(getInputs.length >0 && block.childNodes[i]!= undefined && block.childNodes[i].textContent != undefined){
			var newName; //the updated name of the field or dropdown in the block

			if((block.lastChild !=null && block.lastChild.innerHTML != "" && blockType.indexOf("procedures") == -1)){

				//names arnt changing so stay the same
				if(block.lastChild.getAttribute("name") == "NAME" ){ 

					newName = this.fieldNameChange("",blockType);
					newStr = newStr.replace(readOrderArr[i], newName);


				}

				//get the text content of a changed field
				else{

					newName = this.fieldNameChange(getInputs[i].textContent, blockType);
				    newStr = newStr.replace(readOrderArr[i], newName);

				}
			}
			//blocks with multiple inline inputs such as create list with and create text with have mutations that will throw errors if not handled separately
			if(getInputs[i].tagName == "MUTATION" && blockSvg.childBlocks_[i] != undefined){

				var mutationType = Blockly.Accessibility.menu_nav.blockToString(blockSvg.childBlocks_[i].type);
				var changedName = this.changeString(mutationType, block.lastChild.lastChild, blockSvg.childBlocks_[i]);
				newName = this.fieldNameChange(changedName, blockType);


			}

			//functions need a special case for matching the getInputs array and inputsArr getinputs[i+1] == inputsArr[i-1]
			if(blockType == "procedures_defnoreturn" || blockType == "procedures_defreturn"){
				newName = this.fieldNameChange(getInputs[1].innerHTML, blockType);
				newStr =  newStr.replace(inputsArr[0], newName);

				//return block
				if(blockType == "procedures_defreturn" && getInputs.length == 3){
					var nameLoc = getInputs[2].lastChild.lastChild;
					var newName2 = this.fieldNameChange(nameLoc.innerHTML, blockType);
					newStr =  newStr.replace('A', newName2);
				}
			}			

		}
		
		//if there is an inner   block get its type and update the string
		if(blockSvg.childBlocks_[i] != undefined){
			innerType = blockSvg.childBlocks_[i].type;
			var blockAdded   = Blockly.Accessibility.menu_nav.blockToString(innerType); //get default string for that block
			//block connected to block
			if(blockSvg.childBlocks_[i].childBlocks_[0] != undefined) {
				//set up variables to call blockToString and changeString
				var childSvg   = blockSvg.childBlocks_[i].childBlocks_[0];
				var childBlock = block.firstChild.firstChild;

				//get the child block and its string
				//this sometimes throws an error when getting the attribute but does not cause reading issues
				try{
				var childType  = childBlock[0].getAttribute("type");
				var defChildStr= Blockly.Accessibility.menu_nav.blockToString(childType);
				var newChildStr = this.changeString(defChildStr, childBlock, childSvg);
				}
				catch(e){
				}

				//combination of the two attached blocks
				blockAdded = blockAdded.replace(blockAdded,newChildStr);
				blockAdded = blockAdded.replace("block.", " "); //remove the block suffix from combined block
				newStr = defaultStr.replace(inputsArr[i],blockAdded);

			 }

			else{
			    blockAdded = blockAdded.replace("block.", " "); 
				newStr = newStr.replace(readOrderArr[i], blockAdded);
			}
		}
	}
	//blocks with >3 inputs do not replace all of the text
	if((newStr.indexOf("'") != -1) && getInputs[readOrderArr.length-1] != undefined){
		var re2 = /'([^']*)'/g;  //gets everything between single quotes
		var leftOverArr = newStr.match(re2); //array of the possible inputs to change
		newStr = newStr.replace(leftOverArr[0], getInputs[readOrderArr.length-1].textContent); //replace the last bit of text
	}

	//fix blocks that read "block." 
	var suffixCnt = (newStr.match(/block/g) || []).length;
	if(suffixCnt >= 1 && getInputs.length > 1){
		newStr = newStr.replace(newStr.match(/ block. /), " ");
	}

	//console.log(newStr);
	return newStr;

};







/*
* For certain blocks, the order of the inputs must be switched to read correctly **note: read order arr starts at 1 to skip invisible mutations**
* The default order of inputs is mutations, fields, then values.
* 	@param_blockType...type of block
* 	@param_inputsArr...the array of string inputs of the block that need to be rearranged.
* EXAMPLE_ Original:"Add A B"    Switched "A Add B"
* returns array with updated string order
*/
Blockly.Accessibility.Speech.switchInputOrder = function(blockType, inputsArr){
	var readOrderArr = []; //ordered array to return

	switch(blockType){
		case "text_indexOf":
		case "lists_indexOf": 
			readOrderArr[0] = inputsArr[1];
			readOrderArr[1] = inputsArr[0];
			readOrderArr[2] = inputsArr[2];
			break;
		case "text_getSubstring": 
			readOrderArr[1] = inputsArr[1];
			readOrderArr[2] = inputsArr[3];
			readOrderArr[3] = inputsArr[0];
			readOrderArr[4] = inputsArr[2];
			readOrderArr[5] = inputsArr[4];
			break;
		case "lists_getSublist":
			readOrderArr[1] = inputsArr[1];
		    readOrderArr[2] = inputsArr[3];
			readOrderArr[3] = inputsArr[0]; 
		    readOrderArr[4] = inputsArr[2];
		    readOrderArr[5] = inputsArr[4];
		    break;
		case "text_charAt":
			readOrderArr[0] = inputsArr[2];
			readOrderArr[1] = inputsArr[1];
			readOrderArr[2] = inputsArr[0];
			break;
		case "lists_getIndex":
		case "lists_setIndex":
			readOrderArr[0] = inputsArr[4];
			readOrderArr[1] = inputsArr[1];
			readOrderArr[2] = inputsArr[2];
			readOrderArr[3] = inputsArr[0];
			readOrderArr[4] = inputsArr[4];
			break;
		case "logic_compare":
		case "logic_operation":
		case "math_arithmetic":
		case "procedures_ifreturn":
			//this case must be handled differently from the above or else it does not update the second block inner text
			var saveZero = inputsArr[0];
			inputsArr[0] = inputsArr[1];
	   		inputsArr[1] = saveZero;
	   		readOrderArr = inputsArr;
			break;
		default: 
			readOrderArr = inputsArr;
			break;
	}

	return readOrderArr;
};


/*
*Change the default name of the drop down input
*	@param_defaultNm the default string associated with a symbol or dropdown option
*	@param_blockType the type of block used to determine special wording 
*/
Blockly.Accessibility.Speech.fieldNameChange = function(defaultNm, blockType){
	var newName;

	switch(defaultNm){
		case "EQ":
			newName = "equals";
			break;
		case "NEQ":
			newName = "is not equal to";
			break;
		case "LT":
			newName = "is less than";
			break;
		case "LTE":
			newName = "is less than or equal to";
			break;
		case "GT":
			newName = "is greater than";
			break;
		case "GTE":
			newName = "is greater than or equal to";
			break;
		case "ROOT":
			newName = "square root";
			break;
		case "ABS":
			newName = "absolute value of";
			break;
		case "EXP":
			newName = "e to the power of";
			break;
		case "POW10":
			newName = "10 to the power of";
			break;
		case "FROM_START":
			newName = "index";

			if(blockType == "text_charAt"){
				newName = "character at index"
			}
			break;
		case "FROM_END":
			newName = "index from end";
			break;
		case "SPLIT":
			newName = "list from text";
			break;
		case "JOIN":
			newName = "text from list";
			break;
		default:
			defaultNm = defaultNm + ' ';
			newName = defaultNm.toLowerCase();
			break;
	}
	return newName;
};