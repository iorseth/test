
const notes = [
  { name: "C", url: "./audio/C.mp3", colorClass: "note-color-C" },
  { name: "D", url: "./audio/D.mp3", colorClass: "note-color-D" },
  { name: "E", url: "./audio/E.mp3", colorClass: "note-color-E" },
  { name: "F", url: "./audio/F.mp3", colorClass: "note-color-F" },
  { name: "G", url: "./audio/G.mp3", colorClass: "note-color-G" },
  { name: "A", url: "./audio/A.mp3", colorClass: "note-color-A" },
  { name: "B", url: "./audio/B.mp3", colorClass: "note-color-B" },
];

let hammer;
let currentNote;
let results = [];
let totalAnswers = 0;
let correctAnswers = 0;
let translations = {};
let correctMessage = "";
let incorrectMessage = "";
let displayedNoteIndex = 0;

function loadTranslations(lang) {
  return new Promise((resolve, reject) => {
    $.getJSON(`./translations/${lang}.json`, (data) => {
      translations[lang] = data;
      resolve();
    }).fail((error) => {
      reject(error);
    });
  });
}

Promise.all([
  loadTranslations("en"),
  loadTranslations("fr"),
  loadTranslations("es") // Add this line to load Spanish translations
]).then(() => {
  // Set the initial language
  changeLanguage("en");

  // Call playRandomNote before updateCard
  playRandomNote();
  updateCard();
});


function changeLanguage(lang) {
  const translation = translations[lang];
  if (!translation) return;

  $('html').attr('lang', lang);
  $('title').text(translation.title);
  document.querySelector('#appTitle').innerText = translation.title;
  $('.language-dropdown .dropdown-item').removeClass('active');
  $(`.language-dropdown .dropdown-item[data-lang="${lang}"]`).addClass('active');

  correctMessage = translation.correct;
  incorrectMessage = translation.incorrect;

  // Update card without changing the note
  updateCard(false);
}

function replayNote() {
  if (currentNote) {
    const audio = new Audio(currentNote.url);
    audio.play();
  }
}

function playRandomNote() {
  const randomIndex = Math.floor(Math.random() * notes.length);
  currentNote = notes[randomIndex];
  const audio = new Audio(currentNote.url);
  audio.play();
}


function updateCard(updateNote = true) {
    if (!currentNote) {
    playRandomNote();
  }

  if (updateNote) {
    playRandomNote();
  }

  displayedNoteIndex = notes.findIndex(note => note.name === currentNote.name);

  const displayedNote = notes[displayedNoteIndex];
  const lang = $('html').attr('lang');
  const translation = translations[lang];

  // Check if translation and translation.noteNames are not undefined
  if (translation && translation.noteNames) {
    const translatedNoteName = translation.noteNames[displayedNoteIndex];

    // Update the note color
    const colorClass = displayedNote.colorClass;
    $('.note-text').removeClass('note-color-C note-color-D note-color-E note-color-F note-color-G note-color-A note-color-B').addClass(colorClass);

    $('.note-text').text(translatedNoteName);
    $('.card').data('isCorrect', currentNote.name === displayedNote.name);

    // Show the question text
    $('.question-text').show();
  } else {
    console.error(`Error: noteNames not defined for language ${lang}`);
  }
}

function showMessage(messageType, animationClass, callback) {
  const messagePrefix = messageType === 'correct' ? correctMessage : incorrectMessage;
  const currentNoteName = currentNote.name;
  const currentNoteColor = currentNote.colorClass;
  const lang = $('html').attr('lang');
  const translation = translations[lang];

  // Get the translated note name and "The current note was" translation
  const translatedNoteIndex = notes.findIndex(note => note.name === currentNoteName);
  const translatedNoteName = translation.noteNames[translatedNoteIndex];
  const currentNoteTranslation = translation.currentNote;

  // Add the current note to the message
  const message = `${messagePrefix} ${currentNoteTranslation}: <span class="${currentNoteColor}">${translatedNoteName}</span>`;

  // Empty the displayed note text and hide the question text
  $('.note-text').text("");
  $('.question-text').hide();

  const messageElement = document.createElement("div");
  messageElement.id = "message";
  messageElement.innerHTML = message; // Change this line to use innerHTML
  messageElement.style.display = "block";
  messageElement.style.position = "absolute";
  messageElement.style.left = "20%";
  messageElement.style.transform = "translateX(-50%)";
  messageElement.classList.add("message-top", "animate__animated", animationClass);
  document.querySelector('.card-container').appendChild(messageElement);

  setTimeout(() => {
    messageElement.style.display = "none";
    messageElement.classList.remove("animate__animated", animationClass);
    document.querySelector('.card-container').removeChild(messageElement);
    if (callback) callback(); // Call the callback function if provided
  }, 2000);
}

function displayResults() {
  let resultIcons = '';
  results.forEach(result => {
    resultIcons += `<span style="font-size: 24px; margin-right: 4px;">${result ? '&#10004;' : '&#10008;'}</span>`;
  });
  $('#results').html(resultIcons);
}

