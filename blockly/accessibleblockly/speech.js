
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
	var defaultStr  = Blockly.Accessibility.Speech.blockToString(type); 	

	var active      = document.activeElement;
    var blockReader = document.getElementById("blockReader");               	

   	//go through the blocks on the workspace and find the matching one based on type and id
    var xmlBlock = Blockly.Xml.blockToDom_(Blockly.selected);

	newStr   = this.changeString(xmlBlock);
   		
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

/* Updates the string that will be read by the screenReader
 * @param_block...the currently selected block
 * @param_xmlDoc..the updated xml for the page used to get block information
 */
Blockly.Accessibility.Speech.changeString = function(block){

	var newStr;  												//newStr is what will be returned by this function
	var fieldValArr = [];										//stores values for all of the fields
	var strArr      = [];										//Array of default strings to be updated 
	var blockArr    = block.getElementsByTagName("BLOCK"); 	    //get array of blocks attached to selected block
	var fieldBlcArr = block.getElementsByTagName("FIELD");

	//get the top selected block
	strArr[0] = Blockly.Accessibility.Speech.blockToString(block.getAttribute("type"));

	//===========single blocks must be treated separately====================================================
	if(blockArr.length == 0){

		for(var i = 0; i < fieldBlcArr.length; i++){

			//get the default strings for each block and any field values there are
			var blockType  = block.getAttribute("type");
		    strArr[i]      = Blockly.Accessibility.Speech.blockToString(blockType);

			fieldValArr[i] = fieldBlcArr[i].innerText;
			fieldValArr[i] = this.fieldNameChange(fieldValArr[i], fieldBlcArr[i].getAttribute("type"));

		}

	}
	//==========Fill strArr with default strings============================================================
	for(var i = 0; i < blockArr.length; i++){

		//make sure blocks are not within <statements> or <next> 
		if(blockArr[i].parentNode.nodeName != "STATEMENT" && blockArr[i].parentNode.nodeName != "NEXT"){

			var blockType = blockArr[i].getAttribute("type");

		    strArr[i+1]   = Blockly.Accessibility.Speech.blockToString(blockType);
		    strArr[i+1]   = strArr[i+1].replace(/block\./g, " ");
		}
	}

	//=======Get field values (number textboxes dropdowns etc.)==============================================
	for(var i = 0; i < fieldBlcArr.length; i++){

		fieldValArr[i] = fieldBlcArr[i].innerText;

		//only update the array if the field is defined
		fieldValArr[i] = this.fieldNameChange(fieldValArr[i], fieldBlcArr[i].getAttribute("type"));
   
	}


	//=========Fill in all the fields=========================================================================
	//go through strArr and if it has ' ' replace it with field value at valueIndex
	var valueIndex = 0;
	for(var i = 0; i < strArr.length; i++){

		var re = /'([^']*)'/g; //gets all values indicated by ' ' with anything in between

		//if it contains ''
		if(re.test(strArr[i])){
			strArr[i] = strArr[i].replace(re,fieldValArr[valueIndex]);
			valueIndex ++;
		}
	}

	//===========combine multiple strings if necessary=========================================================
	if(blockArr.length > 0){

		var re = (/\([^\)]+\)/g); //gets all blocks indicated by ()
		var match;

		//Loop through the string array and update the first value every time 
		for(var i = 1; i < strArr.length; i ++){

			//if there are blocks to replace
			if(re.test(strArr[0])){

				//find blocks to exchange
				match     = strArr[0].match(re)[0];
				strArr[0] = strArr[0].replace(match, strArr[i]);
				
			}
		}
	}

	//=====DEBUG========
	// console.log("FINAL");
	// console.log(fieldValArr);
	// console.log(fieldBlcArr);
	// console.log(blockArr);
	// console.log(strArr);

	newStr = strArr[0];
	return newStr;
};



