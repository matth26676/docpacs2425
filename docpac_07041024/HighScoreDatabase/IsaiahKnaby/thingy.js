var answer = '';

function doLongTask(callback) {
    console.log("getting your answer just wait");
    setTimeout(() => { answer = 'YES FATHER NOURISH THY CHILDREN'; callback(); }, 3000);

}

var printAnswer = () => { console.log(`your answer is ${answer}`); }

doLongTask(printAnswer);
