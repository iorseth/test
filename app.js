const playRandomNoteBtn = document.getElementById('playRandomNote');
const replayNoteBtn = document.getElementById('replayNote');
const optionsDiv = document.getElementById('options');
const resultDiv = document.getElementById('result');
const noteCountInput = document.getElementById('noteCount');
const successRateProgressBar = document.getElementById('successRateProgressBar');
const toggleBackgroundMusicBtn = document.getElementById('toggleBackgroundMusic');
const backgroundMusic = document.getElementById('backgroundMusic');

let correctNote;
let attempts = 0;
let successes = 0;

function generateRandomNotes() {
  const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
  const noteOptions = [];
  correctNote = notes[Math.floor(Math.random() * notes.length)];
  noteOptions.push(correctNote);

  while (noteOptions.length < noteCountInput.value) {
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    if (!noteOptions.includes(randomNote)) {
      noteOptions.push(randomNote);
    }
  }

  return noteOptions;
}

function getColorForNote(note) {
  const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
  const noteIndex = notes.indexOf(note);

  const r = Math.floor(255 * (noteIndex / (notes.length - 1)));
  const g = 0;
  const b = Math.floor(255 * (1 - noteIndex / (notes.length - 1)));

  return `rgb(${r}, ${g}, ${b})`;
}

function displayNoteOptions() {
  optionsDiv.innerHTML = '';

  const noteOptions = generateRandomNotes();
  const shuffledNotes = noteOptions.sort(() => Math.random() - 0.5);

  shuffledNotes.forEach((note, index) => {
    const btn = document.createElement('button');
    btn.classList.add('btn', 'btn-outline-secondary', 'mx-2', 'animate__animated');
    btn.textContent = note;
    btn.dataset.note = note;
    btn.style.color = getColorForNote(note);

    // Add animations
    setTimeout(() => {
      btn.classList.add('animate__fadeInUp');
    }, index * 100);

    btn.addEventListener('animationend', () => {
      btn.classList.remove('animate__fadeInUp');
    });

    optionsDiv.appendChild(btn);
  });
}

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

async function playNote(note) {
  const url = `assets/songs/${note}.mp3`; // Replace with the path to your MP3 files
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
}

function playRandomNote() {
  playNote(correctNote);
}

function checkAnswer(e) {
  if (!e.target.dataset.note) return;

  const userAnswer = e.target.dataset.note;
  let resultMessage;

  const animationDiv = document.createElement('div');
  animationDiv.classList.add('animate__animated', 'animate__zoomIn', 'animate__faster');
  animationDiv.style.position = 'fixed';
  animationDiv.style.top = '50%';
  animationDiv.style.left = '50%';
  animationDiv.style.transform = 'translate(-50%, -50%)';
  animationDiv.style.fontSize = '4rem';
  animationDiv.style.fontWeight = 'bold';
  animationDiv.style.zIndex = 1000;

  const playedNoteSpan = document.createElement('span');
  playedNoteSpan.textContent = userAnswer;
  playedNoteSpan.style.color = getColorForNote(userAnswer);
  animationDiv.appendChild(playedNoteSpan);

  attempts++;

  if (userAnswer === correctNote) {
    resultMessage = 'Correct! 🎉';
    successes++;
    const correctIcon = document.createElement('span');
    correctIcon.textContent = '🎉';
    correctIcon.style.marginLeft = '10px';
    animationDiv.appendChild(correctIcon);
  } else {
    resultMessage = 'Incorrect 😞';
    const incorrectIcon = document.createElement('span');
    incorrectIcon.textContent = '😞';
    incorrectIcon.style.marginLeft = '10px';
    animationDiv.appendChild(incorrectIcon);
  }

  updateSuccessRate();

  document.body.appendChild(animationDiv);

  playNote(userAnswer);

  setTimeout(() => {
    document.body.removeChild(animationDiv);
    resultDiv.textContent = resultMessage;
  }, 1000); // Remove the animation after 1 second (1000 ms)
}

function createNoteCountLabel() {
  const noteCountLabelContainer = document.getElementById('noteCountLabelContainer');
  const label = document.createElement('span');
  label.id = 'noteCountLabel';
  label.style.position = 'absolute';
  noteCountLabelContainer.appendChild(label);

  updateNoteCountLabel();
}

function updateNoteCountLabel() {
  const label = document.getElementById('noteCountLabel');
  label.textContent = noteCountInput.value;
  const percentage = ((noteCountInput.value - 2) / 5) * 100;
  label.style.left = `${percentage}%`;
  label.style.transform = 'translateX(-50%)';
}

function updateSuccessRate() {
  const successRate = Math.round((successes / attempts) * 100);
  successRateProgressBar.style.width = `${successRate}%`;
  successRateProgressBar.textContent = `${successRate}%`;
}

function toggleBackgroundMusic() {
  if (backgroundMusic.paused) {
    backgroundMusic.play();
    toggleBackgroundMusicBtn.textContent = 'Pause Background Music';
  } else {
    backgroundMusic.pause();
    toggleBackgroundMusicBtn.textContent = 'Play Background Music';
  }
}

createNoteCountLabel();

playRandomNoteBtn.addEventListener('click', () => {
  displayNoteOptions();
  playRandomNote();
  resultDiv.textContent = ''; // Clear the result message
});

optionsDiv.addEventListener('click', checkAnswer);

noteCountInput.addEventListener('input', () => {
  updateNoteCountLabel();
});

replayNoteBtn.addEventListener('click', () => {
  playRandomNote();
});

toggleBackgroundMusicBtn.addEventListener('click', () => {
  toggleBackgroundMusic();
});

