let result = document.getElementById('result');
let box = document.getElementById('box');
let clear = document.getElementById('clear')
let number1 = document.getElementById('number1')
let number2 = document.getElementById('number2')

result.addEventListener('click', update = () => {
    let num1 = parseInt(number1.value)
    let num2 = parseInt(number2.value)
    let options = document.getElementsByTagName('option');
    
    
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
    result.disabled = true
})

clear.addEventListener('click', () => {
    box.innerHTML = ''
    box.style.opacity = 0
    result.disabled = false
    number1.value = ''
    number2.value = ''
})