/*
* Update the string to create a unique one for that block
* 	@param_defaultStr..the default string for a block of that type
* 	@param_block.......the actual block whose string i s being changed
* 	@param_blockSvg....The svg of the block that is being changed
*/
// Blockly.Accessibility.Speech.changeString = function(defaultStr, block, blockSvg){
// 	var newStr = defaultStr; 			  //this is what the function will return
// 	var re = /'([^']*)'/g;  			  //gets everything between single quotes
// 	var inputsArr = defaultStr.match(re); //array of the possible inputs to change

// 	var innerType; 						  //type of block within current block
// 	var getInputs = block.childNodes;     //all possible inputs for block
// 	var blockType = block.getAttribute("type"); 
// 	var blocksArr = xmlDoc.getElementsByTagName("BLOCK");
// 	console.log(blocksArr);
// 	console.log(blocksArr[blocksArr.length-1].outerHTML);

// 	//switch the input order of blocks if necessary
// 	var readOrderArr = this.switchInputOrder(blockType, inputsArr);
    
//      //if there is nothing in the string to change then return it as is
// 	if(inputsArr == null){
// 		return newStr;
// 	}

// 	//go through any blocks or inputs that would change speech
// 	for(var i = 0; i < inputsArr.length; i++){ 

// 		//If there are potential fields in the block (dropdowns or textboxes)
// 		if(getInputs.length >0 && block.childNodes[i]!= undefined && block.childNodes[i].textContent != undefined){
// 			var newName; //the updated name of the field or dropdown in the block

// 			console.log(getInputs[i]);

// 			//check that the block exists
// 			if((block.lastChild !=null && block.lastChild.innerHTML != "")){

// 				//inner container blocks should not be read.
// 				if(block.firstChild.tagName == "NEXT" || getInputs[i].tagName == "STATEMENT"){
// 					return newStr;
// 				}

// 				// if(!getInputs[i].tagName == "FIELD" && getInputs[i].firstChild.getAttribute("type") == "logic_null"){

// 				// 	var childType = "logic_null";
// 				// 	var childStr  = Blockly.Accessibility.menu_nav.blockToString(childType);

// 				// 	newStr = newStr.replace(readOrderArr[1], childStr);    //update the string
// 				// 	newStr = newStr.replace(newStr.match(/block\./), ""); //fix blocks that have an extra "block." 
// 				// 	console.log("in field/null");
// 				// }

// 				//names arnt changing so stay the same
// 				if(block.lastChild.getAttribute("name") == "NAME"){ 

// 					newName = this.fieldNameChange("",blockType);
// 					newStr  = newStr.replace(readOrderArr[i], newName);
// 					console.log("in name");

// 				}

// 				//get the text content of a changed field
// 				//else{

// 				// 	newName = this.fieldNameChange(getInputs[i].textContent, blockType);
// 				//     newStr  = newStr.replace(readOrderArr[i], newName);
// 				//     console.log("in else");
// 				//     console.log(getInputs[i]);
// 				// }
// 				// console.log("1: " + newStr);
// 			}
// 			//blocks with multiple inline inputs such as create list with and create text with have mutations that will throw errors if not handled separately
// 			if(getInputs[i].tagName == "MUTATION" && blockSvg.childBlocks_[i] != undefined){

// 				var mutationType = Blockly.Accessibility.menu_nav.blockToString(blockSvg.childBlocks_[i].type);
// 				var changedName  = this.changeString(mutationType, block.lastChild.lastChild, blockSvg.childBlocks_[i]);
// 				newName = this.fieldNameChange(changedName, blockType);


// 			}

// 			//functions need a special case for matching the getInputs array and inputsArr getinputs[i+1] == inputsArr[i-1]
// 			if(blockType == "procedures_defnoreturn" || blockType == "procedures_defreturn"){
// 				i++;
// 				newName = this.fieldNameChange(getInputs[i].textContent, blockType);
// 				newStr = newStr.replace(inputsArr[i-1],newName);
// 				i--;
// 			}			

