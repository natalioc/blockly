goog.provide('Blockly.Accessibility.CursorNavigation');

goog.require('Blockly.Block');
goog.require('Blockly.Accessibility.Navigation');
goog.require('Blockly.Accessibility.MenuNav');
goog.require('Blockly.Accessibility.Speech');
goog.require('Blockly.Accessibility');
goog.require('Blockly.Accessibility.InBlock');


Blockly.Accessibility.CursorNavigation.currentLocation = 0;
Blockly.Accessibility.CursorNavigation.currentSelection = null;
Blockly.Accessibility.CursorNavigation.currentHighlight = null;
Blockly.Accessibility.CursorNavigation.currentInputIndex = 0;
Blockly.Accessibility.CursorNavigation.blockInputList = [];





/**
*Jump to the first or top block on workspace
*/
Blockly.Accessibility.CursorNavigation.jumpToTopBlock = function(){
    var topBlocks = Blockly.Accessibility.MenuNav.containersArr;
    // Blockly.Accessibility.MenuNav.containersArr is populated only 
    // when blocks are added to workspace using the keyboard


    if(topBlocks.length <= 0){//handle case when blocks at added using mouse or preloaded from file
        topBlocks = Blockly.mainWorkspace.getTopBlocks(false);

    }
    topBlocks[0].select();
    console.log(">> before back to top");
    //Blockly.Accessibility.Speech.Say("Back to top block");
    var prefixText = "Back to top block"
    Blockly.Accessibility.Speech.updateBlockReader(Blockly.selected.type, Blockly.selected, prefixText);

};


/**
 * For traversing down from previou-connection to block to next-connection etc
 * For traverses to down/to the left through the input connections of a block.
 *
 */

Blockly.Accessibility.CursorNavigation.goDown =  function(){
	console.log('>>>: goDown current Loc is ' + this.currentLocation); 
	if(this.currentLocation === 1){
		console.log('>>>: connection type: '+ this.currentSelection.type);
		this.currentSelection = this.currentSelection.sourceBlock_;
		this.goToBlock();
		console.log('>>>:: goDown location is 1'); 
		
	}
	else if(this.currentLocation === 2 && Blockly.selected && Blockly.selected.outputConnection == null){
		
		if(Blockly.selected.nextConnection != null){

			if(Blockly.selected.nextConnection.targetConnection == null){
				var str = ""
				this.currentLocation = 3;
				this.currentSelection = Blockly.selected.nextConnection;
				this.currentHighlight = this.currentSelection.returnHighlight();
				var selected = Blockly.selected;
				Blockly.selected.unselect();
				Blockly.selected = selected;
				//console.log(Blockly.Accessibility.Speech.blockToString(this.currentSelection.sourceBlock_.type));
				str = Blockly.Accessibility.Speech.blockToString(this.currentSelection.sourceBlock_.type);
				console.log(str);
				Blockly.Accessibility.Speech.Say(str + "Bottom Connection");
			}
			else{

				//>> modify to go from block to block
				this.currentSelection = Blockly.selected.nextConnection.targetConnection.sourceBlock_;
				Blockly.selected.unselect();
				this.goToBlock();
			}

		}
		
	}
	else if(this.currentLocation === 3 && this.currentSelection != null && this.currentSelection.targetConnection !=null ){
		//this.currentLocation = 2;
		//Blockly.Connection.removeHighlight(this.currentHighlight);
		this.currentSelection = this.currentSelection.targetConnection.sourceBlock_;
		//this.currentSelection.select();
		//this.currentHighlight = null;
		this.goToBlock();
		//Blockly.Accessibility.Speech.Say("Top Connection");
		//console.log(Blockly.Accessibility.Speech.blockToString(this.currentSelection.sourceBlock_.type));
	} 
	else if(this.currentLocation === 4){ 
		
		/**
		this.currentInputIndex ++;
		if (this.currentInputIndex >= Blockly.selected.inputList.length){
			this.currentInputIndex = Blockly.selected.inputList.length - 1;
		}
		
		if(Blockly.selected.inputList[this.currentInputIndex].connection == null){ // handle case when input is a dummy input
																				   //need to write a general function to handle in case of 
            																	   //consecutive dummy inputs
			this.currentInputIndex++; 
		}
		Blockly.Connection.removeHighlight(this.currentHighlight);
		this.currentSelection = Blockly.selected.inputList[this.currentInputIndex].connection;
		this.currentHighlight = this.currentSelection.returnHighlight();
		*/
		
		//I have reused the function implementation to go through the inputs of a block including the fields
		
		Blockly.Accessibility.InBlock.selectNext();
		this.currentSelection = this.returnCurrentlySelectedInput();
	}
	else if(this.currentLocation == 3 && this.currentSelection != null && this.currentSelection.targetConnection == null){
		Blockly.Accessibility.Speech.Say("Cannot move further down from here");
	}
	
	console.log('>>>:: go down');
	
}; 


