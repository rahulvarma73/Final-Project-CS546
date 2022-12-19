function myStartFunction(){
    document.getElementById("start-button-final").className = "btn btn-secondary"
    // document.getElementById("start-button-final").disvbled = true;
    document.getElementById("finish-button-final").className = "btn btn-secondary"
    // document.getElementById("finish-button-final").disabled = true;
    
}

function myStopFunction(){
    document.getElementById("stop-button-final").disabled = true;
    document.getElementById("start-button-final").disabled = false;
    document.getElementById("finish-button-final").disabled = false;
}

function myFinishFunction(){
    document.getElementById("stop-button-final").disabled = true;
    document.getElementById("start-button-final").disabled = true;
    document.getElementById("finish-button-final").disabled = true;
}