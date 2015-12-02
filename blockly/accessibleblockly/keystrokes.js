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
goog.require('Blockly.Accessibility.Speech');
goog.require('Blockly.Accessibility.TreeView');
goog.require('Blockly.Accessibility.Prefixes');
goog.require('Blockly.Flyout');

//default constructor
Blockly.Accessibility.Keystrokes = function(){

}
var map = [];
var keyboardState = 'hotkeyMode';
//Blockly.Accessibility.Keystrokes.prototype.keyboardState = 'hotkeymode';
Blockly.Accessibility.Keystrokes.prototype.isConnecting  = false;
/**
 * When a mouseup event happens, update the XML selection
 */
document.onmouseup = function(e){
	//console.log('Mouse Up');
	Blockly.Accessibility.Navigation.updateXmlSelection();
};


/**
 * Take care of keypresses for accessibility
 */
document.onkeydown = document.onkeyup = function(e){

	e = e || event;
	map[e.keyCode] = e.type == 'keydown';



	if(keyboardState=='typingMode'){ //if you are typing, hotkeys disabled
		if(map[13]){ //Enter
			keyboardState = 'hotkeyMode';
			Blockly.Accessibility.Navigation.updateXmlSelection();
		}
		return;
	}

//===========================================EDITING BLOCKS=======================================
	else if(keyboardState=='editMode'){ //if you are in editMode, normal hotkeys are disabled
		if(map[27]){ //Escape
			keyboardState = 'hotkeyMode';
			Blockly.Accessibility.Keystrokes.prototype.isConnecting = false;
			Blockly.Accessibility.Navigation.updateXmlSelection();
		}

		else if(map[65]){ //A
			//Navigate to previous field
			Blockly.Accessibility.InBlock.selectPrev();
		}

		else if(map[68]){ //D
			//Navigate to next field
			Blockly.Accessibility.InBlock.selectNext();

		}

		else if(map[87]){ //W
			//Navigate to previous field
			Blockly.Accessibility.InBlock.selectPrev();
		}

		else if(map[83]){ //S
			//Navigate to next field
			Blockly.Accessibility.InBlock.selectNext();

		}

		else if (map[69]) { //E
		    Blockly.Accessibility.InBlock.enterSelected();
		    e.preventDefault(); // Prevent default in case this opens up a typing prompt
		    try { // Try block in case something breaks, we still default back to hotkeymode
		        Blockly.Accessibility.InBlock.enterSelected();
		    }
		    catch (e) {
		        console.log(e);
		    } finally {
		        keyboardState = 'hotkeyMode'; //prevent getting stuck on same block

		    }
		}

		else if(map[67]){ //C
			Blockly.Accessibility.InBlock.selectConnection();
			Blockly.Accessibility.InBlock.enterCurrentBlock();

		    try { // Try block in case something breaks, we still default back to hotkeymode
		        Blockly.Accessibility.InBlock.enterSelected();
		    }
		    catch (e) {
		        console.log(e);
		    } finally {
		    	Blockly.Accessibility.Keystrokes.prototype.isConnecting = true;
		        keyboardState ='hotkeyMode';//prevent getting stuck on same block

		    }
		    //default select the first category in the menu
		    var firstCategory = document.getElementById(":1");
		    firstCategory.focus();

			//keyboardState = 'selectConnectionMode';
		}

		else if(map[13]){ //Enter
			Blockly.Accessibility.InBlock.selectConnection();
			Blockly.Accessibility.InBlock.enterCurrentBlock();


		    try { // Try block in case something breaks, we still default back to hotkeymode
		        Blockly.Accessibility.InBlock.enterSelected();

		    }
		    catch (e) {
		        console.log(e);
		    } finally {
		    	Blockly.Accessibility.Keystrokes.prototype.isConnecting = true;
		 		keyboardState ='hotkeyMode';//prevent getting stuck on same block

		    }

		    //default select the first category in the menu
		    var firstCategory = document.getElementById(":2");
		    firstCategory.setAttribute("tabIndex", 0);
		   	firstCategory.focus();


		}


		else if (map[70]) { //F Add a block to the scene
		    Blockly.Accessibility.InBlock.selectConnection();
		    keyboardState = 'addBlockToConnectionMode';

		    var firstCategory = document.getElementById(":1");
		    firstCategory.focus();
		    Blockly.selected = null;
		}
	}

//===========================================Adding block to connection =======================================
	else if (keyboardState == 'addBlockToConnectionMode') {
	    if (map[70]) { //F
	        keyboardState = 'hotkeyMode';
	        Blockly.Accessibility.InBlock.addBlock();
	    }
	}
//===========================================SELECTING A CONNECTION=============================================
	else if(keyboardState == 'selectConnectionMode'){
	    if(map[65]){ //A
			//Navigate out
			//Blockly.Accessibility.Navigation.traverseOut();
		}

		else if(map[68]){ //D
			//Navigate in
			//Blockly.Accessibility.Navigation.traverseIn();
		}

		else if(map[83]){ //S
			//Navigates down through blocks
			e.preventDefault();
			//Blockly.Accessibility.Navigation.traverseDown();
		}

		else if(map[87]){ //W
			//Navigates up through blocks
			e.preventDefault();
			//Blockly.Accessibility.Navigation.traverseUp();
		}

		else if(map[69]){ //E
			//Edit block of code or edit comment
			keyboardState = 'connectBlocksMode';
			Blockly.Accessibility.InBlock.enterCurrentBlock();

		}
	}
//===========================================connect BLOCKS====================================================
	else if(keyboardState=='connectBlocksMode'){
		console.log(Blockly.Accessibility.InBlock.enterCurrentBlock());
		if(map[27]){ //Escape
			keyboardState = 'hotkeyMode';
			Blockly.Accessibility.Navigation.updateXmlSelection();
		}

		else if(map[65]){ //A
			//Navigate to previous field
			Blockly.Accessibility.InBlock.selectPrev();
		}

		else if(map[68]){ //D
			//Navigate to next field
			Blockly.Accessibility.InBlock.selectNext();
		}

		else if(map[67]){ //C
			Blockly.Accessibility.InBlock.selectConnection();
			keyboardState = 'hotkeyMode';
		}

		else if (map[69]) { //E
		    e.preventDefault(); // Prevent default in case this opens up a typing prompt
		    try { // Try block in case something breaks, we still default back to hotkeymode
		        Blockly.Accessibility.InBlock.enterSelected();
		    }
		    catch (e) {
		        console.log(e);
		    } finally {
		        keyboardState = 'hotkeyMode'; //prevent getting stuck on same block
		    }
		}

	}
//===========================================ADDING BLOCKS=======================================
	else if(keyboardState == 'addBlockMode'){
        if (map[70]) { //F
	        keyboardState = 'hotkeyMode';
	        Blockly.Accessibility.menu_nav.flyoutToWorkspace();
	    }

        else if (map[83]) { //S
        //Navigates down through blocks
	        e.preventDefault();
	        Blockly.Accessibility.menu_nav.menuNavDown();
	    }

        else if (map[87]) { //W
        //Navigates up through blocks
	        e.preventDefault();
	        Blockly.Accessibility.menu_nav.menuNavUp();
	    }
	}
//===========================================NORMAL HOTKEYS=======================================
	else if(keyboardState=='hotkeyMode'){

	    if (map[17] && map[89]) { //Ctrl Y
	        console.log('Ctrl Y keys pressed');
	        Blockly.Accessibility.Navigation.redo();
	        e.preventDefault();
	    }

	    else if (map[17] && map[90]) { //Ctrl Z
	        console.log('Ctrl Z keys pressed');
	        Blockly.Accessibility.Navigation.undo();
	        e.preventDefault();
	    }

	    else if(map[18] && map[16] && map[67]){ //Alt Shift C
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

		// else if(map[13]){ //Enter
		// 	console.log('Enter key pressed.');
		// 	Blockly.Accessibility.Navigation.updateXmlSelection();
		// }

		else if(map[27]){ //Escape
			console.log('Escape key pressed.');
			//Get out of the current menu
			e.preventDefault();
		}

		else if(map[9]){ //Tab
			//Go through the same level of code
		}

		else if(map[65]){ //A
			if(!Blockly.selected) return;
			if(Blockly.selected.id[0] != ":" && !Blockly.Accessibility.Keystrokes.prototype.isConnecting){
				Blockly.Accessibility.Navigation.traverseOut();
			}
		}

		else if(map[67]){ //C
			//Add a comment
			Blockly.Accessibility.addComment();
			keyboardState = 'typingMode';
			e.preventDefault();
		}

		else if(map[68]){ //D
			//Navigate in
			if(!Blockly.selected) return;
			if(Blockly.selected.id[0] != ":" && !Blockly.Accessibility.Keystrokes.prototype.isConnecting){
				Blockly.Accessibility.Navigation.traverseIn();
			}
		}

		else if(map[69]){ //E
			//Edit block of code or edit comment
			if (Blockly.Accessibility.InBlock.enterCurrentBlock()) { // Returns false if nothing is selected
			    keyboardState = 'editMode';
			}
		}

		else if (map[70]) { //F Add a block to the scene

		    keyboardState = 'addBlockMode';
		    var firstCategory = document.getElementById(":1");
		    firstCategory.focus();
		    Blockly.selected = null;
		}

		else if(map[71]){ //G
			//Blockly.Accessibility.TreeView.commentOrBlockJump();
			//Goto the block the comment that is currently selected is from
			//Alternatively goto the comment that is connected to the currently selected block
			Blockly.Accessibility.InBlock.addBlock();
			Blockly.Accessibility.Keystrokes.prototype.isConnecting = false;
			document.getElementById("blockReader").focus();
		}

		else if(map[77]){ //M
			//This should initiate menu mode
			//This should initiate a menu to add a block using hotkeys
			keyboardState='menuMode';
		}

		else if(map[78]){ //N
			Blockly.Accessibility.Prefixes.getInfoBox();//currently placed here until button is found to hide and show the infobox
			//Initiate a navigate search function
		}

		else if(map[82]){ //R
			//Jumps to the top of the currently selected container
			//Blockly.Accessibility.Navigation.jumpToTopOfSection();
			Blockly.Accessibility.Prefixes.formatTreeView();
			//Blockly.Accessibility.TreeView.addBlockComments();
		}

		else if(map[83]){ //S
			// e.preventDefault();

			if(!Blockly.selected) return;

			//if not on toolbox navigate down through blocks
			if(Blockly.selected.id[0] != ":"  && !Blockly.Accessibility.Keystrokes.prototype.isConnecting){
				Blockly.Accessibility.Navigation.traverseDown();
			}

		}

		else if(map[87]){ //W
			// e.preventDefault();
			//if not on the toolbox navigate up through blocks
			if(!Blockly.selected) return;
			if(Blockly.selected.id[0] != ":" && !Blockly.Accessibility.Keystrokes.prototype.isConnecting){
				Blockly.Accessibility.Navigation.traverseUp();
			}
		}

		//============Jumping to specific category===============
		else{
			//loop through the numbers on keyboard to access menu
			for(var i = 48; i < 58; i++){

				var category;
				//map each number to its key
			    if(map[i]){

					var count = i % 48;

					//9 has different id name
					if(count == 9){
						category = document.getElementById(":a");
					}

					else{
						var tempName = ":" + (count+1);
						category = document.getElementById(tempName);
					}

					category.focus();
					count++;
				}
			}
		}
	}
};
//==========================================================OVERWRITES================================================================
/*
{OVERWRITE}
need avoid calling hotkeys while typing in text input
*/
Blockly.FieldTextInput.prototype.onHtmlInputKeyDown_ = function(e) {
  keyboardState = "typingMode";
  
  var htmlInput = Blockly.FieldTextInput.htmlInput_;
  var enterKey = 13, escKey = 27;

  if (e.keyCode == enterKey) {
    Blockly.WidgetDiv.hide();
  } 

  else if (e.keyCode == escKey) {
    this.setText(htmlInput.defaultValue);
    Blockly.WidgetDiv.hide();
  }

};

/**
 * Close the editor, save the results, and dispose of the editable
 * text field's elements.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.FieldTextInput.prototype.widgetDispose_ = function() {
  keyboardState = "hotkeyMode";

  var thisField = this;
  return function() {
    var htmlInput = Blockly.FieldTextInput.htmlInput_;
    // Save the edit (if it validates).
    var text = htmlInput.value;
    if (thisField.sourceBlock_ && thisField.changeHandler_) {
      var text1 = thisField.changeHandler_(text);
      if (text1 === null) {
        // Invalid edit.
        text = htmlInput.defaultValue;
      } else if (text1 !== undefined) {
        // Change handler has changed the text.
        text = text1;
      }
    }
    thisField.setText(text);
    thisField.sourceBlock_.rendered && thisField.sourceBlock_.render();
    Blockly.unbindEvent_(htmlInput.onKeyDownWrapper_);
    Blockly.unbindEvent_(htmlInput.onKeyUpWrapper_);
    Blockly.unbindEvent_(htmlInput.onKeyPressWrapper_);
    Blockly.unbindEvent_(htmlInput.onWorkspaceChangeWrapper_);
    Blockly.FieldTextInput.htmlInput_ = null;
    // Delete style properties.
    var style = Blockly.WidgetDiv.DIV.style;
    style.width = 'auto';
    style.height = 'auto';
    style.fontSize = '';
  };
};