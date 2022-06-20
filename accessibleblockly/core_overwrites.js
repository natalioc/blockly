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
 * @fileoverview All core overwrites, these need to be properly organized.
 * @author lunalovecraft@gmail.com (Luna Meier)
 */

goog.provide('Blockly.Overwrite');

var menuBlocksArr = [];


/**
 * Construct the blocks required by the flyout for the procedure category.
 * @param {!Array.<!Blockly.Block>} blocks List of blocks to show.
 * @param {!Array.<number>} gaps List of widths between blocks.
 * @param {number} margin Standard margin width for calculating gaps.
 * @param {!Blockly.Workspace} workspace The flyout's workspace.
 */
Blockly.Procedures.flyoutCategory = function (blocks, gaps, margin, workspace) {
    if (Blockly.Blocks['procedures_defnoreturn']) {
        var block = Blockly.Block.obtain(workspace, 'procedures_defnoreturn');
        block.initSvg();
        blocks.push(block);
        menuBlocksArr.push(block);//added for blockly navigation.js
        gaps.push(margin * 2);
    }
    if (Blockly.Blocks['procedures_defreturn']) {
        var block = Blockly.Block.obtain(workspace, 'procedures_defreturn');
        block.initSvg();
        blocks.push(block);
        menuBlocksArr.push(block);//added for blockly navigation.js
        gaps.push(margin * 2);
    }
    if (Blockly.Blocks['procedures_ifreturn']) {
        var block = Blockly.Block.obtain(workspace, 'procedures_ifreturn');
        block.initSvg();
        blocks.push(block);
        menuBlocksArr.push(block);//added for blockly navigation.js
        gaps.push(margin * 2);
    }
    if (gaps.length) {
        // Add slightly larger gap between system blocks and user calls.
        gaps[gaps.length - 1] = margin * 3;
    }

    function populateProcedures(procedureList, templateName) {
        for (var x = 0; x < procedureList.length; x++) {
            var block = Blockly.Block.obtain(workspace, templateName);
            block.setFieldValue(procedureList[x][0], 'NAME');
            var tempIds = [];
            for (var t = 0; t < procedureList[x][1].length; t++) {
                tempIds[t] = 'ARG' + t;
            }
            block.setProcedureParameters(procedureList[x][1], tempIds);
            block.initSvg();
            blocks.push(block);
            menuBlocksArr.push(block);//added for blockly navigation.js

            gaps.push(margin * 2);
        }
    }

    var tuple = Blockly.Procedures.allProcedures(workspace.targetWorkspace);
    populateProcedures(tuple[0], 'procedures_callnoreturn');
    populateProcedures(tuple[1], 'procedures_callreturn');
};

/**
 * Construct the blocks required by the flyout for the variable category.
 * @param {!Array.<!Blockly.Block>} blocks List of blocks to show.
 * @param {!Array.<number>} gaps List of widths between blocks.
 * @param {number} margin Standard margin width for calculating gaps.
 * @param {!Blockly.Workspace} workspace The flyout's workspace.
 */
Blockly.Variables.flyoutCategory = function (blocks, gaps, margin, workspace) {
    var variableList = Blockly.Variables.allVariables(workspace.targetWorkspace);
    variableList.sort(goog.string.caseInsensitiveCompare);
    // In addition to the user's variables, we also want to display the default
    // variable name at the top.  We also don't want this duplicated if the
    // user has created a variable of the same name.
    variableList.unshift(null);
    var defaultVariable = undefined;
    for (var i = 0; i < variableList.length; i++) {
        if (variableList[i] === defaultVariable) {
            continue;
        }
        var getBlock = Blockly.Blocks['variables_get'] ?
            Blockly.Block.obtain(workspace, 'variables_get') : null;
        getBlock && getBlock.initSvg();
        var setBlock = Blockly.Blocks['variables_set'] ?
            Blockly.Block.obtain(workspace, 'variables_set') : null;
        setBlock && setBlock.initSvg();
        if (variableList[i] === null) {
            defaultVariable = (getBlock || setBlock).getVars()[0];
        } else {
            getBlock && getBlock.setFieldValue(variableList[i], 'VAR');
            setBlock && setBlock.setFieldValue(variableList[i], 'VAR');
        }
        setBlock && blocks.push(setBlock);
        menuBlocksArr.push(setBlock);//added for blockly navigation.js
        getBlock && blocks.push(getBlock);
        menuBlocksArr.push(getBlock);//added for blockly navigation.js
        if (getBlock && setBlock) {
            gaps.push(margin, margin * 3);
        } else {
            gaps.push(margin * 2);
        }
    }
};

//need avoid calling hotkeys while typing in text input
Blockly.FieldTextInput.prototype.onHtmlInputKeyDown_ = function(e) {
console.log("TYPING MODE ACTIVATED");
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

// //switch back to hotkey mode
// /**
//  * Handle a change to the editor.
//  * @param {!Event} e Keyboard event.
//  * @private
//  */
// Blockly.FieldTextInput.prototype.onHtmlInputChange_ = function(e) {
//   var htmlInput = Blockly.FieldTextInput.htmlInput_;
//   var escKey = 27;
//   if (e.keyCode != escKey) {
//     // Update source block.
//     var text = htmlInput.value;
//     if (text !== htmlInput.oldValue_) {
//       htmlInput.oldValue_ = text;
//       this.setText(text);
//       this.validate_();
//     } else if (goog.userAgent.WEBKIT) {
//       // Cursor key.  Render the source block to show the caret moving.
//       // Chrome only (version 26, OS X).
//       this.sourceBlock_.render();
//     }
//   }
//   keyboardState = "hotkeyMode";
// };

/**
 * Dispose of this block.
 * @param {boolean} healStack If true, then try to heal any gap by connecting
 *     the next statement with the previous statement.  Otherwise, dispose of
 *     all children of this block.
 */
 Blockly.Block.prototype.dispose = function(healStack) {
    console.log("delete1");
    if (!this.workspace) {
      // Already deleted.
      return;
    }
    // Terminate onchange event calls.
    if (this.onchangeWrapper_) {
      this.workspace.removeChangeListener(this.onchangeWrapper_);
    }
    this.unplug(healStack);
    if (Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockDelete(this));
    }
    Blockly.Events.disable();
  
    try {
      // This block is now at the top of the workspace.
      // Remove this block from the workspace's list of top-most blocks.
      if (this.workspace) {
        this.workspace.removeTopBlock(this);
        this.workspace.removeTypedBlock(this);
        // Remove from block database.
        delete this.workspace.blockDB_[this.id];
        this.workspace = null;
      }
  
      // Just deleting this block from the DOM would result in a memory leak as
      // well as corruption of the connection database.  Therefore we must
      // methodically step through the blocks and carefully disassemble them.
  
      if (Blockly.selected == this) {
        Blockly.selected = null;
      }
  
      // First, dispose of all my children.
      for (var i = this.childBlocks_.length - 1; i >= 0; i--) {
        this.childBlocks_[i].dispose(false);
      }
      // Then dispose of myself.
      // Dispose of all inputs and their fields.
      for (var i = 0, input; input = this.inputList[i]; i++) {
        input.dispose();
      }
      this.inputList.length = 0;
      // Dispose of any remaining connections (next/previous/output).
      var connections = this.getConnections_(true);
      for (var i = 0; i < connections.length; i++) {
        var connection = connections[i];
        if (connection.isConnected()) {
          connection.disconnect();
        }
        connections[i].dispose();
      }
    } finally {
      Blockly.Events.enable();
    }
  };