// 						//handle functions with returns
// 			if(blockType == "procedures_defreturn" && getInputs.length == 3){
// 				var nameLoc  = getInputs[2].lastChild.lastChild;
// 				var newName2 = this.fieldNameChange(nameLoc.innerHTML, blockType);
// 				newStr       = newStr.replace('A', newName2);
// 			}	
// 				console.log("2: " + newStr);

// 		}

// 		// //if there is an inner   block get its type and update the string
// 		// if(blockSvg.childBlocks_[i] != undefined){
// 		// 	innerType = blockSvg.childBlocks_[i].type;
// 		// 	var blockAdded   = Blockly.Accessibility.menu_nav.blockToString(innerType); //get default string for that block
// 		// 	//block connected to block
// 		// 	if(block.firstChild.firstChild != undefined ) {
// 		// 		//set up variables to call blockToString and changeString
// 		// 		var childSvg   = blockSvg.childBlocks_[i].childBlocks_[0];
// 		// 		var childBlock = block.firstChild.firstChild;
// 		// 		console.log(childBlock);

// 		// 		//throws error trying to get attribute otherwise
// 		// 		if(childBlock.toString().indexOf('"' < 0)){
// 		// 			//get the child block and its string
// 		// 			var childType   = childBlock.getAttribute("type");
// 		// 			var defChildStr = Blockly.Accessibility.menu_nav.blockToString(childType);
// 		// 			var newChildStr = this.changeString(defChildStr, childBlock, childSvg);
// 		// 			console.log(childBlock);

// 		// 			//combination of the two attached blocks
// 		// 			blockAdded = blockAdded.replace(blockAdded,newChildStr);
// 		// 			blockAdded = blockAdded.replace("block.", " "); //remove the block suffix from combined block
// 		// 			newStr = defaultStr.replace(inputsArr[i],blockAdded);
// 		// 		}

// 		// 	 }

// 		// 	else{
// 		// 	    blockAdded = blockAdded.replace("block.", " "); 
// 		// 		newStr = newStr.replace(readOrderArr[i], blockAdded);
// 		// 	}
// 		// 	console.log("O: " + newStr);
// 		// }
// 	}
// 	//blocks with >3 inputs do not replace all of the text
// 	if((newStr.indexOf("'") != -1) && getInputs[readOrderArr.length-1] != undefined){
// 		var re2 = /'([^']*)'/g;  //gets everything between single quotes
// 		var leftOverArr = newStr.match(re2); //array of the possible inputs to change
// 		newStr = newStr.replace(leftOverArr[0], getInputs[readOrderArr.length-1].textContent); //replace the last bit of text
// 	}

// 	//fix blocks that read "block." 
// 	var suffixCnt = (newStr.match(/block/g) || []).length;
// 	if(suffixCnt >= 1 && getInputs.length > 1){
// 		newStr = newStr.replace(newStr.match(/ block. /), " ");
// 	}

// 	//console.log(newStr);
// 	return newStr;

// };







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
			newName = defaultNm.toLowerCase();
			break;
	}
	return newName;
};

