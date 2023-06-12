// Variables globales
let triviaData;
let currentQuestion = 0;
let score = 0;

// Obtener las categorías de la API
async function getCategories() {
  try {
    const response = await fetch('https://opentdb.com/api_category.php');
    const data = await response.json();
    const categorySelect = document.getElementById('category');
    data.trivia_categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.text = category.name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error al obtener las categorías:', error);
  }
}

// Generar la trivia con los parámetros seleccionados
async function generateTrivia() {
  const difficulty = document.getElementById('difficulty').value;
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value;

  try {
    const url = `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=${type}`;
    const response = await fetch(url);
    triviaData = await response.json();
    showQuestion();
    document.getElementById('config-section').style.display = 'none';
    document.getElementById('quiz-section').style.display = 'block';
  } catch (error) {
    console.error('Error al generar la trivia:', error);
  }
}

// Mostrar la pregunta actual y sus opciones de respuesta
function showQuestion() {
  const quizContainer = document.getElementById('quiz');
  const question = triviaData.results[currentQuestion];
  const questionElement = document.createElement('div');
  questionElement.innerHTML = `
    <p><strong>Pregunta ${currentQuestion + 1}:</strong> ${question.question}</p>
    <ul>
      ${shuffle([...question.incorrect_answers, question.correct_answer]).map(answer => `
        <li>
          <input type="checkbox" class="answer-checkbox">
          <span>${answer}</span>
        </li>
      `).join('')}
    </ul>
  `;
  quizContainer.innerHTML = '';
  quizContainer.appendChild(questionElement);
}

// Calcular y mostrar el puntaje final
function showScore() {
  document.getElementById('score').textContent = `Puntaje final: ${score}`;
  document.getElementById('new-trivia-btn').style.display = 'block';
}

// Verificar las respuestas y avanzar a la siguiente pregunta
function submitAnswer() {
  const question = triviaData.results[currentQuestion];
  const checkboxes = document.querySelectorAll('.answer-checkbox');
  const selectedOptions = Array.from(checkboxes).filter(checkbox => checkbox.checked);

  let isCorrect = true;
  selectedOptions.forEach(option => {
    const answerText = option.nextElementSibling.textContent;

    if (question.correct_answer === answerText) {
      option.parentElement.style.backgroundColor = 'lightgreen';
      score += 100;
    } else {
      option.parentElement.style.backgroundColor = 'orange';
      isCorrect = false;
    }

    option.disabled = true;
  });

  if (!isCorrect && selectedOptions.length === 0) {
    checkboxes.forEach(checkbox => {
      const answerText = checkbox.nextElementSibling.textContent;

      if (question.correct_answer === answerText) {
        checkbox.parentElement.style.backgroundColor = 'lightgreen';
      }
    });
  }

  currentQuestion++;

  if (currentQuestion < 10) {
    showQuestion();
  } else {
    showScore();
  }
}

// Función para mezclar las opciones de respuesta
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Reiniciar la trivia y volver a la configuración inicial
function resetTrivia() {
  currentQuestion = 0;
  score = 0;
  document.getElementById('quiz-section').style.display = 'none';
  document.getElementById('config-section').style.display = 'block';
  document.getElementById('quiz').innerHTML = '';
  document.getElementById('score').textContent = '';
  document.getElementById('new-trivia-btn').style.display = 'none';
}

// Event listeners
document.getElementById('generate-btn').addEventListener('click', generateTrivia);
document.getElementById('submit-btn').addEventListener('click', submitAnswer);
document.getElementById('new-trivia-btn').addEventListener('click', resetTrivia);
document.addEventListener('DOMContentLoaded', getCategories);