/**
 * For traversing Up from next-connection to block to previous-connection etc
 * For traversing to up/to the right through the input connections of a block.
 *
 */
Blockly.Accessibility.CursorNavigation.goUp = function(){
	
	console.log('currentLocation goUP: ' + this.currentLocation);
	if(this.currentLocation === 3){
		console.log('>>>: connection type: '+ this.currentSelection.type);
		this.currentSelection = this.currentSelection.sourceBlock_;
		this.goToBlock();
	}
	else if(this.currentLocation === 2 && Blockly.selected && this.currentSelection.previousConnection != null &&
		this.currentSelection.previousConnection.targetConnection != null && Blockly.selected.outputConnection == null){
			
		//check whether currentLocation is not a first child block if it is not, go the nextConnection of previous block
		if(this.currentSelection.getSurroundParent() != this.currentSelection.parentBlock_){
			// var str =""
			// this.currentLocation = 3;
			// this.currentSelection = Blockly.selected.previousConnection.targetConnection;
			// this.currentHighlight = this.currentSelection.returnHighlight();
			// var selected = Blockly.selected;
			// Blockly.selected.unselect();
			// Blockly.selected = selected;
			// str = Blockly.Accessibility.Speech.blockToString(this.currentSelection.sourceBlock_.type);
			// Blockly.Accessibility.Speech.Say(str + "Bottom Connection");

			//>> modify to go from block to block
			this.currentSelection = Blockly.selected.previousConnection.targetConnection.sourceBlock_;
			Blockly.selected.unselect();
			this.goToBlock();
		} 
		else{// if it is a first child block go to the previousConnection of the block
			var str =""
			this.goFromBlockToPreviousConnection();
			str = Blockly.Accessibility.Speech.blockToString(this.currentSelection.sourceBlock_.type);
			Blockly.Accessibility.Speech.Say(str + "Top Connection");
			//go to previous connection of child block
		}
	}
	else if(this.currentLocation === 2 && Blockly.selected && this.currentSelection.previousConnection != null && 
		this.currentSelection.previousConnection.targetConnection == null && Blockly.selected.outputConnection == null ){
		var str =""
		this.goFromBlockToPreviousConnection();
		str = Blockly.Accessibility.Speech.blockToString(this.currentSelection.sourceBlock_.type);
		Blockly.Accessibility.Speech.Say(str + "Top Connection");
	}
	else if (this.currentLocation == 1 && this.currentSelection != null && 
				this.currentSelection.targetConnection != null){
		
		this.currentLocation = 4;
		this.currentSelection = this.currentSelection.targetConnection;
		
		//take cursor to input connection
		
		this.goToInputConnectionOfSelectedConnection();
		
		//remove highlight 
		Blockly.Connection.removeHighlight(this.currentHighlight);
		this.currentHighlight = null;
		
		//if on child previous connection go to parent do connection
	}
	else if(this.currentLocation === 4){
		/*
		this.currentInputIndex--;
		if (this.currentInputIndex < 0){
			this.currentInputIndex = 0;
		}
		if(Blockly.selected.inputList[this.currentInputIndex].connection == null){ // handle case when input is a dummy input
																				   //need to write a general function to handle in case of 
																				   //consecutive dummy inputs
			this.currentInputIndex--; 
		}
		Blockly.Connection.removeHighlight(this.currentHighlight);
		this.currentSelection = Blockly.selected.inputList[this.currentInputIndex].connection;
		this.currentHighlight = this.currentSelection.returnHighlight();
		*/
		Blockly.Accessibility.InBlock.selectPrev();
		this.currentSelection = this.returnCurrentlySelectedInput();
		//cycle through inputs 
		
	}
	else if(this.currentLocation == 1 && this.currentSelection != null && this.currentSelection.targetConnection == null){
		Blockly.Accessibility.Speech.Say("Cannot move further up from here");
	}
	
	console.log('>>>:: goUp');
	
}




