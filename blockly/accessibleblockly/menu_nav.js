
'use strict';

goog.provide('Blockly.Accessibility.MenuNav');



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
* File overview: this file handles using the keyboard to navigate the flyout
*/



/*
 * class to handle menu navigation
 * @constructor
 */
Blockly.Accessibility.MenuNav = function(){

};

/*
*   Object holding variables for flyout navigation
*   flyoutArr: everytime the flyout opens the blocks in it are added to this array
*   oldLengh : size of the array before a new tab opened 
*   currIndex: index of currently selected block
*   prevIndex: index of last selected block
*   opened   : keep track of when the flyout opens and closes 
*             (needed for selecting blocks when a new category opens)
*   currentFlyoutArr: array containing all currently shown blocks
*/
var menuVars = {
    flyoutArr: [],   
    oldLength: 0,    
    currIndex: 0,    
    prevIndex: 0,
    opened: false, 
    currentFlyoutArr: [],
    blockSelected:false,


    /*
    * Checks if flyout was opened for the first time or first block in newly opened flyout
    * @return{bool}
    */
    isFirstBlock: function() {
        if (menuVars.currIndex <= menuVars.oldLength) {
            return true;
        }

        else if (menuVars.currIndex - 1 < 0) {
            return true;
        }

        else return false;
    },

    /*
    * Checks if second block in flyout selected
    * important for deselecting correct block
    * @return{bool}
    */
    isSecondBlock: function() {
        if (menuVars.currIndex == menuVars.oldLength) {
            return false;
        }
        else if (menuVars.prevIndex != menuVars.oldLength + 1) {
            return false;
        }
        else return true;
    },

    /*
    * Checks if flyout contains only 2 blocks
    * normal looping does not work with only 2
    * @return {bool}
    */
    hasTwoBlocks: function() {
        return (menuVars.flyoutArr.length - menuVars.oldLength != 2) ? false : true;
    },

    /*
    * Checks if flyout only contains 1 block
    * @return{bool}
    */
    hasOneBlock: function() {
        return (menuVars.flyoutArr.length - menuVars.oldLength == 1) ? true : false;
    },

    /*
    * Checks if the user switched directions from up to down.
    * @return {bool}
    */
    switchingDown: function() {
        return (menuVars.prevIndex == menuVars.currIndex + 1) ? true : false;
    },

    /*
    * Checks if the user switched directions from down to up.
    * @return {bool}
    */
    switchingUp: function() {
        return (menuVars.prevIndex == menuVars.currIndex - 1) ? true : false;
    },

     /*
    * Checks if the user is at the top of the flyout
    * @return {bool}
    */
    atTopOfFlyout: function() {

        return (menuVars.currIndex >= menuVars.flyoutArr.length) ? true : false;
    },

    /*
    * Checks if the user is at the bottom of the flyout
    * @return {bool}
    */
    atBottomOfFlyout: function() {
        return (menuVars.currIndex >= menuVars.flyoutArr.length - 1) ? true : false;
    },

    /*
    * Checks if looping from top to bottom
    * @return{bool}
    */
    loopingUp: function() {
        if (menuVars.currIndex <= menuVars.oldLength - 1) {
            return true;
        }

        else if (menuVars.currIndex - 2 < menuVars.oldLength) {
           return (menuVars.prevIndex == menuVars.currIndex - 1) ? true : false;
        }
    },

    /*
    * Checks if looping from bottom to top
    * @return{bool}
    */
    loopingDown: function() {
        if (menuVars.currIndex >= menuVars.flyoutArr.length) {
            return true;
        }

        else if (menuVars.prevIndex == menuVars.currIndex + 1) {

             return (menuVars.currIndex + 2 >= menuVars.flyoutArr.length) ? true : false;
        }
    }
};

Blockly.Toolbox.TreeNode.prototype.initAccessibility = function() {
  goog.ui.tree.BaseNode.prototype.initAccessibility.call(this);
  
  var el = this.getElement();
  el.setAttribute('tabIndex', 0);   
  Blockly.bindEvent_(el, 'keydown', this, this.onKeyDown);
};
 
