'use strict';

/**
*Copyright [2015] [Rachael Bosley, Luna Meier]
*
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

var map = [];
var keyboardState = 'hotkeyMode';

/**
 * When a mouseup event happens, update the XML selection
 */
document.onmouseup = function(e){
	console.log('Mouse Up');
	updateXmlSelection();
	callImportantBlocks();
};

/**
 * Take care of keypresses for accessibility
 */
document.onkeydown = function(e){
	
	e = e || event;
	map[e.keyCode] = e.type == 'keydown';	
	
	if(keyboardState=='typingMode'){ //if you are typing, hotkeys disabled
		//if(map[13]){ //Enter
		if(e.keyCode == 13){
			console.log('Enter key pressed.');
			keyboardState = 'hotkeyMode';
			updateXmlSelection();
		}
		return;
	}	

	if(keyboardState=='menuMode'){ //within the category select menu
		//if(map[49]){ //1 
		if(e.keyCode == 49){
			console.log("Within A menu, 1 key pressed.");
			//Enter the first list
			keyboardState='menuKeyOne';
		}
		//if(map[50]){ //2
		if(e.keyCode == 50){
			console.log("Within A menu, 2 key pressed.");
			//Enter the second list
			keyboardState='menuKeyTwo';
		}
		//if(map[51]){ //3
		if(e.keyCode == 51){
			console.log("Within A menu, 3 key pressed.");
			//Enter the third list
			keyboardState='menuKeyThree';
		}
		//if(map[52]){ //4
		if(e.keyCode == 52){
			console.log("Within A menu, 4 key pressed.");
			//Enter the fourth list
			keyboardState='menuKeyFour';
		}
		//if(map[53]){ //5
		if(e.keyCode == 53){
			console.log("Within A menu, 5 key pressed.");
			//Enter the fifth list
			keyboardState='menuKeyFive';
		}
		//if(map[54]){ //6
		if(e.keyCode == 54){
			console.log("Within A menu, 6 key pressed.");
			//Enter the sixth list
			keyboardState='menuKeySix';
		}
		//if(map[55]){ //7
		if(e.keyCode == 55){
			console.log("Within A menu, 7 key pressed.");
			//Enter the seventh list
			keyboardState='menuKeySeven';
		}
		//if(map[56]){ //8
		if(e.keyCode == 56){
			console.log("Within A menu, 8 key pressed.");
			//Enter the eighth list
			keyboardState='menuKeyEight';
		}
		//If another block category is added, add it down here
	}

	if(keyboardState=='hotkeyMode'){	
		//if (map[17] && map[90]){ //Ctrl Z
		if(e.keyCode == 17 && e.keyCode == 90){
			console.log("Control Z pressed.");
		    //Need to implement Undo
			undo();
			e.preventDefault();
		}
		
		//else if(map[17] && map[89]){ //Ctrl Y
		else if(e.keyCode == 17 && e.keyCode==89){
			console.log("Control Y pressed.");
		    //Need to implement Redo
			redo();
			e.preventDefault();
		}
		
		//else if(map[18] && map[16] && map[67]){ //Alt Shift C
		else if(e.keyCode == 18 && e.keyCode ==16 && e.keyCode ==67){
			console.log("Alt Shift C keys pressed.");
			//Keystroke for collapsing or expanding a block
			toggleCollapse();
			e.preventDefault();
		}
		
		//else if(map[18] && map[16] && map[69]){ //Alt Shift E
		else if(e.keyCode == 18 && e.keyCode ==16 && e.keyCode ==69){
			console.log("Alt Shift E keys pressed.");
			//Keystroke for enabling or disabling a block
			toggleDisable();
			e.preventDefault();
			updateXmlSelection();
		}
		
		//else if(map[18] && map[16] && map[68]){ //Alt Shift D
		else if(e.keyCode == 18 && e.keyCode ==16 && e.keyCode ==68){
			console.log("Alt Shift D keys pressed.");
			//Duplicate a block
			duplicateSelected();
			e.preventDefault();
			updateXmlSelection();
		}
		
		//else if(map[9] && map[16]){ //Tab Shift
		else if(e.keyCode == 9 && e.keyCode ==16){
			console.log("Tab Shift pressed.");
			//Go backwards through the same level of code
		}
		
		//else if(map[9]){ //Tab
		else if(e.keyCode == 9){
			console.log("Tab key pressed.");
			//Go through the same level of code
		}
			
		//else if(map[188]){ //Comma
		else if(e.keyCode == 188){
			console.log("Comma key pressed.");
			//Traverse forward within a block with fields
		}
		
		//else if(map[190]){ //Period
		else if(e.keyCode == 190){
			console.log("Period key pressed.");
			//Traverse backward within a block with fields
		}
		
		//else if(map[46]){ //Delete
		else if(e.keyCode == 46){
			console.log("Delete key pressed.");
			//Delete the currently selected item
			updateXmlSelection();
			e.preventDefault();
		}
		
		//else if(map[27]){ //Escape
		else if(e.keyCode == 27){
			console.log("Escape key pressed.");
			//Get out of the current menu
			e.preventDefault();
		}
		
		//else if(map[77]){ //M
		else if(e.keyCode == 77){
			console.log("M key pressed.");
			//This should initiate menu mode
			//This should initiate a menu to add a block using hotkeys
			keyboardState='menuMode';	
		}
		
		//else if(map[67]){ //C
		else if(e.keyCode == 67){
			//Add a comment
			console.log("C key pressed.");
			addComment();
		}
		
		//else if(map[69]){ //E
		else if(e.keyCode == 69){
			console.log("E key pressed.");
			getImportantBlocks();
			//Edit block of code or edit comment
		}
		
		//else if(map[71]){ //G
		else if(e.keyCode == 71){
			console.log("G key pressed.");
			commentOrBlockJump();
			//Goto the block the comment that is currently selected is from
			//Alternatively goto the comment that is connected to the currently selected block
		}
		
		//else if(map[72]){ //H
		else if(e.keyCode == 72){
			console.log("H key pressed.");
			helpSelectedBlock();
			//Link to the help page for the selected block
		}
		
		//else if(map[78]){ //N
		else if(e.keyCode == 78){
			console.log("N key pressed.");
			getInfoBox();//currenly placed here until button is found to hide and show the infobox
			//Initiate a navigate search function
		}
		
		//else if(map[82]){ //R
		else if(e.keyCode == 82){
			//Jumps to the top of the currently selected container
			console.log("R key pressed.");
			jumpToTopOfSection();
		}
		
		//else if(map[13]){ //Enter
		else if(e.keyCode == 13){
			console.log('Enter key pressed.');
			updateXmlSelection();
			//temporarily navigates menu
		}
		
		//Arrow keys for development purposes.  Switch as needed for proper usage.
		
		//else if(map[37] || map[65]){ //left arrow or A
		else if(e.keyCode == 37 || e.keyCode == 65){
			traverseOut();
		}
		
		//else if(map[38] || map[87]){ //up arrow or W
		else if(e.keyCode == 38 || e.keyCode==87){
			e.preventDefault();
			traverseUp();
			menuNav();
		}
		
		//else if(map[39] || map[68]){ //right arrow or D
		else if(e.keyCode == 39 || e.keyCode == 68){
			traverseIn();

		}
		
		//else if(map[40] || map[83]){ //down arrow or S
		else if(e.keyCode == 40 || e.keyCode==83){
			e.preventDefault();
			traverseDown();
			menuNav();

		}

		//End of development block
	}
};



