// Init
const input = document.querySelector('.speedtest-input');
const container = document.querySelector('#speedtest-text');
const test = document.querySelector('#speedtest-container');
let modal = document.getElementById("scoreboard");
const span = document.getElementsByClassName("close")[0];

let isStarting = false;
let wpmInterval = null;
let time = 0;
let typeMiss = 0;

test.addEventListener('click', function(e) {
    inputFocus();
});

function inputFocus() {
    input.focus();
}

inputFocus();

// Handle the language selection
const selectLanguage = document.querySelector('#language-select');
selectLanguage.addEventListener('change', function(e) {
    language = this.value;
    localStorage.setItem('languageSelected', this.value);
    start();
});

selectLanguage.value = localStorage.getItem('languageSelected') ? localStorage.getItem('languageSelected') : 'Javascript';

function start() {
    const request = generateFunctionWithOpenAI();

    request.then((response) => {
        initSpeedtestInterface(response.message);
    });

    resetAll();
    inputFocus();
}

start();

function resetAll() {
    closeModal();
    clearInterval(wpmInterval);
    container.innerHTML = "";
    time = 0;
    typeMiss = 0;
    isStarting = false;
    setWpm(0);
    setAccuracy(100);
}

// Description: Call the OpenAi API to generate a function in the language of your choice
async function generateFunctionWithOpenAI() {
    const res = await fetch("http://localhost:3000/api/generate-function", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nameLanguage: selectLanguage.value
        })
    });

    const json = await res.json();
    return json;
}

// Display text for the test
function initSpeedtestInterface(text) {
    let textSplited = splitTextIntoCharacters(text);
    let indexes = getSpaceIndexes(textSplited);
    let newarr = testArr(textSplited, indexes);

    addFormatedTextToContainer(newarr);
}

function addFormatedTextToContainer(text) {
    for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.classList.add('char', 'char');
        if (i === 0) {
            span.classList.add('char', 'char__active');
        } 

        if (text[i] === "\t") {
            span.classList.add('char', 'char__tab');
        }
        else if (text[i] === "\n") {
            span.classList.add('char', 'char__enter');
        }
        
        span.classList.add('char');
        span.innerText = text[i];
        container.appendChild(span);
    }
}

function splitTextIntoCharacters(text) {
    return text.split('');
}

function getSpaceIndexes(str) {
  const indexes = [];
  
  for (let i = 0; i < str.length; i++) {
    if (str[i] === " ") {
      indexes.push(i);
    }
  }
  
  return indexes;
}

function testArr(arr, indexes) {
    let removed = 0;
    let length = indexes.length
    for (let i = 0; i < length; i++) {
        if (i+1 <= length-1 && indexes[i+1] - indexes[i] <= 1) {
            arr[indexes[i+1]-removed] = "\t";
            arr.splice(indexes[i]-removed, 1);
            removed++;
        }
    }

    return arr;
}

// Handles the keypresses
input.addEventListener('input', function(e) {
    try {
        const activeChar = container.querySelector('.char__active');
        const nextChar = activeChar.nextElementSibling;
    
        if (!isStarting) {
            isStarting = true;
            startTimer();
        }
    
        if (e.data === activeChar.innerText) {
            goodAnswer(activeChar, nextChar);
        } else {
            typeMiss++;
            activeChar.classList.add('char__bad');
            activeChar.classList.add('char__miss');
        }
    
        input.value = "";
    
        calculateAccuracy();
    
        if (nextChar === null) {
            endTest();
        }
    } catch(e) {
        console.log("No more characters to type");
    }
    
});

input.addEventListener('keydown', function(e) {
    try {
        const activeChar = container.querySelector('.char__active');
        const nextChar = activeChar.nextElementSibling;
    
        if (!isStarting) {
            isStarting = true;
            startTimer();
        }
    
        if (e.key === "Tab" || e.key === "Enter") {
            e.preventDefault();
        }
    
        if (e.key === "Tab" && activeChar.classList.contains('char__tab')) {
            e.preventDefault();
            goodAnswer(activeChar, nextChar);
        } else if (e.key === "Enter" && activeChar.classList.contains('char__enter')) {
            goodAnswer(activeChar, nextChar);
        }
    } catch(e) {
        console.log("No more characters to type");
    }
});

function goodAnswer(activeChar, nextChar) {
    if (nextChar === null) {
        endTest();
    }

    if (activeChar.classList.contains('char__bad')) {
        activeChar.classList.remove('char__bad');
    }
    activeChar.classList.remove('char__active');
    activeChar.classList.add('char__good');
    nextChar.classList.add('char__active');
}

function endTest() {
    clearInterval(wpmInterval);
    openModal();
}

// Calculate score
function startTimer() {
    const delay = 1000;
    wpmInterval = setInterval(calculateWPM, delay)
}

function calculateWPM() {
    time += 1;
    const wpm = Math.round((container.querySelectorAll('.char__good').length / 5) / (time / 60));

    setWpm(wpm);
}

function calculateAccuracy() {
    const accuracy = (container.querySelectorAll('.char__miss').length / container.querySelectorAll('.char').length) * 100;

    setAccuracy(accuracy);
}

function setWpm(wpm) {
    document.querySelectorAll('.wpm').forEach((el) => {
        el.innerText = wpm;
    });
}

function setAccuracy(accuracy) {
    document.querySelectorAll('.accuracy').forEach((el) => {
        el.innerText = 100 - accuracy.toFixed(1);
    });
}

// Modal
function openModal() {
  modal.style.display = "flex";
}

function closeModal() {
    modal.style.display = "none";
}

window.addEventListener('click', function(e) {
    if (e.target == modal) {
        closeModal();
    }
});