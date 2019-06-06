goog.provide('Blockly.Accessibility.CursorNavigation');

goog.require('Blockly.Block');
goog.require('Blockly.Accessibility.Navigation');
goog.require('Blockly.Accessibility.MenuNav');
goog.require('Blockly.Accessibility.Speech');
goog.require('Blockly.Accessibility');


Blockly.Accessibility.CursorNavigation.currentLocation = 0;
Blockly.Accessibility.CursorNavigation.currentSelection = null;
Blockly.Accessibility.CursorNavigation.currentHighlight = null;
Blockly.Accessibility.CursorNavigation.currentInputIndex = 0;




/**
 * For traversing down from previou-connection to block to next-connection etc
 * For traverses to down/to the left through the input connections of a block.
 *
 */

Blockly.Accessibility.CursorNavigation.goDown =  function(){
	if(this.currentLocation === 1){
		this.currentSelection = this.currentSelection.sourceBlock_;
		this.goToBlock();
		
	}else if(this.currentLocation === 2 && Blockly.selected){
		
		this.currentLocation = 3;
		this.currentSelection = Blockly.selected.nextConnection;
		this.currentHighlight = this.currentSelection.returnHighlight();
		
		var selected = Blockly.selected;
		Blockly.selected.unselect();
		Blockly.selected = selected;
	}
	else if(this.currentLocation === 3 && this.currentSelection != null && this.currentSelection.targetConnection !=null ){
		this.currentLocation = 2;
		Blockly.Connection.removeHighlight(this.currentHighlight);
		this.currentSelection = this.currentSelection.targetConnection.sourceBlock_;
		this.currentSelection.select();
		this.currentHighlight = null;
		
	}
	else if(this.currentLocation === 4){ //ABOU this is not responding as expected
		this.currentInputIndex ++;
		if (this.currentInputIndex >= Blockly.selected.inputList.length){
			this.currentInputIndex = Blockly.selected.inputList.length - 1;
		}
		Blockly.Connection.removeHighlight(this.currentHighlight);
		this.currentSelection = Blockly.selected.inputList[this.currentInputIndex].connection;
		this.currentHighlight = this.currentSelection.returnHighlight();
	}
	
	console.log('ABOU: go down');
	
};


/**
 * For traversing Up from next-connection to block to previous-connection etc
 * For traverses to up/to the right through the input connections of a block.
 *
 */
Blockly.Accessibility.CursorNavigation.goUp = function(){
	if(this.currentLocation === 3){
		this.currentSelection = this.currentSelection.sourceBlock_;
		this.goToBlock();
		
	}else if(this.currentLocation === 2 && Blockly.selected && this.currentSelection.previousConnection != null && this.currentSelection.previousConnection.targetConnection != null ){
		
		this.currentLocation = 3;
		this.currentSelection = Blockly.selected.previousConnection.targetConnection;
		this.currentHighlight = this.currentSelection.returnHighlight();
		
		var selected = Blockly.selected;
		Blockly.selected.unselect();
		Blockly.selected = selected;
	}
	else if(this.currentLocation === 2 && Blockly.selected && this.currentSelection.previousConnection != null && this.currentSelection.previousConnection.targetConnection == null ){
		
		this.currentLocation = 1;
		this.currentSelection = Blockly.selected.previousConnection;
		this.currentHighlight = this.currentSelection.returnHighlight();
		
		var selected = Blockly.selected;
		Blockly.selected.unselect();
		Blockly.selected = selected;
	}
	
	console.log('ABOU: goUp');
	
}




/**
 *Traverses left, from block to input, from input to block
 *
 */
Blockly.Accessibility.CursorNavigation.goLeft = function(){
	if(this.currentLocation === 2 && Blockly.selected){
		this.currentLocation = 4 //for inputs
		this.currentInputIndex = 0;
		this.currentSelection = Blockly.selected.inputList[this.currentInputIndex].connection;
		this.currentHighlight = this.currentSelection.returnHighlight();
		
		var selected = Blockly.selected;
		Blockly.selected.unselect();
		Blockly.selected = selected;
		
	}else if (this.currentLocation === 4){
		
		//this.currentLocation = 2;
		//Blockly.Connection.removeHighlight(this.currentHighlight);
		this.currentSelection = this.currentSelection.targetConnection.sourceBlock_;
		//Blockly.selected = null;
		//this.currentSelection.select();
		//this.currentHighlight = null;
		this.goToBlock();
	}
	
}




Blockly.Accessibility.CursorNavigation.goToBlock = function(){
	this.currentLocation = 2;
	Blockly.Connection.removeHighlight(this.currentHighlight);
	//this.currentSelection = this.currentSelection.sourceBlock_;
	Blockly.selected = null;
	this.currentSelection.select();
	this.currentHighlight = null;
	
	
}


Blockly.Accessibility.CursorNavigation.initialize = function(){
	this.currentLocation = 2;
	this.currentSelection = Blockly.selected;
	console.log('ABOU: init successful');
}




















