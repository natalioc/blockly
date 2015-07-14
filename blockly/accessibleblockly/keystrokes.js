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

goog.provide('Blockly.Accessibility.Keystrokes');
goog.require('Blockly.Accessibility');
goog.require('Blockly.Accessibility.Navigation');
goog.require('Blockly.Accessibility.TreeView');

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

	if(keyboardState=='editMode'){ //if you are in editMode, normal hotkeys are disabled
		if(map[27]){ //Escape
			console.log('Escape key pressed.');
			keyboardState = 'hotkeyMode';
			Blockly.Accessibility.Navigation.updateXmlSelection();
		}
		else if(map[65]){ //A
			//Navigate to previous field
			Blockly.Accessibility.inBlock.selectPrev();
		}
		else if(map[68]){ //D
			//Navigate to next field
			Blockly.Accessibility.Navigation.selectNext();
		}
		else if(map[69]){ //E
			console.log('E key pressed.');
			Blockly.Accessibility.inBlock.enterSelected();
			keyboardState = 'hotkeyMode'; //prevent getting stuck on same block
		}
	}	
	
	if(keyboardState=='hotkeyMode'){	

	    if(map[18] && map[16] && map[67]){ //Alt Shift C
			console.log('Alt Shift C keys pressed.');
			//Keystroke for collapsing or expanding a block
			Blockly.Accessibility.toggleCollapse();
			e.preventDefault();
		}

		else if(map[18] && map[16] && map[68]){ //Alt Shift D
			console.log('Alt Shift D keys pressed.');
			//Duplicate a block
			Blockly.Accessibility.duplicateSelected();
			e.preventDefault();
			Blockly.Accessibility.Navigation.updateXmlSelection();
		}
		
		else if(map[18] && map[16] && map[69]){ //Alt Shift E
			console.log('Alt Shift E keys pressed.');
			//Keystroke for enabling or disabling a block
			Blockly.Accessibility.toggleDisable();
			e.preventDefault();
			Blockly.Accessibility.Navigation.updateXmlSelection();
		}
		
		else if(map[18] && map[16] && map[72]){ //Alt Shift H
			console.log('Alt Shift H keys pressed.');
			Blockly.Accessibility.helpSelectedBlock();//Link to the help page for the selected block
			//resets the map in order to fix the bug where every key becomes this key
			e.preventDefault();
			map = [];
		}

		else if(map[18] && map[16] && map[73]){ //Alt Shift I
			console.log('Alt Shift I keys pressed.');
			//Toggle inline in a block
			Blockly.Accessibility.toggleInline();
			e.preventDefault();
		}
		
		else if(map[188]){ //Comma
		    console.log('Comma key pressed.');
			//Traverse forward within a block with fields
		}
		
		else if(map[190]){ //Period
			console.log('Period key pressed.');
			//Traverse backward within a block with fields
		}
		
		else if(map[46]){ //Delete
			console.log('Delete key pressed.');
			//Delete the currently selected item
			Blockly.Accessibility.Navigation.updateXmlSelection();
			e.preventDefault();
		}
		
		else if(map[13]){ //Enter
			console.log('Enter key pressed.');
			Blockly.Accessibility.Navigation.updateXmlSelection();
			//temporarily navigates menu
		}
		
		else if(map[27]){ //Escape
			console.log('Escape key pressed.');
			//Get out of the current menu
			e.preventDefault();
		}
		
		else if(map[9]){ //Tab
			console.log('Tab key pressed.');
			//Go through the same level of code
		}
		
		else if(map[65]){ //A
			//Navigate out
			Blockly.Accessibility.Navigation.traverseOut();
		}
		
		else if(map[67]){ //C
			//Add a comment
			console.log('C key pressed.');
			Blockly.Accessibility.addComment();
		}
		
		else if(map[68]){ //D
			//Navigate in
			Blockly.Accessibility.Navigation.traverseIn();
		}
		
		else if(map[69]){ //E
			console.log('E key pressed.');
			Blockly.Accessibility.TreeView.getImportantBlocks();
			//Edit block of code or edit comment
			keyboardState = 'editMode';
			Blockly.Accessibility.inBlock.enterCurrentBlock();
		}
		
		else if(map[71]){ //G
			console.log('G key pressed.');
			Blockly.Accessibility.TreeView.commentOrBlockJump();
			//Goto the block the comment that is currently selected is from
			//Alternatively goto the comment that is connected to the currently selected block
		}
		
		else if(map[77]){ //M
			console.log('M key pressed.');
			//This should initiate menu mode
			//This should initiate a menu to add a block using hotkeys
			keyboardState='menuMode';	
		}	
		
		else if(map[78]){ //N
			console.log('N key pressed.');
			Blockly.Accessibility.TreeView.getInfoBox();//currently placed here until button is found to hide and show the infobox
			//Initiate a navigate search function
		}
		
		else if(map[82]){ //R
			//Jumps to the top of the currently selected container
			console.log('R key pressed.');
			Blockly.Accessibility.Navigation.jumpToTopOfSection();
		}
		
		else if(map[83]){ //S
			//Navigates down through blocks
			e.preventDefault();
			Blockly.Accessibility.Navigation.traverseDown();
			Blockly.Accessibility.Navigation.menuNavDown();
		}
		
		else if(map[87]){ //W
			//Navigates up through blocks
			e.preventDefault();
			Blockly.Accessibility.Navigation.traverseUp();
			Blockly.Accessibility.Navigation.menuNavUp(); //navigate up through the menu
		}
	}
};