function getResultImage(correctAnswers) {
  if (correctAnswers <= 2) {
    return './images/result_0_2.png';
  } else if (correctAnswers <= 5) {
    return './images/result_3_5.png';
  } else if (correctAnswers <= 8) {
    return './images/result_6_8.png';
  } else {
    return './images/result_9_10.png';
  }
}

function disableInteractions() {
  $('.btn').prop('disabled', true);
  hammer.get('pan').set({ enable: false });
}

function enableInteractions() {
  $('.btn').prop('disabled', false);
  hammer.get('pan').set({ enable: true });
}

function animateCard(direction) {
  const card = $('.card');
  card.css('transition', 'transform 0.5s, opacity 0.5s');
  card.css('transform', `translateX(${direction}%) rotateY(${direction * 0.8}deg)`);
  card.css('opacity', '0');
  setTimeout(() => {
    card.css('transition', 'none');
    card.css('transform', 'none');
    card.css('opacity', '1');
  }, 500);
}

function onSwipeLeft() {
  const isCorrect = $('.card').data('isCorrect');
  if (!isCorrect) {
    correctAnswers++;
    replayNote(); // Replay the current note
    showMessage('correct', "animate__tada", () => {
      updateCard();
      enableInteractions();
    });
  } else {
    replayNote(); // Replay the current note
    showMessage('incorrect', "animate__shakeX", () => {
      updateCard();
      enableInteractions();
    });
  }
  totalAnswers++;
  results.push(!isCorrect);
  displayResults();

  if (totalAnswers === 10) {
    setTimeout(displayChart, 1000);
  } else {
    disableInteractions();
    animateCard(-100);
  }
}

function onSwipeRight() {
  const isCorrect = $('.card').data('isCorrect');
  if (isCorrect) {
    correctAnswers++;
    replayNote(); // Replay the current note
    showMessage('correct', "animate__tada", () => {
      updateCard();
      enableInteractions();
    });
  } else {
    replayNote(); // Replay the current note
    showMessage('incorrect', "animate__shakeX", () => {
      updateCard();
      enableInteractions();
    });
  }
  totalAnswers++;
  results.push(isCorrect);
  displayResults();

  if (totalAnswers === 10) {
    setTimeout(displayChart, 1000);
  } else {
    disableInteractions();
    animateCard(100);
  }
}

function resetGame() {
  $('#resultImage').remove();
  $('#resultMessage').remove();
  $('.btn-try-again').remove();
  $('.card-container').show();
  results = [];
  totalAnswers = 0;
  correctAnswers = 0;
  displayResults();
  updateCard();

  // Reset the card's transform and opacity
  const card = $('.card');
  card.css('transition', 'none');
  card.css('transform', 'none');
  card.css('opacity', '1');
}

function displayChart() {
  $('.card-container').hide();
  const resultImageURL = getResultImage(correctAnswers);
  const resultImage = $('<img id="resultImage" src="" alt="Result image">');
  resultImage.attr('src', resultImageURL);
  $('.container').append(resultImage);

  // Add a personalized message with the score
  const resultMessage = $('<p id="resultMessage"></p>');
  resultMessage.text(`Your score is ${correctAnswers} out of 10`);
  $('.container').append(resultMessage);

  const retryButton = $('<button class="btn btn-try-again btn-lg mt-4">Retry</button>'); // Change "Try Again" to "Retry"
  retryButton.click(resetGame);
  $('.container').append(retryButton);
  $('#resultImage').show();
}

function onPan(event) {
  const card = $('.card');
  const deltaX = event.deltaX;
  const rotation = deltaX * 0.2;

  // Calculate the opacity based on how far the card is dragged
  const maxOpacity = 1;
  const minOpacity = 0.3;
  const maxDeltaX = Math.max(window.innerWidth / 3, 150); // At least 150px or one-third of the window width
  let opacity = maxOpacity - Math.abs(deltaX) / maxDeltaX * (maxOpacity - minOpacity);
  opacity = Math.max(minOpacity, Math.min(maxOpacity, opacity));

  card.css('transition', 'none');
  card.css('transform', `translateX(${deltaX}px) rotateY(${rotation}deg)`);
  card.css('opacity', opacity);
}

function onPanEnd(event) {
  const card = $('.card');
  const deltaX = event.deltaX;
  const isSwipeLeft = deltaX < -100;
  const isSwipeRight = deltaX > 100;

  if (isSwipeLeft) {
    onSwipeLeft();
  } else if (isSwipeRight) {
    onSwipeRight();
  } else {
    card.css('transition', 'transform 0.5s');
    card.css('transform', 'none');
  }
}

$(document).ready(() => {
  const cardElement = document.querySelector('.card');
  const hammerOptions = { recognizers: [[Hammer.Pan, { direction: Hammer.DIRECTION_HORIZONTAL }]] };
  hammer = new Hammer(cardElement, hammerOptions);

  hammer.on('pan', onPan);
  hammer.on('panend', onPanEnd);


  $('#resultsChart').hide();

// Add event listener for the language dropdown
$(".language-dropdown .dropdown-item").click(function () {
  const lang = $(this).attr("data-lang");
  changeLanguage(lang);
});

});