/**
 *Traverses left, from block to input, from input to block
 *
 */
Blockly.Accessibility.CursorNavigation.goRight = function(){
	if(this.currentLocation === 2 && Blockly.selected){
		this.currentLocation = 4; //for inputs
		
		/*
		this.currentInputIndex = 0;
		this.currentSelection = Blockly.selected.inputList[this.currentInputIndex].connection;
		//this.currentSelection = this.blockInputList[this.currentInputIndex].connection;
		
		this.currentHighlight = this.currentSelection.returnHighlight();
		*/
		
		Blockly.Accessibility.InBlock.connectionsIndex = -1;
		Blockly.Accessibility.InBlock.selectNext();
		console.log('>>>: input selected ' + Blockly.Accessibility.InBlock.selectionList[Blockly.Accessibility.InBlock.connectionsIndex]);
		this.currentSelection = this.returnCurrentlySelectedInput();
		var selected = Blockly.selected;
		Blockly.selected.unselect();
		Blockly.selected = selected;
		
	}else if (this.currentLocation === 4){
		
		
		//this.currentSelection = this.currentSelection.targetConnection.sourceBlock_;
		
		// inputConnection can be of type input or of any of the field types
		//depending on the type, the sourceBlock_ variable is accessed differently.
		if (this.currentSelection instanceof Blockly.Input) { 
			//console.log(">>>: " + this.currentSelection.connection.targetConnection.sourceBlock_)
			if(this.currentSelection.connection.targetConnection != null){ // check if there is a target connection
				if(this.currentSelection.connection.targetConnection.sourceBlock_.outputConnection != null){ 
					this.currentSelection = this.currentSelection.connection.targetConnection.sourceBlock_;
					this.goToBlock();
				}
				else {
					// this.currentLocation = 1;
					// this.currentSelection = this.currentSelection.connection.targetConnection.sourceBlock_.previousConnection;
					// this.currentHighlight = this.currentSelection.returnHighlight();
					
					// //var selected = Blockly.selected;
					// //Blockly.selected.unselect();
					// Blockly.selected = this.currentSelection.sourceBlock_;
					// str = Blockly.Accessibility.Speech.blockToString(this.currentSelection.sourceBlock_.type);
					// Blockly.Accessibility.Speech.Say(str + "top Connection");

					//>> modify to match new update
					this.currentLocation = 2;
					this.currentSelection = this.currentSelection.connection.targetConnection.sourceBlock_;
					this.goToBlock();


				}
			}
			else{
				//console.log(">>>: dead end")
				Blockly.Accessibility.Speech.readConnection(this.currentSelection.name,
				Blockly.Accessibility.InBlock.connectionsIndex);

			}
		}
		
		//this.goToBlock();
		
	}
	
}



