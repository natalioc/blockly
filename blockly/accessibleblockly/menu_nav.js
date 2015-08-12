'use strict';

goog.provide('Blockly.Accessibility.menu_nav');
goog.require('Blockly.Accessibility');


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
* File overview: this file handles using the keyboard to navigate the menu
*/




var flyoutArr = [];   //everytime the flyout opens the blocks in it are added to this array
var oldLength = 0;    //size of the array before a new tab opened 
var tabCount  = 0;    //current position in array/toolbox
var lastTabCount = 0; //last position for switching up and down
var notOpened = true; //keep track of the flyout opening and closing
var currentFlyoutArr = []; //the current flyoutarray

Blockly.Flyout.prototype.defaultShow = Blockly.Flyout.prototype.show;

    /**
     * Hide and empty the flyout.
     */
    Blockly.Flyout.prototype.hide = function() {
      notOpened = true;
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

//called when the flyout opens
Blockly.Flyout.prototype.show = function(xmlList){
    notOpened = false;
    oldLength = flyoutArr.length; //update the length of the last array 


    if(oldLength>0){              //ignore first case
        tabCount  = oldLength;
    }

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
                menuBlocksArr.push(block);
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

    flyoutArr = menuBlocksArr;

    currentFlyoutArr = [];
    for(var i = flyoutArr.length-oldLength; i < flyoutArr.length; i++){
        currentFlyoutArr.push(flyoutArr[i]);
    }
    Blockly.Accessibility.InBlock.disableIncompatibleBlocks();
};

//Navigate down through the menu using down arrow
Blockly.Accessibility.menu_nav.menuNavDown = function(){
    if(notOpened){
        return;
    }
    //remove last select if not the first
    if(tabCount-1 >= 0 && !(tabCount<= oldLength) && flyoutArr.length-oldLength != 2 ){
        flyoutArr[tabCount-1].removeSelect();
    }
    //handle loops
    // if tabcount too high       ||  switching directions at the bottom of the menu               && in variables menu 
    if(tabCount>=flyoutArr.length ||  (lastTabCount == tabCount+1 && tabCount+2>=flyoutArr.length) && !(flyoutArr.length-oldLength == 2)){
        tabCount = oldLength;
        lastTabCount=flyoutArr.length-1; 
        flyoutArr[lastTabCount].removeSelect();
    }

    //handle variables menu because it only has 2 blocks
    //for an unknown reason this technique does not work going up the menu
    if(flyoutArr.length-oldLength == 2){

        //if the tab count is too high (bottom block)
        if(tabCount >= flyoutArr.length-1){
            tabCount = oldLength;
            flyoutArr[tabCount].addSelect();

            lastTabCount = flyoutArr.length-1;
            flyoutArr[lastTabCount].removeSelect();
            lastTabCount = oldLength;
        }
        //if the tabcount is too low (top block)
        else if(tabCount <= oldLength){
            tabCount = flyoutArr.length-1;
            flyoutArr[tabCount].addSelect();

            lastTabCount = oldLength;
            flyoutArr[lastTabCount].removeSelect();
            lastTabCount = flyoutArr.length-1;

        }
        Blockly.Accessibility.menu_nav.readToolbox(); 
    }

   //handle switching from up to down
   // if normal switch scenario  && not in variable menu
   if(lastTabCount == tabCount+1 && flyoutArr.length-oldLength!=2){
        flyoutArr[lastTabCount].removeSelect();
        tabCount+=2;
    }

    //for everything except variables
    //select next -> save last -> increase count 
    if(flyoutArr.length-oldLength != 2){
        flyoutArr[tabCount].addSelect(); 
        Blockly.Accessibility.menu_nav.readToolbox(); 
        lastTabCount = tabCount; 
        tabCount++;
    }
};




//traverse up through the menu using up arrow
Blockly.Accessibility.menu_nav.menuNavUp = function(){
    if(notOpened){
        return;
    }
    // not in variables category       &&  not first selected  || not second item on list
    if(flyoutArr.length-oldLength != 2 &&  tabCount!=oldLength || lastTabCount==oldLength+1)
    {
        flyoutArr[lastTabCount].removeSelect();
    }

    //handle loops 
    //if tabcount is too low    || In audio menu (only 1 block)        || trying to switch directions at the top of the menu  && In variables menu (only 2 blocks)   
    if(tabCount <= oldLength-1  || (flyoutArr.length - oldLength == 1) || (lastTabCount == tabCount-1 && tabCount-2<oldLength && (flyoutArr.length - oldLength != 2))){
        lastTabCount = oldLength;
        tabCount = flyoutArr.length-1;
        flyoutArr[lastTabCount].removeSelect();
    }

    //handle variables menu because it only has 2 blocks
    if(flyoutArr.length-oldLength == 2){

        //Otherwise switch blocks
        //bottom block
        if(tabCount == flyoutArr.length-1){

            tabCount = oldLength;
            lastTabCount = oldLength;
            flyoutArr[tabCount].addSelect();
            flyoutArr[flyoutArr.length-1].removeSelect();
        }
        //top block
        else if(tabCount == oldLength){

            tabCount = flyoutArr.length-1;
            lastTabCount = flyoutArr.length-1;
            flyoutArr[tabCount].addSelect();
            flyoutArr[oldLength].removeSelect();
        }

        Blockly.Accessibility.menu_nav.readToolbox(); 
    }

    //handle switching from down to up
    //normal switch scenario       && not the first block  && not in the variables menu
    if(lastTabCount == tabCount-1  && tabCount!=oldLength  && (flyoutArr.length-oldLength!=2)){
        flyoutArr[lastTabCount].removeSelect();
        tabCount-=2;
    }

    if(flyoutArr.length-oldLength != 2){
        //select next -> save last -> decrease count 
        flyoutArr[tabCount].addSelect();
        Blockly.Accessibility.menu_nav.readToolbox(); 
        lastTabCount = tabCount;

        tabCount--; 
    }
};

//#endregion

/**
 * When the selection changes, the block name is updated for screenreader
 */
 Blockly.Accessibility.menu_nav.readToolbox = function(){
    var blockSvg = flyoutArr[tabCount];
    var allElements = document.getElementsByTagName('*');
    var selectedBlock;
    var active = document.activeElement;
    var lastCategory; //track the category so that it does not deselect

    //if category is selected save it (all categories begin with :)
    if(active.id[0] ==":"){
        lastCategory = active;
        lastCategory.setAttribute("aria-owns", "blockReader");
    }

    //go through all the elements and find the one with matching type
    for(var i = 0; i < allElements.length; i++){
        //get the type of block
        var blockType  = allElements[i].getAttribute("type");
        var currType   = flyoutArr[tabCount].type;
        var typeSlice = currType.slice(0, currType.indexOf('_'));
        //check if that type is selected
        if(blockType == currType || typeSlice == "procedures" || typeSlice == "variables"){
            selectedBlock = allElements[i];
            var say = this.blockToString(currType, blockSvg.disabled);

            var readBox = document.getElementById("blockReader");
            readBox.innerHTML = say;
            console.log(say);
            lastCategory.setAttribute("aria-labelledBy", "blockReader"); 
        }
    }
};

Blockly.Accessibility.menu_nav.flyoutToWorkspace = function(){
    var workspaceBlocksString = "";//text of what is on the workspace
    var workspaceBlocks;//xml of what is on the workspace
    var incompleteXml;//xml string before the chosen block has been added
    var completeXmlStr;//string of xml to be added to workspace
    var xml;//dom version of the xml to be added to the workspace

    var input = Blockly.Xml.blockToDom_(flyoutArr[lastTabCount]);//the current block tab on from the flyout
    var textInput = Blockly.Xml.domToText(input);//the svg turned into pain text'
    //taking the xml declaration from the block after domToText adds it in
    var partOne = textInput.substring(0, 7);//before the xml declaration
    var partTwo = textInput.substring(44, textInput.length);//after the xml declaration
    var blockString = '<xml>' + partOne + partTwo + '</xml>'; //the complete block str from the flyout that we want to add
    
    incompleteXml = workspaceBlocksString.substring(0, workspaceBlocksString.length-6);//the xml before the chosen block has been added...stripped the </xml>
    completeXmlStr = blockString;//incompleteXml + blockString;//the completeXML string to be added to the workspace
    

    xml = Blockly.Xml.textToDom(completeXmlStr);//take the complete xml string and change to dom

    // The following allows us to immediately identify the block in the scene and grab it.
    var commentNode = Blockly.Xml.textToDom('<xml><comment pinned="true" h="80" w="160">`4*K</comment></xml>');
    xml.childNodes[0].appendChild(commentNode.childNodes[0]);

    Blockly.Xml.domToWorkspace(workspace, xml);//adds the xml var to the main workspace

    Blockly.Accessibility.Navigation.updateXmlSelection();//updates the xml
    Blockly.hideChaff();//hides the toolbox once done

    var comments = xmlDoc.getElementsByTagName('COMMENT');
    
    //console.log(comments);

    //auto select what was just added
    var newId = flyoutArr[flyoutArr.length-1].id;
    newId = parseInt(newId);
    newId ++;
    var test  = newId;
    Blockly.Accessibility.Navigation.jumpToID(newId);

    //set comment text to null
    for (var i = 0; i < comments.length; i++) {
        if (comments[i].childNodes[0].nodeValue == '`4*K') {
            var block = Blockly.Block.getById(comments[i].parentNode.getAttribute('ID'), Blockly.mainWorkspace)
            block.setCommentText(null);
            return block;
        }
    }
    console.log("WARNING. ADDED BLOCK NOT FOUND");
    return null;
};

Blockly.Accessibility.menu_nav.addNext = function(){
    //var workspaceBlockId = Blockly.Accessibility.Navigation.getRetainedNode();// the selected block on the workspace
    //console.log(workspaceBlockId)
    var blockIdStr = '<xml> <block type="controls_if" id="8" inline="false" x="11" y="11">'//"id=\"" + "8" + "\"";
    console.log(blockIdStr);

    var input = Blockly.Xml.blockToDom_(flyoutArr[lastTabCount]);//the current block tab on from the flyout
    var textInput = Blockly.Xml.domToText(input);//the svg turned into pain text
    //taking the xml declaration from the block after domToText adds it in
    var partOne = textInput.substring(0, 7);//before the xml declaration
    var partTwo = textInput.substring(44, textInput.length);//after the xml declaration
    var blockString = '<statement name="DO0">' + partOne + partTwo + '</statement>'; //the complete block str from the flyout that we want to add
    console.log(blockString);
    var workspaceBlocks = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);//the workspace as an xml doc
    var workspaceBlocksString = Blockly.Xml.domToText(workspaceBlocks);//the text version of what is currently on the workspace
    var completeXmlStr = blockIdStr + blockString + '</block>' + '</xml>';
    console.log(completeXmlStr);
    var xml = Blockly.Xml.textToDom(completeXmlStr);//take the complete xml string and change to dom

    Blockly.mainWorkspace.clear();//clears the previous blocks on the workspace
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);//adds the xml var to the main workspace

    Blockly.Accessibility.Navigation.updateXmlSelection();//updates the xml
    Blockly.hideChaff();//hides the toolbox once done


    //console.log(workspaceBlocksString.indexOf(blockIdStr));
};

