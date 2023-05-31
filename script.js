
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
let translations = {};
let correctMessage = "";
let incorrectMessage = "";
let displayedNoteIndex = 0;
let displayedTranslatedNoteName = "";
let lives = 3;
let correctAnswersInARow = 0;
let totalPoints = 0;

const quotes = [
  "Keep practicing!",
  "Good job!",
  "Excellent work!",
  "You're a music master!",
];


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
  // Set the initial language based on the browser's language
  setDefaultLanguage();

  // Call playRandomNote before updateCard
  playRandomNote();

  // Update the displayedTranslatedNoteName variable with the initial translated note name
  const initialLang = $('html').attr('lang');
  const initialTranslation = translations[initialLang];
  displayedTranslatedNoteName = initialTranslation.noteNames[displayedNoteIndex];

  // Update the card, which will also play a random note
  updateCard(false, displayedTranslatedNoteName);

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
  const lang = $('html').attr('lang');
  const translation = translations[lang];

  if (updateNote) {
    playRandomNote();

    // Randomly generate the displayed note index
    const randomOffset = Math.floor(Math.random() * 3) - 1; // Generates -1, 0, or 1
    displayedNoteIndex = (notes.findIndex(note => note.name === currentNote.name) + randomOffset + notes.length) % notes.length;
  }

  if (translation && translation.noteNames) {
    const displayedNote = notes[displayedNoteIndex];
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

function showCorrectInARowAnimation() {
  const animationElement = document.createElement("div");
  animationElement.id = "correctInARow";
  animationElement.innerHTML = `X ${correctAnswersInARow}`;
  animationElement.classList.add("animate__animated", "animate__scaleIn", "animate__rotateIn");
	  animationElement.style.color = `hsl(${Math.random() * 360}, 100%, 50%)`; // Random color for the streak number
	  document.querySelector('.container').appendChild(animationElement);

	  setTimeout(() => {
	    animationElement.classList.remove("animate__animated", "animate__scaleIn", "animate__rotateIn");
	    document.querySelector('.container').removeChild(animationElement);
	  }, 2000);
	}

function getResultImage(correctAnswers) {
  let quote;
  let imagePath;
  if (correctAnswers <= 2) {
    quote = quotes[0];
    imagePath = './images/result_0_2.png';
  } else if (correctAnswers <= 5) {
    quote = quotes[1];
    imagePath = './images/result_3_5.png';
  } else if (correctAnswers <= 8) {
    quote = quotes[2];
    imagePath = './images/result_6_8.png';
  } else {
    quote = quotes[3];
    imagePath = './images/result_9_10.png';
  }
  // Display the quote
  document.getElementById('quote').innerText = quote;
  return imagePath;
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

	function getBrowserLanguage() {
	  return navigator.language || navigator.userLanguage;
	}

	function setDefaultLanguage() {
	  const browserLanguage = getBrowserLanguage().substring(0, 2);

	  if (browserLanguage === "fr" || browserLanguage === "es") {
	    // Set the site language to French or Spanish, based on the browser language
	    changeLanguage(browserLanguage);
	  } else {
	    // Set the site language to English by default
	    changeLanguage("en");
	  }
	}

	function onSwipeLeft() {
	  const isCorrect = $('.card').data('isCorrect');
	  if (isCorrect) {
	    correctAnswersInARow = 0;
	    lives--;
	    displayLives();
	    if (lives === 0) {
	      setTimeout(displayChart, 1000);
	    } else {
	      replayNote();
	      showMessage('incorrect', "animate__shakeX", () => {
		updateCard();
		enableInteractions();
	      });
	    }
	  } else {
	    correctAnswersInARow++;
            totalPoints += correctAnswersInARow;
	    if (correctAnswersInARow > 1) {
      showCorrectInARowAnimation();
    }
    replayNote();
    showMessage('correct', "animate__tada", () => {
      updateCard();
      enableInteractions();
    });
  }
  disableInteractions();
  animateCard(-100);
  displayPoints();
}

function onSwipeRight() {
  const isCorrect = $('.card').data('isCorrect');
  if (isCorrect) {
    correctAnswersInARow++;
    totalPoints += correctAnswersInARow; // Add this line to update the total points
    if (correctAnswersInARow > 2) {
      showCorrectInARowAnimation();
    }
    replayNote();
    showMessage('correct', "animate__tada", () => {
      updateCard();
      enableInteractions();
    });
  } else {
    correctAnswersInARow = 0;
    lives--;
    displayLives();
    if (lives === 0) {
      setTimeout(displayChart, 1000);
    } else {
      replayNote();
      showMessage('incorrect', "animate__shakeX", () => {
        updateCard();
        enableInteractions();
      });
    }
  }
  disableInteractions();
  animateCard(100);
  displayPoints();
}

function displayLives() {
  const livesElement = $('#lives');
  livesElement.empty(); // Clear the existing lives display

  for (let i = 0; i < lives; i++) {
    const heartIcon = $('<i class="fas fa-heart"></i>');
    heartIcon.css({ marginRight: '4px', color: 'red' }); // Add some spacing and color to the hearts
    livesElement.append(heartIcon);
  }
}

function displayPoints() {
  $('#points').html(`<i class="fa-solid fa-music"></i> ${totalPoints}`);
}

function resetGame() {
  $('#resultImage').remove();
  $('#resultMessage').remove();
  $('.btn-try-again').remove();
  $('.card-container').show();
  results = [];
  totalAnswers = 0;
  correctAnswers = 0;
  totalPoints = 0;
  displayPoints();
  lives = 3; // Reset lives here
  displayLives(); // Update the lives display
  updateCard();
  enableInteractions();

  // Reset the card's transform and opacity
  const card = $('.card');
  card.css('transition', 'none');
  card.css('transform', 'none');
  card.css('opacity', '1');
}

function displayChart() {
  $('.card-container').hide();
  const resultImageURL = getResultImage(lives);
  
  // Select the div element with id resultImage
  const resultImage = $('#resultImage');
  
  // Set the background image of the div
  resultImage.css('background-image', 'url(' + resultImageURL + ')');
  
  // Remove the personalized message with the score
  const retryButton = $('<button class="btn btn-try-again btn-lg mt-4">&#x21BA;</button>');
  retryButton.click(resetGame);
  $('.container').append(retryButton);
  
  // Show the result image
  resultImage.show();
  resultImage.css({
    width: '50%', // Adjust the percentage to resize the image
    height: 'auto',
    backgroundSize: 'cover', // Ensure the background image covers the entire div
    backgroundPosition: 'center' // Center the background image
  });
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
  const pointsElement = $('<span id="points"></span>');
  $('.container').prepend(pointsElement);
  displayPoints();

  hammer = new Hammer(cardElement, hammerOptions);

  hammer.on('pan', onPan);
  hammer.on('panend', onPanEnd);


  $('#resultsChart').hide();

  // Add the lives display
  const livesElement = $('<span id="lives"></span>');
  $('.container').prepend(livesElement);
  displayLives();

// Add event listener for the language dropdown
$(".language-dropdown .dropdown-item").click(function () {
  const lang = $(this).attr("data-lang");
  changeLanguage(lang);
});

// Call playRandomNote before updateCard
playRandomNote();

// Update the displayedTranslatedNoteName variable with the initial translated note name
const initialLang = $('html').attr('lang');
const initialTranslation = translations[initialLang];
displayedTranslatedNoteName = initialTranslation.noteNames[displayedNoteIndex];

updateCard(false, displayedTranslatedNoteName);

});