/*
* Handles Keyboard input in the toolbox/flyout
* @param {event}
*/
Blockly.Toolbox.TreeNode.prototype.onKeyDown = function(e) {
  var handled = true; //used for preventing the screen from scrolling
  switch (e.keyCode) {
    //prevent default letter keys from skipping to categories
    case 77:
    case 76:
    case 84:
    case 67:
    case 70:
    case 86:
      e.preventDefault();
      break;

    //ESCAPE
    //removes highlight if escape is pressed while navigating the menu
    case 27:
        var highlight = Blockly.Accessibility.InBlock.storedHighlight;
        Blockly.Connection.removeHighlight(highlight);
        Blockly.Accessibility.Keystrokes.prototype.isConnecting = false;
        break;

    //W
    case 87:

      //select previous block
      if(this.getExpanded()){
        Blockly.Accessibility.MenuNav.prototype.menuNavUp();
      }

      //select previous category
      else{
        var previousSibling = this.getPreviousSibling(this.selected);

        //if not the top category
        if(previousSibling != null){
           previousSibling.select();
           Blockly.Accessibility.InBlock.disableIncompatibleBlocks();
           document.getElementById(previousSibling.id_).focus();
        }

      }
      break;

    //S
    case 83:

      //select next block
      if(this.getExpanded()){
            Blockly.Accessibility.MenuNav.prototype.menuNavDown();
      }

      //select next category
      else{
        var nextSibling = this.getNextSibling(this.selected);


        //if not the bottome category
        if(nextSibling != null){
             nextSibling.select();
             Blockly.Accessibility.InBlock.disableIncompatibleBlocks();
             document.getElementById(nextSibling.id_).focus();
        }
       
      }
      break;

    //exit flyout to select categories 
    //A
    case 65:

      if(this.getExpanded()){
          this.setExpanded(false);
          menuVars.flyoutArr[menuVars.prevIndex].removeSelect();
          menuVars.blockSelected = false;
      }
    break;

    //move inside the flyout to select blocks
    //D
    case 68:
        this.select();
        this.setExpanded(true);
        Blockly.Accessibility.InBlock.disableIncompatibleBlocks();
        Blockly.Accessibility.MenuNav.prototype.menuNavDown();
        menuVars.blockSelected = true;
    break;

    //ENTER
    case 13:

        //open the flyout
        if(!this.getExpanded()){
            this.select();
            Blockly.Accessibility.InBlock.disableIncompatibleBlocks();
        }

       //selecting and connecting blocks
       else if(this.getExpanded()){

            //connect to a block on the workspace
            if(Blockly.Accessibility.Keystrokes.prototype.isConnecting && menuVars.blockSelected){
              Blockly.Accessibility.Keystrokes.prototype.isConnecting = false;
              menuVars.blockSelected = false;
              this.setExpanded(false);
              this.getTree().setSelectedItem(null);

              Blockly.Accessibility.InBlock.addBlock();
              document.getElementById("blockReader").focus();
            }

            //put block on workspace connected to the last container
            else if(!Blockly.Accessibility.Keystrokes.prototype.isConnecting && menuVars.blockSelected){
              
              menuVars.blockSelected  = false;
              this.setExpanded(false);
              this.getTree().setSelectedItem(null);
              
              /** move or connect new blocks so they dont automatically default to (0,0)**/
              var containers = Blockly.mainWorkspace.getTopBlocks(true);
              var curBlock = menuVars.flyoutArr[menuVars.currIndex];
              var menuBlock = Blockly.selected;

              //if not a statement block
              if(!curBlock.nextConnection){
                //handle procedure(function) blocks
                if(curBlock.type == "procedures_defnoreturn" || curBlock.type == "procedures_defreturn"){
                    Blockly.Accessibility.MenuNav.moveToBottom();
                    //if not 
                    if(containers.length > 0) {
                      Blockly.mainWorkspace.addTopBlock(menuBlock);
                    }
                }
                else{
                    Blockly.Accessibility.Speech.Say("This block should be connected to another block");
                }
              }

              else if(containers.length == 0){
                Blockly.Accessibility.MenuNav.flyoutToWorkspace();
              }

              else{
                 Blockly.Accessibility.MenuNav.connectToLastBlock(menuBlock);
              }
              document.getElementById("blockReader").focus();

            }
        }   
        
    break;

    default:
        handled = false;
    break;
  }

// clear type ahead buffer as user navigates with arrow keys
  if (handled) {
    e.preventDefault();
    var t = this.getTree();
    if (t) {
      t.clearTypeAhead();
    }
    this.updateRow();
  }
  return handled;
};