Blockly.Accessibility.CursorNavigation.goLeft = function(){
	
	if(this.currentLocation === 4){ // from connection input to source block
		
		this.currentSelection = this.currentSelection.sourceBlock_;
		this.goToBlock();
		console.log(">>>: block type: " + this.currentSelection.type);
	}
	else if(this.currentLocation ===2 && Blockly.selected && Blockly.selected.outputConnection != null){ // from value block to targetConnection of input block
		this.currentLocation = 4;
		this.currentSelection = Blockly.selected.outputConnection.targetConnection;
		
		
		// take cursor to the input connection 
		
		this.goToInputConnectionOfSelectedConnection();
		
	}
	else if (this.currentLocation ===2 && Blockly.selected && Blockly.selected.outputConnection == null){ // from child block to firstConnection
																//point of surrounding block (statement block)
		
		if(Blockly.selected.getSurroundParent() != null){
		
			this.currentLocation = 4;
			this.currentSelection = Blockly.selected.getSurroundParent().getFirstStatementConnection();
			
			
			// take cursor to the input connection 
			
			this.goToInputConnectionOfSelectedConnection();
		}
		else { // case outmost stack of blocks, take cursor to previous connection of topmost block
				// this is a temporary solution because in Abby's work, the cursor is actually taken to a point on the workspace
				// above the previous connection of the first block
				
			// this.currentLocation = 1;
			// this.currentSelection = Blockly.selected.getRootBlock().previousConnection;
			
			// this.currentHighlight = this.currentSelection.returnHighlight();
			
			// Blockly.selected.unselect();
			// Blockly.selected = this.currentSelection.sourceBlock_;
			Blockly.Accessibility.Speech.Say("Cannot move further out from here");
			
		}
		
	}
	else if ((this.currentLocation === 1 || this.currentLocation === 3 ) ){ // from previou-connection or next-connection of child block to 
																				  // to firstConnection point of surrounding block (statement block)
		if(this.currentSelection.sourceBlock_.getSurroundParent() != null){ // for child blocks with a surroundParent
			this.currentLocation = 4;
			this.currentSelection = this.currentSelection.sourceBlock_.getSurroundParent().getFirstStatementConnection();
			
			
			// take cursor to the input connection 
			
			this.goToInputConnectionOfSelectedConnection();			

			//remove highlight 
			Blockly.Connection.removeHighlight(this.currentHighlight);
			this.currentHighlight = null;
		}
		else{ //for connection points on outmost blocks. Again, this is a temporary solution because 
				//in Abby's work, the cursor is actually taken to a point on the workspace
				// above the previous connection of the first block
			this.currentLocation = 1;
			this.currentSelection = this.currentSelection.sourceBlock_.getRootBlock().previousConnection;
	
			//clear current hightlighted connection point
			Blockly.Connection.removeHighlight(this.currentHighlight);
			
			//hightlight the new location
			this.currentHighlight = this.currentSelection.returnHighlight();
			
			Blockly.selected = this.currentSelection.sourceBlock_;
			
			
		}
		
	}
	
}




Blockly.Accessibility.CursorNavigation.goToBlock = function(){
	
	Blockly.Accessibility.InBlock.clearHighlights();
	this.currentLocation = 2;
	Blockly.Connection.removeHighlight(this.currentHighlight);
	//this.currentSelection = this.currentSelection.sourceBlock_;
	Blockly.selected = null;
	this.currentSelection.select();
	this.currentHighlight = null;
	this.initBlockInputList();
	
	
	//>>> debugging purpose only
	console.log('>>>: parentBlock ' + Blockly.selected.parentBlock_);
	
	console.log('>>>: surroundParent ' + Blockly.selected.getSurroundParent());	
	
	//console.log('>>>: surrondParent connection point type ' + Blockly.selected.getSurroundParent().getFirstStatementConnection().type);
	//console.log('>>>: surrondParent connection point Block ' + Blockly.selected.getSurroundParent().getFirstStatementConnection().sourceBlock_);
	
}


Blockly.Accessibility.CursorNavigation.initialize = function(){
	Blockly.Accessibility.InBlock.clearHighlights();
	
	if(this.currentHighlight != null){
		Blockly.Connection.removeHighlight(this.currentHighlight);
		this.currentHighlight = null;
	}
	this.currentLocation = 2;
	this.currentSelection = Blockly.selected;
	
	console.log('>>>: init successful');
	this.initBlockInputList();
	
}


/**
 This functions initializes the list of input connections for the current block. blockInputList
 this list does not input the nextConnection and previousConnection. It 
 includes the fields of a block if present.
 this function is adapted from the second part of the function Blockly.Accessibility.InBlock.enterCurrentBlock

 */

