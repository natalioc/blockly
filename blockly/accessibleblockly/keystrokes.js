'use strict';

/**
*Copyright [2015] [Rachael Bosley, Luna Meier, Mary Spencer]
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
	Blockly.Accessibility.Navigation.updateXmlSelection();
	Blockly.Accessibility.TreeView.callImportantBlocks();
};


/**
 * Take care of keypresses for accessibility
 */
document.onkeydown = document.onkeyup = function(e){
	
	e = e || event;
	map[e.keyCode] = e.type == 'keydown';	
	
	if(keyboardState=='typingMode'){ //if you are typing, hotkeys disabled
		if(map[13]){ //Enter
			console.log('Enter key pressed.');
			keyboardState = 'hotkeyMode';
			Blockly.Accessibility.Navigation.updateXmlSelection();
		}
		return;
	}	

	if(keyboardState=='menuMode'){ //within the category select menu
		if(map[49]){ //1 
			console.log("Within A menu, 1 key pressed.");
			//Enter the first list
			keyboardState='menuKeyOne';
		}
		if(map[50]){ //2
			console.log("Within A menu, 2 key pressed.");
			//Enter the second list
			keyboardState='menuKeyTwo';
		}
		if(map[51]){ //3
			console.log("Within A menu, 3 key pressed.");
			//Enter the third list
			keyboardState='menuKeyThree';
		}
		if(map[52]){ //4
			console.log("Within A menu, 4 key pressed.");
			//Enter the fourth list
			keyboardState='menuKeyFour';
		}
		if(map[53]){ //5
			console.log("Within A menu, 5 key pressed.");
			//Enter the fifth list
			keyboardState='menuKeyFive';
		}
		if(map[54]){ //6
			console.log("Within A menu, 6 key pressed.");
			//Enter the sixth list
			keyboardState='menuKeySix';
		}
		if(map[55]){ //7
			console.log("Within A menu, 7 key pressed.");
			//Enter the seventh list
			keyboardState='menuKeySeven';
		}
		if(map[56]){ //8
			console.log("Within A menu, 8 key pressed.");
			//Enter the eighth list
			keyboardState='menuKeyEight';
		}
		//If another block category is added, add it down here
	}

	if(keyboardState=='hotkeyMode'){	

	    if(map[18] && map[16] && map[67]){ //Alt Shift C
			console.log("Alt Shift C keys pressed.");
			//Keystroke for collapsing or expanding a block
			Blockly.Accessibility.toggleCollapse();
			e.preventDefault();
		}

		else if(map[18] && map[16] &&map[72]){ //Alt Shift H
			console.log("Alt Shift H keys pressed.");
			Blockly.Accessibility.helpSelectedBlock();//Link to the help page for the selected block
			//resets the map in order to fix the bug where every key becomes this key
			map = [];
		}
		//Arrow keys for development purposes.  Switch as needed for proper usage.
		
		else if(map[37] || map[65]){ //left arrow or A
			Blockly.Accessibility.Navigation.traverseOut();
		}
		
		else if(map[38] || map[87]){ //up arrow or W
			e.preventDefault();
			Blockly.Accessibility.Navigation.traverseUp();
			Blockly.Accessibility.Navigation.menuNavUp(); //navigate up through the menu
		}
		
		else if(map[39] || map[68]){ //right arrow or D
			Blockly.Accessibility.Navigation.traverseIn();
		}
		
		else if(map[40] || map[83]){ //down arrow or S
			e.preventDefault();
			Blockly.Accessibility.Navigation.traverseDown();
			Blockly.Accessibility.Navigation.menuNavDown();
		}

		else if(map[18] && map[16] && map[69]){ //Alt Shift E
			console.log("Alt Shift E keys pressed.");
			//Keystroke for enabling or disabling a block
			Blockly.Accessibility.toggleDisable();
			e.preventDefault();
			Blockly.Accessibility.Navigation.updateXmlSelection();
		}
		
		else if(map[18] && map[16] && map[68]){ //Alt Shift D
			console.log("Alt Shift D keys pressed.");
			//Duplicate a block
			Blockly.Accessibility.duplicateSelected();
			e.preventDefault();
			Blockly.Accessibility.Navigation.updateXmlSelection();
		}
		else if(map[9]){ //Tab
			console.log("Tab key pressed.");
			//Go through the same level of code
		}
			
		else if(map[188]){ //Comma
			console.log("Comma key pressed.");
			//Traverse forward within a block with fields
		}
		
		else if(map[190]){ //Period
			console.log("Period key pressed.");
			//Traverse backward within a block with fields
		}
		
		else if(map[46]){ //Delete
			console.log("Delete key pressed.");
			//Delete the currently selected item
			Blockly.Accessibility.Navigation.updateXmlSelection();
			e.preventDefault();
		}
		
		else if(map[27]){ //Escape
			console.log("Escape key pressed.");
			//Get out of the current menu
			e.preventDefault();
		}
		
		else if(map[77]){ //M
			console.log("M key pressed.");
			//This should initiate menu mode
			//This should initiate a menu to add a block using hotkeys
			keyboardState='menuMode';	
		}
		
		else if(map[67]){ //C
			//Add a comment
			console.log("C key pressed.");
			Blockly.Accessibility.addComment();
		}
		
		else if(map[69]){ //E
			console.log("E key pressed.");
			Blockly.Accessibility.TreeView.getImportantBlocks();
			//Edit block of code or edit comment
		}
		
		else if(map[71]){ //G
			console.log("G key pressed.");
			Blockly.Accessibility.TreeView.commentOrBlockJump();
			//Goto the block the comment that is currently selected is from
			//Alternatively goto the comment that is connected to the currently selected block
		}	
		
		else if(map[78]){ //N
			console.log("N key pressed.");
			Blockly.Accessibility.TreeView.getInfoBox();//currently placed here until button is found to hide and show the infobox
			//Initiate a navigate search function
		}
		
		else if(map[82]){ //R
			//Jumps to the top of the currently selected container
			console.log("R key pressed.");
			Blockly.Accessibility.Navigation.jumpToTopOfSection();
		}
		
		else if(map[13]){ //Enter
			console.log('Enter key pressed.');
			Blockly.Accessibility.Navigation.updateXmlSelection();
			//temporarily navigates menu
		}
		//End of development block
	}
};