/**
 * Hide and empty the flyout.
 */
Blockly.Flyout.prototype.hide = function() {
menuVars.opened = false;

 //remove highlight
 var highlight = Blockly.Accessibility.InBlock.storedHighlight;
 Blockly.Connection.removeHighlight(highlight);

  if (!this.isVisible()) {
    return;
  }
  this.svgGroup_.style.display = 'none';
  // Delete all the event listeners.
  for (var x = 0, listen; listen = this.listeners_[x]; x++) {
    Blockly.unbindEvent_(listen);
  }
  this.listeners_.length = 0;
  if (this.reflowWrapper_) {
    Blockly.unbindEvent_(this.reflowWrapper_);
    this.reflowWrapper_ = null;
  }
  // Do NOT delete the blocks here.  Wait until Flyout.show.
  // https://neil.fraser.name/news/2014/08/09/
};


/*
*   Traverse to the next block in the flyout
*/
Blockly.Accessibility.MenuNav.prototype.menuNavDown= function() {
    //prevent this from being called when the flyout is closed
    if (!menuVars.opened) {
        return;
    }

    //handle flyouts with only 2 blocks
    if (menuVars.hasTwoBlocks()) {

        //if bottom block is selected
        if (menuVars.currIndex >= menuVars.flyoutArr.length - 1) {

            menuVars.currIndex = menuVars.oldLength;
            menuVars.prevIndex = menuVars.flyoutArr.length - 1;

            menuVars.flyoutArr[menuVars.currIndex].addSelect();
            menuVars.flyoutArr[menuVars.prevIndex].removeSelect();

            menuVars.prevIndex = menuVars.oldLength;
        }

        //if top block is selected
        else if (menuVars.currIndex <= menuVars.oldLength) {

            menuVars.currIndex = menuVars.flyoutArr.length - 1;
            menuVars.prevIndex = menuVars.oldLength;

            menuVars.flyoutArr[menuVars.currIndex].addSelect();
            menuVars.flyoutArr[menuVars.prevIndex].removeSelect();

            menuVars.prevIndex = menuVars.flyoutArr.length - 1;

        }
        return;
    }
    //if not the first time the flyout is opened
    if (!menuVars.isFirstBlock()) {

        menuVars.flyoutArr[menuVars.currIndex - 1].removeSelect();
    }

    //handle looping through flyout
    if (menuVars.loopingDown()) {

        menuVars.currIndex = menuVars.oldLength;
        menuVars.prevIndex = menuVars.flyoutArr.length - 1;

        menuVars.flyoutArr[menuVars.prevIndex].removeSelect();
    }



   //handle switching directions
   if (menuVars.switchingDown()) {

        menuVars.flyoutArr[menuVars.prevIndex].removeSelect();
        menuVars.currIndex += 2;
    }

    //select next and update
    menuVars.flyoutArr[menuVars.currIndex].addSelect();

    //read selected
    Blockly.Accessibility.MenuNav.readToolbox();

    menuVars.prevIndex = menuVars.currIndex;
    menuVars.currIndex++;

};




