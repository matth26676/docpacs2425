var answer = '';

function doLongTask(callback) {
    console.log('Getting your answer now...');
    setTimeout(() => {answer = 'Yes'; callback();},3000);
    callback();
}

var printAnswer = () => {console.log('Your answer is ${answer}');}

doLongTask(printAnswer);
