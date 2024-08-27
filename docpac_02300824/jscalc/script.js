let result = document.getElementById('result');
let box = document.getElementById('box');
let clear = document.getElementById('clear')
let number1 = document.getElementById('number1')
let number2 = document.getElementById('number2')

clear.style.display = "none"
result.addEventListener('click', update = () => {
    let num1 = parseInt(number1.value)
    let num2 = parseInt(number2.value)
    let options = document.getElementsByTagName('option');
    
    if (number1.value && number2.value){
        if (options[0].selected) {
            box.innerHTML = num1 + num2
        } else if (options[1].selected) {
            box.innerHTML = num1 - num2
        } else if (options[2].selected) {
            box.innerHTML = num1 * num2
        } else if (options[3].selected) {
            box.innerHTML = num1 / num2
        } else {
            box.innerHTML = num1 % num2
        }
        box.style.opacity = 1
        clear.style.display = "block"
        result.style.display = "none"
    } else {
        box.innerHTML = "INVALID"
        box.style.opacity = 1
        setTimeout(() => {
            box.style.opacity = 0
        }, 1000)
    }
    
})

clear.addEventListener('click', () => {
    box.style.opacity = 0
    // result.disabled = false
    result.style.display = "block"
    clear.style.display = "none"
    number1.value = ''
    number2.value = ''
})