/*
*   Traverse to the previous block in the flyout
*/
Blockly.Accessibility.MenuNav.prototype.menuNavUp = function() {
    if (!menuVars.opened) {
        return;
    }

    //if flyout has only 2 blocks
    if (menuVars.hasTwoBlocks()) {

        //bottom block
        if (menuVars.currIndex == menuVars.flyoutArr.length - 1) {

            menuVars.currIndex = menuVars.oldLength;
            menuVars.prevIndex = menuVars.oldLength;

            menuVars.flyoutArr[menuVars.currIndex].addSelect();
            menuVars.flyoutArr[menuVars.flyoutArr.length - 1].removeSelect();
        }

        //top block
        else if (menuVars.currIndex == menuVars.oldLength) {

            menuVars.currIndex = menuVars.flyoutArr.length - 1;
            menuVars.prevIndex = menuVars.flyoutArr.length - 1;

            menuVars.flyoutArr[menuVars.currIndex].addSelect();
            menuVars.flyoutArr[menuVars.oldLength].removeSelect();
        }
        return;
    }

    //remove select
    //not first time opened || not second item on list
    if (!menuVars.isSecondBlock()) {
        menuVars.flyoutArr[menuVars.prevIndex].removeSelect();
    }

    //handle loops
    //top block selected || only 1 block in flyout|| trying to switch directions at the top of the flyout
    if (menuVars.hasOneBlock() || menuVars.loopingUp()) {

        menuVars.prevIndex = menuVars.oldLength;
        menuVars.currIndex = menuVars.flyoutArr.length - 1;

        menuVars.flyoutArr[menuVars.prevIndex].removeSelect();
    }



    //handle switching from down to up
    //normal switch scenario && not the first block
    if (menuVars.switchingUp() && !menuVars.isFirstBlock()) {

        menuVars.flyoutArr[menuVars.prevIndex].removeSelect();
        menuVars.currIndex -= 2;
    }


    menuVars.flyoutArr[menuVars.currIndex].addSelect();

    //read selected
    Blockly.Accessibility.MenuNav.readToolbox();


    menuVars.prevIndex = menuVars.currIndex;
    menuVars.currIndex--;
};



//============The following are minor overwrites of existing blockly functions to enable flyout navigation======================


/**
 * {OVERWRITE} adds blocks to separate array for traversing the flyout
 * Construct the blocks required by the flyout for the procedure category.
 * @param {!Array.<!Blockly.Block>} blocks List of blocks to show.
 * @param {!Array.<number>} gaps List of widths between blocks.
 * @param {number} margin Standard margin width for calculating gaps.
 * @param {!Blockly.Workspace} workspace The flyout's workspace.
 */
Blockly.Procedures.flyoutCategory = function (blocks, gaps, margin, workspace) {
    menuVars.opened    = true;

    if (Blockly.Blocks['procedures_defnoreturn']) {
        var block = Blockly.Block.obtain(workspace, 'procedures_defnoreturn');
        block.initSvg();
        blocks.push(block);
        menuVars.flyoutArr.push(block);//added for blockly navigation.js
        gaps.push(margin * 2);
    }
    if (Blockly.Blocks['procedures_defreturn']) {
        var block = Blockly.Block.obtain(workspace, 'procedures_defreturn');
        block.initSvg();
        blocks.push(block);
        menuVars.flyoutArr.push(block);//added for blockly navigation.js
        gaps.push(margin * 2);
    }
    if (Blockly.Blocks['procedures_ifreturn']) {
        var block = Blockly.Block.obtain(workspace, 'procedures_ifreturn');
        block.initSvg();
        blocks.push(block);
        menuVars.flyoutArr.push(block);//added for blockly navigation.js
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
            menuVars.flyoutArr.push(block);//added for blockly navigation.js

            gaps.push(margin * 2);
        }
    }

    var tuple = Blockly.Procedures.allProcedures(workspace.targetWorkspace);
    populateProcedures(tuple[0], 'procedures_callnoreturn');
    populateProcedures(tuple[1], 'procedures_callreturn');
};

