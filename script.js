/* MAIN CODE */
let left = "";
let right = "";
let operator = "";
const keys = initKeys();
initCalculator();



/* FUNCTIONS */
function initKeys() {
    return [
        {id:	"all-clear",	key:	"a",    type: "command"}, // event.Key === (a || A)
        {id:	"clear",	    key:	"c",    type: "command"}, // event.Key === (c || C)
        {id:	"backspace",	key:	"bs",    type: "command"}, // event.key === (Backspace)
                    
        {id:	"zero",	        key:	"0",    type: "number"},
        {id:	"one",	        key:	"1",    type: "number"},
        {id:	"two",	        key:	"2",    type: "number"},
        {id:	"three",    	key:	"3",    type: "number"},
        {id:	"four",	        key:	"4",    type: "number"},
        {id:	"five",	        key:	"5",    type: "number"},
        {id:	"six",          key:	"6",    type: "number"},
        {id:	"seven",        key:	"7",    type: "number"},
        {id:	"eight",    	key:	"8",    type: "number"},
        {id:	"nine",	        key:	"9",    type: "number"},
        {id:	"decimal",	    key:	".",    type: "number"},
                    
        {id:	"equals",	    key:	"=",   type: "operator"}, // Event.key === (Enter)
        {id:	"plus",	        key:	"+",    type: "operator"}, // Event.key === (+ || =)
        {id:	"minus",	    key:	"-",    type: "operator"},
        {id:	"multiply",	    key:	"*",    type: "operator"}, // Event.key === (* || x)
        {id:	"divide",	    key:	"/",    type: "operator"}
    ]
}

function initCalculator() {
    initButtonGrid();
    window.addEventListener("keydown",keyDown);
    window.addEventListener("keyup",keyUp)

}
function initButtonGrid() {
    const buttons = document.querySelectorAll(".button-grid div");
    buttons.forEach( button => {
        button.style.gridArea = button.id; // Set grid placement
        button.classList.add("button"); // Add button class
        button.classList.add(keys[keyIndexById(button.id)].type); // Add respective type class
        button.addEventListener("mousedown",mouseDown); // Add event listener
        button.addEventListener("mouseup",mouseUp); // Add event listener
    });
}


function keyDown (event) {
    let key = event.key;
    key = standardizeKey(key);
    if (keyIsValid(key)) {
        addActiveClasses(key);
    }
}

function mouseDown (event) {
    const key = keys[keyIndexById(this.id)].key;
    addActiveClasses(key);
}

function keyUp(event) {
    let key = event.key;
    key = standardizeKey(key);
    if (keyIsValid(key)) {
        removeActiveClasses(key);
        executeKey(key);
    }
}

function mouseUp(event) {
    const key = keys[keyIndexById(this.id)].key;
    if (keyIsValid(key)) {
        removeActiveClasses(key);
        executeKey(key);
    }
}

function executeKey(key) {
    if (keyIsDisabled(key)) return;
    const type = keys[keyIndexByKey(key)].type;

    switch (type) {
        case "number":
            executeNumber(key);
            break;
        case "operator":
            executeOperator(key);
            break;
        case "command":
            executeCommand(key);
            break;
    }
}

function expressionIsComplete() {
    return !(left === "" || right === "" || operator === ""); 
}

function executeOperator (key) {
    if (left !== "") enableDecimal();
    if (expressionIsComplete()) {
        left = Number(left);
        right = Number(right);

        let result;
        switch (operator) {
            case "+":
                result = add(left,right);
                break;
            case "-":
                result = subtract(left,right);
                break;
            case "*":
                result = multiply(left,right);
                break;
            case "/":
                result = divide(left,right);
                break;
        }
        
        result = roundTo(result,10);
        logResult(left,operator,right,result);
        left = result.toString();
        right = "";
        setDisplay(left);
    }
    if (left !== "") operator = key;
}

function roundTo(value, places) {
    const corrector = 10**places;
    return Math.round(value*corrector)/corrector;
}

function executeNumber (key) {
    if (key === ".") {
        disableDecimal();
    }
    switch (operator) {
        case "": 
            left = left + key;
            setDisplay(left);
            break;
        case "=":
            operator = "";
            left = key;
            setDisplay(left);
            break;
        default:
            right = right + key;
            setDisplay(right);
            break;
    }
}

