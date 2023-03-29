const playRandomNoteBtn = document.getElementById('playRandomNote');
const replayNoteBtn = document.getElementById('replayNote');
const optionsDiv = document.getElementById('options');
const resultDiv = document.getElementById('result');
const noteCountInput = document.getElementById('noteCount');
const noteCountValueLabel = document.getElementById('noteCountValue');

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

function displayNoteOptions() {
  optionsDiv.innerHTML = '';

  const noteOptions = generateRandomNotes();
  const shuffledNotes = noteOptions.sort(() => Math.random() - 0.5);

  shuffledNotes.forEach(note => {
    const btn = document.createElement('button');
    btn.classList.add('btn', 'btn-outline-secondary', 'mx-2');
    btn.textContent = note;
    btn.dataset.note = note;
    optionsDiv.appendChild(btn);
  });
}

function playRandomNote() {
  const synth = new Tone.Synth().toDestination();
  synth.triggerAttackRelease(correctNote, '8n');
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

  if (userAnswer === correctNote) {
    resultMessage = 'Correct! 🎉';
    animationDiv.textContent = '🎉';
  } else {
    resultMessage = 'Incorrect 😞';
    animationDiv.textContent = '😞';
  }

  document.body.appendChild(animationDiv);

  const synth = new Tone.Synth().toDestination();
  synth.triggerAttackRelease(userAnswer, '8n');

  setTimeout(() => {
    document.body.removeChild(animationDiv);
    resultDiv.textContent = resultMessage;
  }, 1000); // Remove the animation after 1 second (1000 ms)
}

playRandomNoteBtn.addEventListener('click', () => {
  displayNoteOptions();
  playRandomNote();
  resultDiv.textContent = ''; // Clear the result message
});

optionsDiv.addEventListener('click', checkAnswer);

// Update the label when the range slider value changes
noteCountInput.addEventListener('input', () => {
  noteCountValueLabel.textContent = noteCountInput.value;
});

// Replay the current note when the replay button is clicked
replayNoteBtn.addEventListener('click', () => {
  playRandomNote();
});