/**
 * {Overwrite} tracks status of flyout and updates the array of current blocks.
 * Show and populate the flyout.
 * @param {!Array|string} xmlList List of blocks to show.
 *     Variables and procedures have a custom set of blocks.
 */
Blockly.Flyout.prototype.show = function(xmlList){
    menuVars.currentFlyoutArr = [];
    menuVars.opened    = true;
    menuVars.oldLength = menuVars.flyoutArr.length; //update the length of the last array 


    if(menuVars.oldLength > 0){ //ignore first time opening
        menuVars.currIndex  = menuVars.oldLength;
    }

    //disable else and else if mutator blocks if not being used
    // if(menuVars.flyoutArr[0] && (menuVars.flyoutArr[8].type == "logic_ternary")){
    //     console.log("IN FIRST IF");
    //     if(Blockly.selected && (Blockly.selected.type == "logic_if" || Blockly.selected.type == "logic_elseif")){
    //         console.log("IN 1");
    //         menuVars.flyoutArr[menuVars.flyoutArr.length-8].disabled = false;
    //     }
    //     else{

    //       console.log("IN 2");
    //       menuVars.flyoutArr[7].disabled = false;
    //       // var toolboxChoices = Blockly.Accessibility.MenuNav.getToolboxChoices();
    //       // toolboxChoices[1].disabled = true;  
    //       // toolboxChoices[1].updateDisabled();
    //       // console.log(toolboxChoices[1]);
    //     }
    // }

   


    // Delete any blocks from a previous showing.
    var blocks = this.workspace_.getTopBlocks(false);
    for (var x = 0, block; block = blocks[x]; x++) {
        if (block.workspace == this.workspace_) {
            block.dispose(false, false);
        }
    }
    // Delete any background buttons from a previous showing.
    for (var x = 0, rect; rect = this.buttons_[x]; x++) {
        goog.dom.removeNode(rect);
    }
    this.buttons_.length = 0;

    var margin = this.CORNER_RADIUS;
    this.svgGroup_.style.display = 'block';

    // Create the blocks to be shown in this flyout.
    var blocks = [];
    var gaps = [];
    if (xmlList == Blockly.Variables.NAME_TYPE) {
        // Special category for variables.
        Blockly.Variables.flyoutCategory(blocks, gaps, margin,
            /** @type {!Blockly.Workspace} */ (this.workspace_));
    } else if (xmlList == Blockly.Procedures.NAME_TYPE) {
        // Special category for procedures.
        Blockly.Procedures.flyoutCategory(blocks, gaps, margin,
            /** @type {!Blockly.Workspace} */ (this.workspace_));
    } else {
        for (var i = 0, xml; xml = xmlList[i]; i++) {
            if (xml.tagName && xml.tagName.toUpperCase() == 'BLOCK') {
                var block = Blockly.Xml.domToBlock(
                    /** @type {!Blockly.Workspace} */(this.workspace_), xml);
                blocks.push(block);
                menuVars.flyoutArr.push(block);
                menuVars.currentFlyoutArr.push(block);
                gaps.push(margin * 3);
            }
        }
    }
    // Lay out the blocks vertically.
    var cursorY = margin;
    for (var i = 0, block; block = blocks[i]; i++) {
        var allBlocks = block.getDescendants();
        for (var j = 0, child; child = allBlocks[j]; j++) {
            // Mark blocks as being inside a flyout.  This is used to detect and
            // prevent the closure of the flyout if the user right-clicks on such a
            // block.
            child.isInFlyout = true;
            // There is no good way to handle comment bubbles inside the flyout.
            // Blocks shouldn't come with predefined comments, but someone will
            // try this, I'm sure.  Kill the comment.
            child.setCommentText(null);
        }
        block.render();
        var root = block.getSvgRoot();
        var blockHW = block.getHeightWidth();
        var x = this.RTL ? 0 : margin + Blockly.BlockSvg.TAB_WIDTH;
        block.moveBy(x, cursorY);
        cursorY += blockHW.height + gaps[i];

        // Create an invisible rectangle under the block to act as a button.  Just
        // using the block as a button is poor, since blocks have holes in them.
        var rect = Blockly.createSvgElement('rect', { 'fill-opacity': 0 }, null);
        // Add the rectangles under the blocks, so that the blocks' tooltips work.
        this.workspace_.getCanvas().insertBefore(rect, block.getSvgRoot());
        block.flyoutRect_ = rect;
        this.buttons_[i] = rect;

        if (this.autoClose) {
            this.listeners_.push(Blockly.bindEvent_(root, 'mousedown', null,
                this.createBlockFunc_(block)));
        } else {
            this.listeners_.push(Blockly.bindEvent_(root, 'mousedown', null,
                this.blockMouseDown_(block)));
        }
        this.listeners_.push(Blockly.bindEvent_(root, 'mouseover', block,
            block.addSelect));
        this.listeners_.push(Blockly.bindEvent_(root, 'mouseout', block,
            block.removeSelect));
        this.listeners_.push(Blockly.bindEvent_(rect, 'mousedown', null,
            this.createBlockFunc_(block)));
        this.listeners_.push(Blockly.bindEvent_(rect, 'mouseover', block,
            block.addSelect));
        this.listeners_.push(Blockly.bindEvent_(rect, 'mouseout', block,
            block.removeSelect));
    }



    // IE 11 is an incompetant browser that fails to fire mouseout events.
    // When the mouse is over the background, deselect all blocks.
    var deselectAll = function (e) {
        var blocks = this.workspace_.getTopBlocks(false);
        for (var i = 0, block; block = blocks[i]; i++) {
            block.removeSelect();
        }
    };
    this.listeners_.push(Blockly.bindEvent_(this.svgBackground_, 'mouseover',
        this, deselectAll));

    this.width_ = 0;
    this.reflow();

    this.filterForCapacity_();

    // Fire a resize event to update the flyout's scrollbar.
    Blockly.fireUiEventNow(window, 'resize');
    this.reflowWrapper_ = Blockly.bindEvent_(this.workspace_.getCanvas(),
    'blocklyWorkspaceChange', this, this.reflow);
    this.workspace_.fireChangeEvent();


};

