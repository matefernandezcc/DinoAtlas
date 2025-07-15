// Variables del juego
let currentDinosaurIndex = 0;
let correctAnswers = 0;
let totalQuestions = 0;
let gameFinished = false;
let attemptsLeft = 3;
let map;

// Inicializar mapa
function initializeMap() {
  map = L.map('map', {
    center: [20, 0],
    zoom: 2,
    minZoom: 1,
    maxZoom: 6
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Manejar clic en el mapa
  map.on('click', handleMapClick);
}

// Función para mostrar el dinosaurio actual
function showCurrentDinosaur() {
  if (currentDinosaurIndex >= dinosaurs.length) {
    finishGame();
    return;
  }

  // Reset attempts for new dinosaur
  attemptsLeft = 3;
  updateAttemptsDisplay();
  
  // Hide detailed info for new dinosaur
  document.getElementById('dino-details').style.opacity = '0';

  const dino = dinosaurs[currentDinosaurIndex];
  document.getElementById('current-dino-name').textContent = dino.name;
  document.getElementById('current-dino-image').src = dino.image;
  document.getElementById('total-questions').textContent = totalQuestions;
  
  // Update dino details (initially hidden)
  document.getElementById('dino-region').querySelector('span').textContent = dino.region;
  document.getElementById('dino-info-text').textContent = dino.info;
  
  // Actualizar barra de progreso
  const progressPercent = Math.round((totalQuestions / 10) * 100);
  document.getElementById('progress-text').textContent = `${progressPercent}%`;
  document.getElementById('progress-fill').style.width = `${progressPercent}%`;
}

// Function to update attempts display
function updateAttemptsDisplay() {
  const icons = document.getElementById('attempts-icons').children;
  for (let i = 0; i < icons.length; i++) {
    if (i < attemptsLeft) {
      icons[i].classList.remove('used');
    } else {
      icons[i].classList.add('used');
    }
  }
}

// Function to reveal dinosaur details
function revealDinoDetails() {
  document.getElementById('dino-details').style.opacity = '1';
}

// Función para mostrar retroalimentación
function showFeedback(isCorrect) {
  const feedback = document.getElementById('feedback');
  feedback.textContent = isCorrect ? '¡Correcto!' : 'Intenta de nuevo';
  feedback.className = `feedback-overlay ${isCorrect ? 'correct' : 'incorrect'}`;
  feedback.style.opacity = '1';

  setTimeout(() => {
    feedback.style.opacity = '0';
  }, 1500);
}

// Función para finalizar el juego
function finishGame() {
  gameFinished = true;
  
  document.getElementById('final-correct').textContent = correctAnswers;
  const percentage = Math.round((correctAnswers / dinosaurs.length) * 100);
  document.getElementById('final-percentage').textContent = `${percentage}%`;
  
  document.getElementById('summary').style.display = 'block';
}

// Manejar clic en el mapa
function handleMapClick(e) {
  if (gameFinished) return;

  const dino = dinosaurs[currentDinosaurIndex];
  const clickedLat = e.latlng.lat;
  const clickedLng = e.latlng.lng;
  
  // Calcular distancia en grados (simplificado)
  const distance = Math.sqrt(
    Math.pow(dino.location.lat - clickedLat, 2) + 
    Math.pow(dino.location.lng - clickedLng, 2)
  );
  
  // Tolerancia para considerar la respuesta como correcta (en grados)
  const tolerance = 15;
  
  const isCorrect = distance <= tolerance;
  
  if (isCorrect) {
    correctAnswers++;
    document.getElementById('correct-score').textContent = correctAnswers;
    
    // Mostrar popup con información
    L.popup()
      .setLatLng(dino.location)
      .setContent(`
        <div class="dino-info-popup">
          <h3>${dino.name}</h3>
          <p><strong>Región:</strong> ${dino.region}</p>
          <p>${dino.info}</p>
        </div>
      `)
      .openOn(map);
      
    // Marcar la ubicación correcta
    L.marker(dino.location).addTo(map);
    
    // Reveal dinosaur details
    revealDinoDetails();
  }
  else {
    // Decrease attempts
    attemptsLeft--;
    updateAttemptsDisplay();
    
    // If no attempts left
    if (attemptsLeft <= 0) {
      // Show correct location
      L.marker(dino.location).addTo(map);
      L.popup()
        .setLatLng(dino.location)
        .setContent(`
          <div class="dino-info-popup">
            <h3>${dino.name}</h3>
            <p><strong>Región:</strong> ${dino.region}</p>
            <p>${dino.info}</p>
          </div>
        `)
        .openOn(map);
        
      // Reveal dinosaur details
      revealDinoDetails();
    }
  }
  
  showFeedback(isCorrect);
  
  // Advance to next dinosaur after a time if correct or no attempts left
  setTimeout(() => {
    if (isCorrect || attemptsLeft <= 0) {
      currentDinosaurIndex++;
      totalQuestions++;
      showCurrentDinosaur();
    }
  }, 1500);
}

// Reiniciar juego
function restartGame() {
  currentDinosaurIndex = 0;
  correctAnswers = 0;
  totalQuestions = 0;
  gameFinished = false;
  attemptsLeft = 3;
  
  // Limpiar marcadores del mapa
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.Popup) {
      map.removeLayer(layer);
    }
  });
  
  document.getElementById('summary').style.display = 'none';
  updateAttemptsDisplay();
  showCurrentDinosaur();
}

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar mapa
  initializeMap();
  
  // Configurar evento para reiniciar juego
  document.getElementById('restart-button').addEventListener('click', restartGame);
  
  // Iniciar juego
  showCurrentDinosaur();
}); 