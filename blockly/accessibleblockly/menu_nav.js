'use strict';

goog.provide('Blockly.Accessibility.menu_nav');
goog.require('Blockly.Accessibility');


Blockly.Flyout.prototype.defaultShow = Blockly.Flyout.prototype.show;

//called when the flyout opens
Blockly.Flyout.prototype.show = function(xmlList){

    oldLength = flyoutArr.length; //update the length of the last array 

    if(oldLength>0){              //ignore first case
        tabCount  = oldLength;
    }

    this.defaultShow(xmlList);    //call default and update flyoutArr
    flyoutArr = menuBlocksArr;
};

//Navigate down through the menu using down arrow
Blockly.Accessibility.menu_nav.menuNavDown = function(){

    //remove last select if not the first
    if(tabCount-1 >= 0 && tabCount!= oldLength){
        flyoutArr[tabCount-1].removeSelect();
    }

    //handle loops
    // if tabcount too high       || in variables menu                 || switching directions at the bottom of the menu
    if(tabCount>=flyoutArr.length || (flyoutArr.length-oldLength == 2) || (lastTabCount == tabCount+1 && tabCount+2>=flyoutArr.length)){
        tabCount = oldLength;
        lastTabCount=flyoutArr.length-1; 
        flyoutArr[lastTabCount].removeSelect();
    }

   //handle switching from up to down
   // if normal switch scenario  && not in variable menu
   if(lastTabCount == tabCount+1 && flyoutArr.length-oldLength!=2){
        flyoutArr[lastTabCount].removeSelect();
        tabCount+=2;
    }


    //select next -> save last -> increase count 
    flyoutArr[tabCount].addSelect(); 
    Blockly.Accessibility.menu_nav.readToolbox(); 
    lastTabCount = tabCount; 
    tabCount++;

};




//traverse up through the menu using up arrow
Blockly.Accessibility.menu_nav.menuNavUp = function(){
    
    //remove last select if possible also remove select that gets stuck on 1 after switching directions
    if((flyoutArr[lastTabCount] != undefined && tabCount!=oldLength) || lastTabCount==oldLength+1)
    {
        flyoutArr[lastTabCount].removeSelect();
    }
    //handle loops 
    //if tabcount is too low   || In variables menu (only 2 blocks)   || In audio menu (only 1 block)        || trying to switch directions at the top of the menu
    if(tabCount <= oldLength-1 || (flyoutArr.length - oldLength == 2) || (flyoutArr.length - oldLength == 1) || (lastTabCount == tabCount-1 && tabCount-2<oldLength)){
        lastTabCount = oldLength;
        tabCount = flyoutArr.length-1;
        flyoutArr[lastTabCount].removeSelect();
    }

    //handle switching from down to up
    //normal switch scenario       && not the first block  && not in the variables menu
    if(lastTabCount == tabCount-1  && tabCount!=oldLength  && (flyoutArr.length-oldLength!=2)){
        flyoutArr[lastTabCount].removeSelect();
        tabCount-=2;
    }
    //select next -> save last -> decrease count 
    flyoutArr[tabCount].addSelect();
    Blockly.Accessibility.menu_nav.readToolbox(); 
    lastTabCount = tabCount;         
    tabCount--; 
};

//#endregion

/**
 * When the selection changes, the block name is updated for screenreader
 */
 Blockly.Accessibility.menu_nav.readToolbox = function(){
    var allElements = document.getElementsByTagName('*');
    var shouldSay;
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
        var blockType = allElements[i].getAttribute("type");
        //check if that type is selected
        if(blockType == flyoutArr[tabCount].type){

            selectedBlock = allElements[i];

            var readBox = document.getElementById("blockReader");
            //var  = selectedBlock.getAttribute("type");
            var blockName = blockType.toUpperCase()+ "_TITLE";
            var say = (Blockly.Msg[blockName]);

            if(say !=undefined){
                shouldSay = say;
                if(say.includes("%1")) {
                    shouldSay = shouldSay.replace("%1", "blank,"); 
                }
                if(say.includes("%2")){
                shouldSay = shouldSay.replace("%2", "blank,");
            }
        }

           // console.log(blockType);
            //console.log(Blockly.Msg[blockName]);
            

            readBox.innerHTML = shouldSay;
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

    var input = Blockly.Xml.blockToDom_(flyoutArr[tabCount+1]);//the current block tab on from the flyout
    var textInput = Blockly.Xml.domToText(input);//the svg turned into pain text
    //taking the xml declaration from the block after domToText adds it in
    var partOne = textInput.substring(0, 7);//before the xml declaration
    var partTwo = textInput.substring(44, textInput.length);//after the xml declaration
    var blockString = partOne + partTwo + '</xml>'; //the complete block str from the flyout that we want to add

    workspaceBlocks = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);//the workspace as an xml doc
    workspaceBlocksString = Blockly.Xml.domToText(workspaceBlocks);//the text version of what is currently on the workspace
    
    incompleteXml = workspaceBlocksString.substring(0, workspaceBlocksString.length-6);//the xml before the chosen block has been added...stripped the </xml>
    completeXmlStr = incompleteXml + blockString;//the completeXML string to be added to the workspace
    

    xml = Blockly.Xml.textToDom(completeXmlStr);//take the complete xml string and change to dom

    Blockly.mainWorkspace.clear();//clears the previous blocks on the workspace
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);//adds the xml var to the main workspace

    Blockly.Accessibility.Navigation.updateXmlSelection();//updates the xml
    Blockly.hideChaff();//hides the toolbox once done
};