/**
 * When the selection changes, the block name is updated for screenreader
 */
 Blockly.Accessibility.MenuNav.readToolbox = function(){
    var blockSvg = menuVars.flyoutArr[menuVars.currIndex];
    var active   = document.activeElement;
    var lastCategory; //track the category so that it does not deselect

    if(blockSvg == undefined){
        return;
    }
    var say     = Blockly.Accessibility.Speech.blockToString(blockSvg.type, blockSvg.disabled);
    var readBox = document.getElementById("blockReader");


    //if category is selected save it (all categories begin with : )
    //then label with aria attributes so that any change will be announced
    if(active.id[0] ==":"){
        lastCategory = active;
        lastCategory.setAttribute("aria-owns", "readBox");
        lastCategory.setAttribute("aria-labelledBy", "readBox"); 
    }
        readBox.innerHTML = say;

    console.log(say);
};

Blockly.Accessibility.MenuNav.flyoutToWorkspace = function(){

    var workspaceBlocksString = "";//text of what is on the workspace
    var workspaceBlocks;           //xml of what is on the workspace
    var incompleteXml;             //xml string before the chosen block has been added
    var completeXmlStr;            //string of xml to be added to workspace
    var xml;                       //dom version of the xml to be added to the workspace

    //block svg to block xml then add to workspace
    var blockXML = Blockly.Xml.blockToDom_(menuVars.flyoutArr[menuVars.prevIndex]);//the current block tab on from the flyout
    var block    = Blockly.Block.obtain(workspace, blockXML.getAttribute("type"));
    block.initSvg();
    block.render();
    block.select();

    //The following is used to put new, unconnected blocks at the bottom of the workspace
    // var topBlocks = Blockly.mainWorkspace.getTopBlocks();
    // var index = topBlocks.length-1;
    // var totalHeight = -topBlocks[0].height/2;
 
    // if(!Blockly.selectedConnection && index>0){
    //     for(var i = 0; i< topBlocks.length-1; i++){
    //         totalHeight += topBlocks[i].height;
    //     }
    //     block.moveBy(0, totalHeight+32);
    // }

    Blockly.Accessibility.Keystrokes.prototype.isConnecting = false;

    
    return block;
    //var workspace = Blockly.Generator.prototype.workspaceToCode();
    // var textInput = Blockly.Xml.domToText(input);                    //the svg turned into pain text'

    // //taking the xml declaration from the block after domToText adds it in
    // var partOne = textInput.substring(0, 7);                  //before the xml declaration
    // var partTwo = textInput.substring(44, textInput.length);  //after the xml declaration
    // var blockString = '<xml>' + partOne + partTwo + '</xml>'; //the complete block str from the flyout that we want to add
    // return partTwo
    // incompleteXml  = workspaceBlocksString.substring(0, workspaceBlocksString.length-6);//the xml before the chosen block has been added...stripped the </xml>
    // completeXmlStr = blockString;               //incompleteXml + blockString;//the completeXML string to be added to the workspace
    // xml = Blockly.Xml.textToDom(completeXmlStr);//take the complete xml string and change to dom

    //  // The following allows us to immediately identify the block in the scene and grab it.
    //  var commentNode = Blockly.Xml.textToDom('<xml><comment pinned="false" h="80" w="160">`4*K</comment></xml>');
    //  xml.childNodes[0].appendChild(commentNode.childNodes[0]);



    // Blockly.Xml.domToWorkspace(workspace, xml);//adds the xml var to the main workspace

    // Blockly.Accessibility.Navigation.updateXmlSelection();//updates the xml
    // // Blockly.hideChaff();//hides the toolbox once done

    //  var comments = xmlDoc.getElementsByTagName('COMMENT');

    // // //set comment text to null
    // for (var i = 0; i < comments.length; i++) {
    //     if (comments[i].childNodes[0].nodeValue == '`4*K') {
    //         //var xmlStr =  comments[i].parentNode;
    //         //var xmlBlock = Blockly.Xml.domToBlock(Blockly.mainWorkspace,xmlStr,true);

    //         //var block = Blockly.Block.getById(comments[i].parentNode, Blockly.mainWorkspace);
    //         //console.log();
    //         //block.setCommentText(null);
    //         //var block = Blockly.selected;
    //         return block;
    //     }
    // }
    // //console.log("WARNING. ADDED BLOCK NOT FOUND");
    // return null;
};



