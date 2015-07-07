'use strict';

/**
*Copyright 2015 Luna Meier, Rachael Bosley
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

/**
 * @fileoverview Core accessibility library for Accessible Blockly Plugin
 * @author lunalovecraft@gmail.com (Luna Meier)
 */

goog.provide('Blockly.Accessibility');


//#region ACCESSIBILITY_OVERRIDES

 /**
 * Initialize accessibility properties
 * @override
 */
Blockly.Toolbox.TreeNode.prototype.initAccessibility = function() {
  goog.ui.tree.BaseNode.prototype.initAccessibility.call(this);
  
  var el = this.getElement();
  el.setAttribute('tabIndex', 0);
  
  //Register the onKeyDown handler because nothing else does
  Blockly.bindEvent_(el, 'keydown', this, this.onKeyDown);
};

/**
 * Handles a key down event.
 * @param {!goog.events.BrowserEvent} e The browser event.
 * @return {boolean} The handled value.
 * @override
 */
Blockly.Toolbox.TreeNode.prototype.onKeyDown = function(e) {
  var handled = true;
  switch (e.keyCode) {
    case goog.events.KeyCodes.RIGHT:
    case goog.events.KeyCodes.ENTER:
      if (e.altKey) {
        break;
      }
      // Expand icon.
      if (this.hasChildren() && this.isUserCollapsible_) {
        this.setExpanded(true);
        this.select();
      } 
      else{
        this.select();
      }
      break;
    case goog.events.KeyCodes.LEFT:
      if (e.altKey) {
        break;
      }
      this.setExpanded(false);
      this.getTree().setSelectedItem(null);
      break;
    default:
      handled = false;
  }

  if (handled) {
    e.preventDefault();
    var t = this.getTree();
    if (t) {
      // clear type ahead buffer as user navigates with arrow keys
      t.clearTypeAhead();
    }
    this.updateRow();
  }

  return handled;
};

//#endregion

//#region HELPER_FUNCTIONS

/**
 * Adds a comment to the selected block
 */
Blockly.Accessibility.addComment = function(){
	if(!Blockly.selected.comment){
		Blockly.selected.setCommentText('');
	}	
};

/**
 * Expands the selected block if it is collapsed or collapses the selected block if it isn't
 */
Blockly.Accessibility.toggleCollapse = function(){
	Blockly.selected.setCollapsed(!Blockly.selected.collapsed_);
};

/**
 * Enables the selected block if it is disabled or disables the selected block if it is enabled
 */
Blockly.Accessibility.toggleDisable = function(){
	Blockly.selected.setDisabled(!Blockly.selected.disabled);
};

/**
 * Duplicates the selected block
 */
Blockly.Accessibility.duplicateSelected = function(){
	Blockly.selected.duplicate_();
};

/**
 * Toggles inline for blocks so values are either external or internal
 */
Blockly.Accessibility.toggleInline = function(){
	Blockly.selected.setInputsInline(!Blockly.selected.inputsInline);
};

/**
 * Calls the help function for the selected block
 */
Blockly.Accessibility.helpSelectedBlock = function(){
	Blockly.selected.showHelp_();
};

//#endregion