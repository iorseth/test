const pianoNotes = {
  "C4": "path/to/C4.mp3",
  "D4": "path/to/D4.mp3",
  "E4": "path/to/E4.mp3",
  // Add more piano notes as needed
};

const playRandomNote = document.getElementById("playRandomNote");
const replayNote = document.getElementById("replayNote");
const noteChoicesContainer = document.getElementById("noteChoicesContainer");
const message = document.getElementById("message");

let currentNote = null;

function getRandomNote() {
  const noteKeys = Object.keys(pianoNotes);
  return noteKeys[Math.floor(Math.random() * noteKeys.length)];
}

function playNoteAudio(note) {
  const audio = new Audio(pianoNotes[note]);
  audio.play();
}

function displayNoteChoices(trueNote, falseNote) {
  const randomOrder = Math.random() < 0.5;

  const firstNote = randomOrder ? trueNote : falseNote;
  const secondNote = randomOrder ? falseNote : trueNote;

  noteChoicesContainer.innerHTML = `
      <img src="static/img/${firstNote}.png" alt="${firstNote}" class="note-choice img-thumbnail me-2" data-note="${firstNote}" style="cursor:pointer;">
      <img src="static/img/${secondNote}.png" alt="${secondNote}" class="note-choice img-thumbnail" data-note="${secondNote}" style="cursor:pointer;">
  `;

  const noteChoices = document.querySelectorAll(".note-choice");
  noteChoices.forEach((choice) => {
    choice.addEventListener("click", (e) => {
      const selectedNote = e.target.dataset.note;
      playNoteAudio(selectedNote);

      setTimeout(() => {
        const noteAnimation = document.createElement("div");
        noteAnimation.className = "note-animation";
        noteAnimation.textContent = selectedNote;
        document.body.appendChild(noteAnimation);

        setTimeout(() => {
          noteAnimation.remove();

          if (selectedNote === trueNote) {
            message.textContent = `Correct! This is a ${trueNote}.`;
          } else {
            message.textContent = `Incorrect! You chose ${selectedNote}.`;
          }
          message.classList.add("message-animation");
        }, 2000);
      }, 1000);
    });
  });
}

playRandomNote.addEventListener("click", () => {
  const trueNote = getRandomNote();
  let falseNote;
  do {
    falseNote = getRandomNote();
  } while (trueNote === falseNote);

  playNoteAudio(trueNote);
  currentNote = trueNote;
  replayNote.style.display = "inline-block";
  displayNoteChoices(trueNote, falseNote);
});

replayNote.addEventListener("click", () => {
  if (currentNote) {
    playNoteAudio(currentNote);
  }
});