Blockly.Accessibility.MenuNav.addNext = function(){
    //var workspaceBlockId = Blockly.Accessibility.Navigation.getRetainedNode();// the selected block on the workspace
    //console.log(workspaceBlockId)
    var blockIdStr = '<xml> <block type="controls_if" id="8" inline="false" x="11" y="11">'//"id=\"" + "8" + "\"";
    console.log(blockIdStr);

    var input     = Blockly.Xml.blockToDom_(menuVars.flyoutArr[menuVars.prevIndex]);//the current block tab on from the flyout
    var textInput = Blockly.Xml.domToText(input);//the svg turned into pain text

    //taking the xml declaration from the block after domToText adds it in
    var partOne = textInput.substring(0, 7)                 //before the xml declaration
    var partTwo = textInput.substring(44, textInput.length);//after the xml declaration

    var blockString = '<statement name="DO0">' + partOne + partTwo + '</statement>'; //the complete block str from the flyout that we want to add
    //console.log(blockString);

    var workspaceBlocks       = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);//the workspace as an xml doc
    var workspaceBlocksString = Blockly.Xml.domToText(workspaceBlocks);           //the text version of what is currently on the workspace
    var completeXmlStr        = blockIdStr + blockString + '</block>' + '</xml>';
    //console.log(completeXmlStr);

    var xml = Blockly.Xml.textToDom(completeXmlStr);//take the complete xml string and change to dom

    Blockly.mainWorkspace.clear();                         //clears the previous blocks on the workspace
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);//adds the xml var to the main workspace

    Blockly.Accessibility.Navigation.updateXmlSelection();//updates the xml
    Blockly.hideChaff();                                  //hides the toolbox once done
};

