let answer = ''

doLongTask = (callback) => {
    console.log('Getting your answer now...');
    setTimeout(() => {answer = 'Yes'; callback();}, 3000); 
};

let printAnswer = () => {console.log(`Your answer is ${answer}`);}

doLongTask(printAnswer);