var loading = false;
function earNestLevel(currentNode){
    if(currentNode!=null){
        var speakLevel="";
        var arrLength = perfectArr.length; //The length of the parentArr and perfectArr arrays
        for (var i = 0; i < arrLength; i++) {
            if(currentNode.getAttribute('id') === perfectArr[i].getAttribute('id')){
                var nestInfo = prefixArr[i].substring(1);
                var initialArray = nestInfo.split(".");
                var nestArray=[];
                for(var j=0;j<initialArray.length;j++){
                    for(var k=0;k<initialArray[j];k++){
                        nestArray.push(initialArray[j]);
                    }
                    nestArray.push("-1");
                }
                for(var j=0;j<nestArray.length;j++){
                    switch (nestArray[j])
                    {
                        case "-1": nestArray[j]=-1; break;
                        case "1": nestArray[j]=41;break;
                        case "2": nestArray[j]=42;break;
                        case "3": nestArray[j]=43;break;
                        case "4": nestArray[j]=44;break;
                        case "5": nestArray[j]=45;break;
                        default: nestArray[j]=73;break;
                    }
                }  
                var tempNotes=[];
                for(var j=0;j<nestArray.length;j++){
                    if(nestArray[j]===-1){
                        var speed=tempNotes.length;
                        loading = true;
                        T.soundfont.preLoad(tempNotes);
                        function play()={
                            if(!loading){
                                playNotes(tempNotes,speed);
                                return;
                            }
                            else{
                                setTimeout(function() {play();}, 10);
                            }
                        }
                        tempNotes=[];
                    }
                    else{
                        tempNotes.push(nestArray[j]);
                    }
                }
                break;
            }
        }
    }
};