Blockly.Accessibility.menu_nav.getToolboxChoices = function(){
    return currentFlyoutArr;
};

Blockly.Accessibility.menu_nav.getMenuSelection = function(){
    return flyoutArr[lastTabCount];
};



Blockly.Accessibility.menu_nav.blockToString = function(type, disabled){
    var result;
    var disabledText = "";

    switch (type){
        case "beep":
            result = "beep frequency 'A' duration 'B' time until played 'C'";
            break;
        case "controls_if"    : 
            result = "if 'A', do";
            break;
        case "logic_compare"  :
            result = " 'A' 'equals' 'B'"; 
            break;
        case "logic_operation": 
            result = " 'A' 'and or' 'B'"; 
            break;
        case "logic_negate": 
            result = "not ' '"; 
            break;
        case "logic_boolean":
            result = "'true or false'"; 
            break;
        case "logic_null":
            result = "'' null";
            break;
        case "logic_ternary":
            result = "Test 'A', if true do 'B', if false do 'C'";
            break;
        case "controls_repeat_ext":
            result = "repeat '10' times";
            break;
        case "controls_whileUntil":
            result = "repeat 'while or until' ' '";
            break;
        case "controls_for":
            result = "count with 'i' from '1' to '10' by '1'";
            break;
        case "controls_forEach":
            result = "for each item 'i' in in list ''";
            break;
        case "controls_flow_statements":
            result = "'break out' of loop";
            break; 
        case "math_number":
            result = "'number'";
            break; 
        case "math_arithmetic":
            result = "'A' '+' 'B'";
            break; 
        case "math_single":
            result = "'square root' of 'A'";
            break; 
        case "math_trig":
            result = "'trig' ''";
            break; 
        case "math_constant":
            result = "'pi and constants'";
            break; 
        case "math_number_property":
            result = "' ' is 'even'";
            break; 
        case "math_change":
            result = "change 'variable' by '1'";
            break; 
        case "math_round":
            result = "'round' ''";
            break; 
        case "math_on_list":
            result = "'sum' of list ''";
            break; 
        case "math_modulo":
            result = "remainder of 'A' divided by 'B'";
            break; 
        case "math_constrain":
            result = "constrain 'A' between low '1' and high '100'";
            break; 
        case "math_random_int":
            result = "random integer from '1' to '100'";
            break; 
        case "math_random_float":
            result = "''random fraction";
            break; 
        case "text":
            result = "text ''";
            break; 
        case "text_join":
            result = "Create text with 'A' combined with 'B'";
            break; 
        case "text_append":
            result = "to 'item' append text ''";
            break; 
        case "text_length":
            result = "length of 'text'";
            break; 
        case "text_isEmpty":
            result = "'A' is empty";
            break; 
        case "text_indexOf":
            result = "in 'text' find 'first or last' occurence of text 'A'";
            break; 
        case "text_charAt":
            result = "in text 'text' get 'character at index' 'A'";
            break; 
        case "text_getSubstring":
            result = "in text 'text' get substring from ',index' 'A' to 'index' 'B' ";
            break; 
        case "text_changeCase":
            result = " to 'upper or lower' case ''";
            break; 
        case "text_trim":
            result = "trim spaces from 'both sides' of ''";
            break; 
        case "text_print":
            result = "print ''";
            break; 
        case "text_prompt_ext":
            result = "prompt for 'text' with message ' text'";
            break; 
        case "lists_create_empty":
            result = "create empty list";
            break; 
        case "lists_create_with":
            result = "create list with values 'A', 'B', 'C'";
            break;  
        case "lists_repeat":
            result = "create list with item 'A' repeated '5' times";
            break;
        case "lists_length":
            result = "length of '' list";
            break;
        case "lists_isEmpty":
            result = "the list 'list' is empty";
            break;
        case "lists_indexOf":
            result = "in the list 'list' find 'first' occurence of item 'A'";
            break;
        case "lists_getIndex":
            result = "in the list 'list' 'get' 'index' 'A'";
            break;
        case "lists_setIndex":
            result = "in the list 'list' 'set' 'index' 'A' as 'B'";
            break;
        case "lists_getSublist":
            result = "in the list 'list' get sub-list from 'index' 'A' to ',index' 'B'";
            break;
        case "lists_split":
            result = "make 'list from text' 'A' with delimiter 'comma'";
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
            result = "function 'do something' then return 'A'";
            break;
        case "procedures_ifreturn":
            result = "if 'A' then return 'B'";
            break;
        case "variables_set":
            result = "set 'variable' to 'A'";
            break;
        case "variables_get":
            result ="get variable 'A'";
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

