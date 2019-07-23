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
goog.require('Blockly.Comment');
goog.require('Blockly.Bubble');
goog.require('Blockly.Icon');
goog.require('goog.userAgent');
var blockSelected = false;
var currId;
var lastId = 99;

//#region ACCESSIBILITY_OVERRIDES

/**
* Initialize accessibility properties
* @override
*/
// Blockly.Toolbox.TreeNode.prototype.initAccessibility = function() {
//   goog.ui.tree.BaseNode.prototype.initAccessibility.call(this);

//   var el = this.getElement();
//   el.setAttribute('tabIndex', 0);

//   //Register the onKeyDown handler because nothing else does
//   Blockly.bindEvent_(el, 'keydown', this, this.onKeyDown);
// };

// /**
//  * Handles a key down event.
//  * @param {!goog.events.BrowserEvent} e The browser event.
//  * @return {boolean} The handled value.
//  * @override
//  */
// Blockly.Toolbox.TreeNode.prototype.onKeyDown = function(e) {
//   var handled = true;
//   currId = this.id_[1];
//   switch (e.keyCode) {
//     //prevent keys from skipping to categories
//     case 77:
//     case 76:
//     case 84:
//     case 67:
//     case 70:
//     case 86:
//     case 65:
//       e.preventDefault();
//       break;
//     //=======navigating the menu==========  
//     //up
//     case 87:
//       Blockly.Accessibility.MenuNav.menuNavUp();
//       blockSelected = true;
//       break;
//     //down
//     case 83:
//       Blockly.Accessibility.MenuNav.menuNavDown();
//       blockSelected = true;
//       break;

//     //=====Open and close the menu and add blocks======
//     case goog.events.KeyCodes.ENTER:
//       if (e.altKey) {
//         break;
//       }
//       // // Expand icon. 
//       // if (this.hasChildren() && this.isUserCollapsible_) {
//       //   this.setExpanded(true);
//       //   this.select();
//       // }

//       //open the flyout
//       if(!this.getExpanded() || (currId != lastId || lastId == 99)){

//         this.select();
//         this.setExpanded(true);
//         Blockly.Accessibility.MenuNav.menuNavDown();
//         blockSelected = true;
//       }

//       //selecting and connecting blocks
//        else if(this.getExpanded()){
//         //connect to a block on the workspace
//         if(Blockly.Accessibility.Keystrokes.prototype.isConnecting && blockSelected){

//           Blockly.Accessibility.Keystrokes.prototype.isConnecting = false;
//           blockSelected  = false;
//           this.setExpanded(false);

//           Blockly.Accessibility.InBlock.addBlock();
//           document.getElementById("blockReader").focus();
//         }

//         //put block on workspace unconnected
//         else if(!Blockly.Accessibility.Keystrokes.prototype.isConnecting && blockSelected){

//           blockSelected  = false;
//           this.setExpanded(false);

//           Blockly.Accessibility.MenuNav.flyoutToWorkspace();
//           document.getElementById("blockReader").focus();

//         }

//         //toggle closed
//         else{
//           //blockSelected  = false;
//           //this.setExpanded(false);
//           //this.getTree().setSelectedItem(null);
//           //Blockly.Accessibility.Keystrokes.prototype.isConnecting = false;
//           //Blockly.Accessibility.InBlock.unhighlightSelection();
//         }
//       }
//       break;

//     case goog.events.KeyCodes.LEFT:

//       blockSelected  = false;
//       this.setExpanded(false);
//       this.getTree().setSelectedItem(null);
//       break;

//     default:
//       handled = false;
//   }

//   if (handled) {
//     e.preventDefault();
//     var t = this.getTree();
//     if (t) {
//       // clear type ahead buffer as user navigates with arrow keys
//       t.clearTypeAhead();
//     }
//     this.updateRow();
//   }
//   lastId = currId;
//   return handled;
// };



//#endregion

//#region HELPER_FUNCTIONS

/**
 * Adds a comment to the selected block
 */
Blockly.Accessibility.addComment = function () {
  if (!Blockly.selected.comment) {
    Blockly.selected.setCommentText('');

  }
  //Blockly.selected.comment.createEditor_();
  Blockly.selected.comment.setVisible(true);
  Blockly.selected.comment.textareaFocus_();
};

/**
 * removes comment block
 */
Blockly.Accessibility.removeComment = function () {

  Blockly.Accessibility.Navigation.updateXmlSelection();
  Blockly.Accessibility.Prefixes.generateTree();
  Blockly.selected.comment.setVisible(false);
};
/**
 * Expands the selected block if it is collapsed or collapses the selected block if it isn't
 */
Blockly.Accessibility.toggleCollapse = function () {
  console.log("COLLAPSING");
  Blockly.selected.setCollapsed(!Blockly.selected.collapsed_);
};

/**
 * Enables the selected block if it is disabled or disables the selected block if it is enabled
 */
Blockly.Accessibility.toggleDisable = function () {
  Blockly.selected.setDisabled(!Blockly.selected.disabled);
};

/**
 * Duplicates the selected block
 */
Blockly.Accessibility.duplicateSelected = function () {
  Blockly.selected.duplicate_();
};

/**
 * Toggles inline for blocks so values are either external or internal
 */
Blockly.Accessibility.toggleInline = function () {
  Blockly.selected.setInputsInline(!Blockly.selected.inputsInline);
};

/**
 * Calls the help function for the selected block
 */
Blockly.Accessibility.helpSelectedBlock = function () {

  //Blockly.selected.showHelp_();

  //set up the initial urls 
  var urlPt1 = "./quick_reference/";
  var urlPt2;
  var fullUrl;

  //get the appropriate file
  switch (Blockly.selected.type.substr(0, 3)) {

    case "con":
    case "log":
      urlPt1 += "logic.html";
      break;

    default:
      break;
  }

  //jump to a specific block on the page 
  urlPt2 = "#" + Blockly.selected.type;

  //combine the strings and open new tab with the help
  fullUrl = urlPt1 + urlPt2;
  window.open(fullUrl, '_blank');
};

// Play audio cue based on the audio settings.
Blockly.Accessibility.PlayAudioCues = function (audioCueIdentifier) {

  if (!window.audioSettings) {
    workspace.getAudioManager().play(audioCueIdentifier);
  } else if (!window.audioSettings.hasOwnProperty(audioCueIdentifier)
    || window.audioSettings[audioCueIdentifier]
  ) {
    workspace.getAudioManager().play(audioCueIdentifier);
  }
}

//#endregion