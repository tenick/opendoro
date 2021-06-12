var startTimerBtn = document.getElementById('start-timer-btn');
var stopTimerBtn = document.getElementById('stop-timer-btn');
var countdownWatchDiv = document.getElementById("countdown-watch")

const STUDY_SECONDS = 1500;
const BREAK_SECONDS = 300;
countdownWatchDiv.innerHTML = secsToMMSS(STUDY_SECONDS);

var currStudySecs = STUDY_SECONDS;
var currBreakSecs = BREAK_SECONDS;

var toggle = 0;
var btnToggle = 0;

var intervalID = null;

function studyTimeTick() {
    currStudySecs -= 1;
    countdownWatchDiv.innerHTML = secsToMMSS(currStudySecs);

    if (currStudySecs == 0)
        stopTimerBtn.click();
}

function breakTimeTick() {
    currBreakSecs -= 1;
    countdownWatchDiv.innerHTML = secsToMMSS(currBreakSecs);

    if (currBreakSecs == 0)
        stopTimerBtn.click();
}

// onclick functions
function startBtnClick() {
    if (btnToggle % 2 == 0) {
        changeButtonsPressability();
        let callback = studyTimeTick;
        if (toggle % 2 == 1)
            callback = breakTimeTick
        
        intervalID = window.setInterval(callback, 1000);

        btnToggle++;
    }
}

function stopBtnClick() {
    if (btnToggle % 2 == 1) {
        changeButtonsPressability();
        clearInterval(intervalID);
        intervalID = null;

        // if currently study time
        if (toggle % 2 == 0) {
            countdownWatchDiv.innerHTML = secsToMMSS(STUDY_SECONDS);
            if (currStudySecs == 0) {
                changePomodoroTimer();
                toggle++;
            }
            currStudySecs = STUDY_SECONDS;
        }
        // if currently break time
        else {
            countdownWatchDiv.innerHTML = secsToMMSS(BREAK_SECONDS);
            if (currBreakSecs == 0) {
                changePomodoroTimer();
                toggle++;
            }
            currBreakSecs = BREAK_SECONDS;
        }
        
        btnToggle++;
    }
}

startTimerBtn.addEventListener('click', startBtnClick);
stopTimerBtn.addEventListener('click', stopBtnClick);


// ui update functions
function changeButtonsPressability() {
    let startAttrib = 'btn';
    let stopAttrib = 'btn-disabled';

    if (startTimerBtn.getAttribute('class') == 'btn') {
        startAttrib = stopAttrib;
        stopAttrib = 'btn';
    }

    startTimerBtn.setAttribute('class', startAttrib);
    stopTimerBtn.setAttribute('class', stopAttrib);
}

function changePomodoroTimer() {
    let attrib = 'countdown-watch-break';
    let secs = BREAK_SECONDS;
    if (toggle % 2 == 1) {
        attrib = 'countdown-watch-study'
        secs = STUDY_SECONDS;
    }
    
    countdownWatchDiv.setAttribute('class', attrib);
    countdownWatchDiv.innerHTML = secsToMMSS(secs);
}

function secsToMMSS(secs) {
    let mins = Math.floor(secs/60);
    let remainSecs = secs % 60;
    return String(mins).padStart(2, '0') + ':' + String(remainSecs).padStart(2, '0');
}