Blockly.Accessibility.MenuNav.getToolboxChoices = function(){
    return menuVars.currentFlyoutArr;
};

Blockly.Accessibility.MenuNav.getMenuSelection = function(){
    return menuVars.flyoutArr[menuVars.prevIndex];
};

/**
 * {OVERWRITE} tracks status of flyout and updates the array of current blocks.
 * Construct the blocks required by the flyout for the variable category.
 * @param {!Array.<!Blockly.Block>} blocks List of blocks to show.
 * @param {!Array.<number>} gaps List of widths between blocks.
 * @param {number} margin Standard margin width for calculating gaps.
 * @param {!Blockly.Workspace} workspace The flyout's workspace.
 */
Blockly.Variables.flyoutCategory = function (blocks, gaps, margin, workspace) {
    menuVars.opened    = true;
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
        menuVars.flyoutArr.push(setBlock);//added for blockly navigation.js
        getBlock && blocks.push(getBlock);
        menuVars.flyoutArr.push(getBlock);//added for blockly navigation.js
        if (getBlock && setBlock) {
            gaps.push(margin, margin * 3);
        } else {
            gaps.push(margin * 2);
        }
    }
};

//=====================================HANDLES ADDING BLOCKS WHEN NOT CONNECTING=============================

/*when adding a block and not connecting, add to the last statement on the workspace
 *@param menuBlock - the block that is being added to the workspace from the menu
*/
Blockly.Accessibility.MenuNav.connectToLastBlock = function(menuBlock){

    var containers = Blockly.mainWorkspace.getTopBlocks(true);
    var bottom = containers.length-1;
    var duplicate  = false;


    //check for duplicate
    for(var i = 0; i < containers.length; i++){
      if(containers[i] == menuBlock){
        duplicate = true;
      }
    }


    
    //functions cant connect to statement blocks
   if(containers[bottom].type == "procedures_defreturn" || containers[bottom].type == "procedures_defnoreturn"){

        Blockly.Accessibility.MenuNav.moveToBottom();
        //Blockly.mainWorkspace.addTopBlock(containers[bottom-1]); //avoid adding again to the topBlock array
    }
    //connect to the bottom block
    else{ 

        Blockly.Accessibility.MenuNav.flyoutToWorkspace();
        
        var newBlock = Blockly.selected;

        if(!duplicate){ //check for duplicate
          Blockly.mainWorkspace.addTopBlock(newBlock);
        }

        containers = Blockly.mainWorkspace.getTopBlocks(true);
        if(containers[bottom].type == "procedures_defreturn" || containers[bottom].type == "procedures_defnoreturn"){
          bottom++;
        }

        Blockly.Accessibility.InBlock.enterCurrentBlock();
        Blockly.Accessibility.InBlock.selectNext();
        Blockly.Accessibility.InBlock.selectConnection();

        containers[bottom].select();

        Blockly.Accessibility.InBlock.enterCurrentBlock();
        Blockly.Accessibility.InBlock.selectConnection();
        Blockly.Accessibility.InBlock.enterSelected();

    }
}

//moves a newly added block to the bottom of the workspace
Blockly.Accessibility.MenuNav.moveToBottom = function(){

    Blockly.Accessibility.MenuNav.flyoutToWorkspace();

    var containers = Blockly.mainWorkspace.getTopBlocks(true);
    var totalHeight = 0;

    for(var i = 0; i < containers.length-1; i++){
        totalHeight += containers[i].height;
    }

    Blockly.selected.moveBy(0, totalHeight+80);
}