Blockly.Accessibility.CursorNavigation.initBlockInputList = function(){
	
	
	if(Blockly.selected){
		this.blockInputList = [];
		
		// Go through all of the inputs for the current block and see what you can add where
		for (var i = 0; i < Blockly.selected.inputList.length; i++) {
			if (Blockly.selected.inputList[i].fieldRow.length > 0) {
				// Check all of the fields
				for (var j = 0; j < Blockly.selected.inputList[i].fieldRow.length; j++) {
					if (!(Blockly.selected.inputList[i].fieldRow[j] instanceof Blockly.FieldLabel) &&
						!(Blockly.selected.inputList[i].fieldRow[j] instanceof Blockly.FieldImage)) {
						this.blockInputList.push(Blockly.selected.inputList[i].fieldRow[j]);
						console.log('>>>: field row has been put');
						console.log('>>>: field name of ' + i + ' ' + Blockly.selected.inputList[i].fieldRow[j].name);

					}
				}
			}
			// If the connection is null it means nothing can be connected there, so we don't need to remember the input
			if (Blockly.selected.inputList[i].connection != null) {
				this.blockInputList.push(Blockly.selected.inputList[i]);
				console.log('>>> enterCurrentBlock input i  i is : ' + i + ' ' + Blockly.selected.inputList[i].name);
			}
			else{ //>>> this else part added for debugging
				console.log('>>> enterCurrentBlock is connection null i is : ' + i);
			}
		}

		/*
		if (Blockly.selected.outputConnection != null) {
			this.blockInputList.push('outputConnection');
		}
		*/

		if (this.blockInputList.length == 0) {
			return false;
		}

		this.currentInputIndex = 0;
		
		//console.log('>>> block input list ' + this.blockInputList);
		Blockly.Accessibility.InBlock.selectionList = this.blockInputList;
		Blockly.Accessibility.InBlock.connectionsIndex = 0;
		
		//console.log('>>> InBlock inputlist ' + Blockly.Accessibility.InBlock.selectionList);

	}
	
}


/**
	helper function to get theinput from Blockly.Accessibility.InBlock.selectionList
	at the current index indicated by Blockly.Accessibility.InBlock.connectionsIndex

*/

Blockly.Accessibility.CursorNavigation.returnCurrentlySelectedInput = function (){
	
	if(Blockly.Accessibility.InBlock.selectionList != []){
		return Blockly.Accessibility.InBlock.selectionList[Blockly.Accessibility.InBlock.connectionsIndex];
	}
}

/**
	Helper function to get index of a connection input from a Block's inputList
 */
Blockly.Accessibility.CursorNavigation.returnIndexOfConnectionInput = function (connection, block){
	for (var i = 0, input; input = block.inputList[i]; i++) {
		if (input.connection == connection) {
			break;
		}
	}
	return i;
}

/**
	takes cursor from block to previous location of the block when
	this.currentLocation = 2 and this.currentSelection is a block

 */


Blockly.Accessibility.CursorNavigation.goFromBlockToPreviousConnection = function (){
	this.currentLocation = 1;
	this.currentSelection = Blockly.selected.previousConnection;
	this.currentHighlight = this.currentSelection.returnHighlight();
	
	var selected = Blockly.selected;
	Blockly.selected.unselect();
	Blockly.selected = selected;
	
}


/**
	This function takes the cursor to the input connection on a block when
	this.currentSelection is set to a connection of an input of the block
 */
 
Blockly.Accessibility.CursorNavigation.goToInputConnectionOfSelectedConnection = function (){
	
	
	var selected = Blockly.selected;
	Blockly.selected.unselect();
	Blockly.selected = this.currentSelection.sourceBlock_;
	
	//reset block input list to inputs of this current block and reset the index to index of current selection;
	this.initBlockInputList();
		
	//get index of connection input from Blockly.Accessibility.InBlock.selectionList
	
	for (var i = 0, input; input = Blockly.Accessibility.InBlock.selectionList[i]; i++){
		if((input instanceof Blockly.Input) && input.connection === this.currentSelection){
			
			break;
		}
		
		
	}
	
	Blockly.Accessibility.InBlock.connectionsIndex = i; // 
	Blockly.Accessibility.InBlock.selectCurrent();
	this.currentSelection = this.returnCurrentlySelectedInput();
	console.log('>>> connection name of surroundParent: ' +  Blockly.Accessibility.InBlock.selectionList[Blockly.Accessibility.InBlock.connectionsIndex].name);
}

