Blockly.Accessibility.Speech.blockToString = function(type, disabled){
    var result;
    var disabledText = "";

    switch (type){
        case "beep":
            result = "beep frequency (A) duration (B) time until played (C)";
            break;
        case "controls_if"    : 
            result = "if (A), do";
            break;
        case "logic_compare"  :
            result = " (A) 'equals' (B)"; 
            break;
        case "logic_operation": 
            result = " (A) 'and/or' (B)"; 
            break;
        case "logic_negate": 
            result = "not (  )"; 
            break;
        case "logic_boolean":
            result = "'true or false'"; 
            break;
        case "logic_null":
            result = "null";
            break;
        case "logic_ternary":
            result = "Test (A), if true do (B), if false do (C)";
            break;
        case "controls_repeat_ext":
            result = "repeat (10) times";
            break;
        case "controls_whileUntil":
            result = "repeat 'while or until' ( )";
            break;
        case "controls_for":
            result = "count with 'i' from (1) to (10) by (1)";
            break;
        case "controls_forEach":
            result = "for each item 'i' in in list ()";
            break;
        case "controls_flow_statements":
            result = "'break out' of loop";
            break; 
        case "math_number":
            result = "'number'";
            break; 
        case "math_arithmetic":
            result = "(A) '+' (B)";
            break; 
        case "math_single":
            result = "'square root' of (A)";
            break; 
        case "math_trig":
            result = "'trig' ()";
            break; 
        case "math_constant":
            result = "'pi and constants'";
            break; 
        case "math_number_property":
            result = "(number) is 'even'";
            break; 
        case "math_change":
            result = "change (variable) by (1)";
            break; 
        case "math_round":
            result = "'round' (number)";
            break; 
        case "math_on_list":
            result = "'sum' of list ( )";
            break; 
        case "math_modulo":
            result = "remainder of (A) divided by (B)";
            break; 
        case "math_constrain":
            result = "constrain (A) between low (1) and high (100)";
            break; 
        case "math_random_int":
            result = "random integer from (1) to (100)";
            break; 
        case "math_random_float":
            result = "random fraction";
            break; 
        case "text":
            result = "'text'";
            break; 
        case "text_join":
            result = "Create text with (A) combined with (B)";
            break; 
        case "text_append":
            result = "to 'item' append text (  )";
            break; 
        case "text_length":
            result = "length of (text)";
            break; 
        case "text_isEmpty":
            result = "(A) is empty";
            break; 
        case "text_indexOf":
            result = "in (text) find 'first or last' occurence of text (A)";
            break; 
        case "text_charAt":
            result = "in text (text) get 'character at index' (A)";
            break; 
        case "text_getSubstring":
            result = "in text (text) get substring from ',index' (A) to 'index' (B) ";
            break; 
        case "text_changeCase":
            result = " to 'upper or lower' case ( )";
            break; 
        case "text_trim":
            result = "trim spaces from 'both sides' of ()";
            break; 
        case "text_print":
            result = "print ( )";
            break; 
        case "text_prompt_ext":
            result = "prompt for 'text' with message ' text'";
            break; 
        case "lists_create_empty":
            result = "create empty list";
            break; 
        case "lists_create_with":
            result = "create list with values (A), (B), (C)";
            break;  
        case "lists_repeat":
            result = "create list with item (A) repeated (5) times";
            break;
        case "lists_length":
            result = "length of ( ) list";
            break;
        case "lists_isEmpty":
            result = "the list (list) is empty";
            break;
        case "lists_indexOf":
            result = "in list (list) find 'first' occurence of item (A)";
            break;
        case "lists_getIndex":
            result = "in list (list) 'get', 'index' (A)";
            break;
        case "lists_setIndex":
            result = "in list (list) 'set' 'index' (A) as (B)";
            break;
        case "lists_getSublist":
            result = "in list (list) get sub-list from 'index' (A) to ',index' (B)";
            break;
        case "lists_split":
            result = "make 'list from text' (A) with delimiter 'comma'";
            break;
        case "colour_picker":
            result = "colour";
            break;
        case "colour_random":
            result = "random colour";
            break;
        case "colour_rgb":
            result = "colour with: red 'Value', blue 'value,', green ',value' ";
            break;
        case "colour_blend":
            result = "blend colour 1 'colour' and colour 2 'colour' with ratio 'decimal'";
            break; 
        case "procedures_defnoreturn":
            result = "function 'do something'";
            break;
        case "procedures_defreturn":
            result = "function 'do something' then return ( )";
            break;
        case "procedures_ifreturn":
            result = "if (A) then return (B)";
            break;
        case "variables_set":
            result = "set 'variable' to (A)";
            break;
        case "variables_get":
            result ="get 'A'";
            break;
        default: 
            result = "custom"; 
            break;
     }

     if(disabled){
        disabledText = "connection doesn't match ";
     }
     return disabledText + result + " block.";
};
