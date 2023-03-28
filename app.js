const pianoNotes = {
  "C4": "path/to/C4.mp3",
  "D4": "path/to/D4.mp3",
  "E4": "path/to/E4.mp3",
  // Add more piano notes as needed
};

const playRandomNote = document.getElementById("playRandomNote");
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

function resetGame() {
  message.textContent = "";
  message.classList.remove("message-animation");
  noteChoicesContainer.innerHTML = "";
}

function getNoteColor(note) {
  const baseHue = 240; // Blue hue for the lowest note
  const hueRange = 120; // Hue range from lowest to highest note
  const noteKeys = Object.keys(pianoNotes);
  const noteIndex = noteKeys.indexOf(note);
  const hue = baseHue - (noteIndex / (noteKeys.length - 1)) * hueRange;

  return `hsl(${hue}, 100%, 50%)`;
}
function displayNoteChoices(trueNote, falseNote) {
  const randomOrder = Math.random() < 0.5;

  const firstNote = randomOrder ? trueNote : falseNote;
  const secondNote = randomOrder ? falseNote : trueNote;

	noteChoicesContainer.innerHTML = `
    <div class="note-choice" data-note="${firstNote}" style="cursor:pointer; color: ${getNoteColor(firstNote)};">${firstNote}</div>
    <div class="note-choice" data-note="${secondNote}" style="cursor:pointer; color: ${getNoteColor(secondNote)};">${secondNote}</div>
`;



  const noteChoices = document.querySelectorAll(".note-choice");
  noteChoices.forEach((choice) => {
    choice.addEventListener("click", (e) => {
      if (e.target.classList.contains("disabled")) {
        return;
      }

      const selectedNote = e.target.dataset.note;
      playNoteAudio(selectedNote);

      setTimeout(() => {
         const noteAnimation = document.createElement("div");
         noteAnimation.className = "note-animation";
         noteAnimation.textContent = selectedNote;
         noteAnimation.style.color = getNoteColor(selectedNote);
         document.body.appendChild(noteAnimation);

        setTimeout(() => {
          noteAnimation.remove();

         const noteColor = getNoteColor(selectedNote);
         const coloredNote = `<span style="color: ${noteColor}">${selectedNote}</span>`;
         
         if (selectedNote === currentNote) {
           playNoteAudio(selectedNote);
           message.innerHTML = `Correct! This is a ${coloredNote}`;
         } else {
           playNoteAudio(selectedNote);
           message.innerHTML = `Incorrect. This is a ${coloredNote}`;
         }
          // Disable the note choices
          noteChoices.forEach((choice) => {
            choice.classList.add("disabled");
          });
        }, 2000);
      }, 1000);
    });
  });
}

playRandomNote.addEventListener("click", () => {
  setTimeout(() => {
    resetGame();

    const trueNote = getRandomNote();
    let falseNote;
    do {
      falseNote = getRandomNote();
    } while (trueNote === falseNote);

    playNoteAudio(trueNote);
    currentNote = trueNote;
    displayNoteChoices(trueNote, falseNote);
  }, message.classList.contains("message-animation") ? 500 : 0);
});


