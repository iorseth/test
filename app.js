const playRandomNoteBtn = document.getElementById('playRandomNote');
const replayNoteBtn = document.getElementById('replayNote');
const optionsDiv = document.getElementById('options');
const resultDiv = document.getElementById('result');
const noteCountInput = document.getElementById('noteCount');

let correctNote;

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

  shuffledNotes.forEach(note => {
    const btn = document.createElement('button');
    btn.classList.add('btn', 'btn-outline-secondary', 'mx-2');
    btn.textContent = note;
    btn.dataset.note = note;
    btn.style.color = getColorForNote(note);
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

  // Create a span to display the played note
  const playedNoteSpan = document.createElement('span');
  playedNoteSpan.textContent = userAnswer;
  playedNoteSpan.style.color = getColorForNote(userAnswer);
  animationDiv.appendChild(playedNoteSpan);

  if (userAnswer === correctNote) {
    resultMessage = 'Correct! 🎉';
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

createNoteCountLabel();

playRandomNoteBtn.addEventListener('click', () => {
  displayNoteOptions();
  playRandomNote();
  resultDiv.textContent = ''; // Clear the result message
});

optionsDiv.addEventListener('click', checkAnswer);

// Update the label when the range slider value changes
noteCountInput.addEventListener('input', () => {
  updateNoteCountLabel();
});

// Replay the current note when the replay button is clicked
replayNoteBtn.addEventListener('click', () => {
  playRandomNote();
});

