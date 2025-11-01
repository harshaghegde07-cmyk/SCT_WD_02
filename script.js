// script.js
let startTime, updatedTime, difference = 0, tInterval, running = false, lapCounter = 1, previousLapTime = 0;

const display = document.getElementById('display');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resetBtn = document.getElementById('reset');
const lapBtn = document.getElementById('lap');
const laps = document.getElementById('laps');
const body = document.body;

function formatTime(time) {
  let hours = Math.floor(time / (1000 * 60 * 60));
  let minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((time % (1000 * 60)) / 1000);
  let milliseconds = Math.floor((time % 1000) / 10);

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;
  milliseconds = milliseconds < 10 ? "0" + milliseconds : milliseconds;

  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function startTimer() {
  if (!running) {
    startTime = new Date().getTime() - difference;
    tInterval = setInterval(updateTime, 10);
    running = true;
    startBtn.style.opacity = '0.6';
    startBtn.style.pointerEvents = 'none';
    body.classList.remove('paused');
    startBtn.setAttribute('aria-label', 'Timer is running');
    pauseBtn.setAttribute('aria-label', 'Pause timer');
    display.setAttribute('aria-label', 'Elapsed time running');
  }
}

function pauseTimer() {
  if (running) {
    clearInterval(tInterval);
    difference = new Date().getTime() - startTime;
    running = false;
    startBtn.style.opacity = '1';
    startBtn.style.pointerEvents = 'auto';
    body.classList.add('paused');
    startBtn.setAttribute('aria-label', 'Start timer');
    pauseBtn.setAttribute('aria-label', 'Resume timer');
    display.setAttribute('aria-label', 'Timer paused at ' + display.textContent);
  }
}

function resetTimer() {
  clearInterval(tInterval);
  running = false;
  difference = 0;
  lapCounter = 1;
  previousLapTime = 0;
  laps.innerHTML = '';
  display.innerHTML = '00:00:00<span class="milliseconds">.00</span>';
  startBtn.style.opacity = '1';
  startBtn.style.pointerEvents = 'auto';
  body.classList.remove('paused');
  startBtn.setAttribute('aria-label', 'Start timer');
  pauseBtn.setAttribute('aria-label', 'Pause timer');
  display.setAttribute('aria-label', 'Elapsed time');
  // Clear localStorage
  localStorage.removeItem('stopwatchLaps');
}

function updateTime() {
  updatedTime = new Date().getTime() - startTime;

  let hours = Math.floor(updatedTime / (1000 * 60 * 60));
  let minutes = Math.floor((updatedTime % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((updatedTime % (1000 * 60)) / 1000);
  let milliseconds = Math.floor((updatedTime % 1000) / 10);

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;
  milliseconds = milliseconds < 10 ? "0" + milliseconds : milliseconds;

  display.innerHTML = `${hours}:${minutes}:${seconds}<span class="milliseconds">.${milliseconds}</span>`;
}

function recordLap() {
  if (running) {
    const currentTime = updatedTime || (new Date().getTime() - startTime);
    const splitTime = currentTime - previousLapTime;
    previousLapTime = currentTime;

    const li = document.createElement('li');
    const lapNumber = document.createElement('span');
    const lapTime = document.createElement('span');
    const splitElement = document.createElement('span');

    lapNumber.className = 'lap-number';
    lapNumber.textContent = `Lap ${lapCounter}`;

    lapTime.className = 'lap-time';
    lapTime.textContent = formatTime(currentTime);

    splitElement.className = 'split-time';
    splitElement.textContent = `(+${formatTime(splitTime)})`;

    li.appendChild(lapNumber);
    li.appendChild(lapTime);
    li.appendChild(splitElement);
    laps.insertBefore(li, laps.firstChild);
    lapCounter++;

    // Save to localStorage
    let savedLaps = JSON.parse(localStorage.getItem('stopwatchLaps') || '[]');
    savedLaps.unshift({ number: lapCounter - 1, time: formatTime(currentTime), split: formatTime(splitTime) });
    localStorage.setItem('stopwatchLaps', JSON.stringify(savedLaps));
  }
}

// Load laps from localStorage on init
function loadLaps() {
  const savedLaps = JSON.parse(localStorage.getItem('stopwatchLaps') || '[]');
  savedLaps.forEach(lap => {
    const li = document.createElement('li');
    const lapNumber = document.createElement('span');
    const lapTime = document.createElement('span');
    const splitElement = document.createElement('span');

    lapNumber.className = 'lap-number';
    lapNumber.textContent = `Lap ${lap.number}`;

    lapTime.className = 'lap-time';
    lapTime.textContent = lap.time;

    splitElement.className = 'split-time';
    splitElement.textContent = `(+${lap.split})`;

    li.appendChild(lapNumber);
    li.appendChild(lapTime);
    li.appendChild(splitElement);
    laps.appendChild(li); // Append for loaded laps to maintain order
  });
  if (savedLaps.length > 0) {
    lapCounter = Math.max(...savedLaps.map(l => l.number)) + 1;
  }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
  switch(e.key.toLowerCase()) {
    case ' ':
      e.preventDefault();
      running ? pauseTimer() : startTimer();
      break;
    case 'r':
      if (e.ctrlKey || e.metaKey) resetTimer(); // Ctrl+R or Cmd+R for reset
      break;
    case 'l':
      recordLap();
      break;
  }
});

// Initial load
loadLaps();
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
lapBtn.addEventListener('click', recordLap);