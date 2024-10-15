var answer = "";

function doLongTask(callback) {
    console.log("Getting your answer now... ")
    setTimeout(() => {answer = "Yes"; callback();}, 3000)
}

var printAns = () => {console.log(`Your answer is ${answer}`)}

doLongTask(printAns);