function executeCommand (key) {
    if (key == "a") {
        allClear();
    } else {
        if (operator === "") {
            if (key === "c") {
                left = "";
                enableDecimal();
            } else if (key === "bs") {
                left = backspace(left);
            }
            setDisplay(left);
        } else {
            if (key === "c") {
                right = "";
                enableDecimal();
            } else if (key === "bs") {
                right = backspace(right);
            }
            setDisplay(right);
        }
    }
}

function standardizeKey (key) {
    switch (key) {
        case "A":
            key = "a";
            break;
        case "C":
            key = "c";
            break;
        case "Backspace":
            key = "bs";
            break;
        case "Enter":
            key = "=";
            break;
        case "=":
            key = "+";
            break;
        case "x":
            key = "*";
            break;
    }
    return key;
}

function getElementById(id) {
    return document.querySelector(`#${id}`);
}

function isActive(element) {
    return element.classList.contains("active");
}

function activate (element) {
    element.classList.add("active");
}

function deactivate (element) {
    element.classList.remove("active");
}

function deactivateOtherOperators (element) {
    const operators = document.querySelectorAll(".operator");
    operators.forEach(operator => {
        if (isActive(operator) && operator !== element) {
            deactivate(operator);
        }
    });
}

function addActiveClasses (key) {
    const index = keyIndexByKey(key);
    const id = keys[index].id;
    const type = keys[index].type;
    const element = getElementById(id);

    if (id === "all-clear" || type === "operator") {
        deactivateOtherOperators(element);
    }
    activate(element);
}

function removeActiveClasses (key) {
    const index = keyIndexByKey(key);
    const id = keys[index].id;
    const type = keys[index].type;
    const element = getElementById(id);

    if (type !== "operator" || (left === "" || id === "equals")) {
        deactivate (element);
    }
}

function enableDecimal() {
    const element = document.querySelector("#decimal");
    element.classList.remove("disabled");
}

function disableDecimal() {
    const element = document.querySelector("#decimal");
    element.classList.add("disabled");
}

function keyIsDisabled(key) {
    const id = "#"+keyId(key);
    return document.querySelector(id).classList.contains("disabled");
}

function keyIsValid(key) {
    let valid = keyIndexByKey(key) === -1 ? false : true;
    return valid;
}

function keyIndexById (id) {
    return keys.findIndex(element => {return element.id === id});
}

function keyIndexByKey (key) {
    return keys.findIndex(element => {return element.key === key});
}

function keyId (key) {
    return keys[keyIndexByKey(key)].id;
}

function setDisplay (string) {
    if (string === "") {
        string = "0";
    } else {
        string = addThousandsSeparators(string);
    }
    document.querySelector(".display").textContent = string;
}

function addThousandsSeparators (string) {

    const portions = string.split(".");
    const integerSide = portions[0];

    const numberOfCommas = Math.floor((integerSide.length-1)/3);
    let numberOfLeadingDigits = integerSide.length % 3;
    if (numberOfLeadingDigits === 0) numberOfLeadingDigits = 3;

    let buildString = integerSide.substring(0,numberOfLeadingDigits);
    let restOfString = integerSide.substring(numberOfLeadingDigits);
    
    
    for (let i = 0; i < numberOfCommas; i++) {
        buildString = buildString + "," + restOfString.substring(0,3);
        restOfString = restOfString.substring(3);
    }

    if (portions[1]) buildString = buildString + "." + portions[1];
    return buildString;
}

function add (a,b) {
    return a + b;
}

function subtract (a,b) {
    return a - b;
}

function multiply (a,b) {
    return a * b;
}

function divide (a,b) {
    return a / b;
}


function allClear () {
    left = "";
    operator = "";
    right = "";
    clearLog();
    enableDecimal();
    setDisplay(left);
}

function backspace (string) {
    if(string.charAt(string.length-1) === ".") enableDecimal();
    return string.substring(0,string.length-1);
}

function logResult (left, operator, right, result) {
    let newOperator = operator === "/" ? "÷" : operator;
    let newLeft = addThousandsSeparators(left.toString());
    let newRight = addThousandsSeparators(right.toString());
    let newResult = addThousandsSeparators(result.toString());

    let output = `${newLeft} ${newOperator} ${newRight} = ${newResult}`;

    const newLogItem = document.createElement("div");
    newLogItem.classList.add("log-item");
    newLogItem.textContent = output;
    
    const log = document.querySelector(".log");
    log.insertBefore(newLogItem,log.firstElementChild);
}

function clearLog () {
    const logs = document.querySelectorAll(".log-item");
    logs.forEach(element => element.remove());
}