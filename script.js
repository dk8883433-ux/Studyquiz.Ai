// ================================
// STUDYQUIZ AI
// ================================

// ⚠️ Deploy होने के बाद यहाँ अपना Render URL डालेंगे
const API_URL = "https://YOUR-RENDER-URL.onrender.com";

let questions = [];
let currentQuestion = 0;
let score = 0;
let answered = false;


// ================================
// LOGIN / REGISTER
// ================================

function showLogin() {
  document.getElementById("loginBox").classList.remove("hidden");
  document.getElementById("registerBox").classList.add("hidden");

  document.getElementById("loginTab").classList.add("active");
  document.getElementById("registerTab").classList.remove("active");

  document.getElementById("authMessage").innerText = "";
}


function showRegister() {
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("registerBox").classList.remove("hidden");

  document.getElementById("loginTab").classList.remove("active");
  document.getElementById("registerTab").classList.add("active");

  document.getElementById("authMessage").innerText = "";
}


function register() {

  const username =
    document.getElementById("registerUsername").value.trim();

  const password =
    document.getElementById("registerPassword").value;

  const confirm =
    document.getElementById("confirmPassword").value;


  if (!username || !password) {
    showMessage("Username aur password bharo.");
    return;
  }


  if (password.length < 4) {
    showMessage("Password kam se kam 4 characters ka rakho.");
    return;
  }


  if (password !== confirm) {
    showMessage("Dono password same nahi hain.");
    return;
  }


  const users =
    JSON.parse(localStorage.getItem("studyquiz_users") || "{}");


  if (users[username]) {
    showMessage("Ye username already registered hai.");
    return;
  }


  users[username] = {
    password: password
  };


  localStorage.setItem(
    "studyquiz_users",
    JSON.stringify(users)
  );


  showMessage(
    "Account ban gaya! Ab Login karo.",
    true
  );


  setTimeout(showLogin, 700);
}


function login() {

  const username =
    document.getElementById("loginUsername").value.trim();

  const password =
    document.getElementById("loginPassword").value;


  const users =
    JSON.parse(localStorage.getItem("studyquiz_users") || "{}");


  if (
    !users[username] ||
    users[username].password !== password
  ) {
    showMessage("Username ya password galat hai.");
    return;
  }


  localStorage.setItem(
    "studyquiz_currentUser",
    username
  );


  openApp(username);
}


function showMessage(message, success = false) {

  const box =
    document.getElementById("authMessage");

  box.innerText = message;

  box.style.color =
    success ? "#18a558" : "#e5484d";
}


// ================================
// APP
// ================================

function openApp(username) {

  document.getElementById("authPage")
    .classList.add("hidden");

  document.getElementById("appPage")
    .classList.remove("hidden");

  document.getElementById("welcomeUser")
    .innerText = username;
}


function logout() {

  localStorage.removeItem(
    "studyquiz_currentUser"
  );

  location.reload();
}


window.addEventListener("load", function () {

  const username =
    localStorage.getItem(
      "studyquiz_currentUser"
    );

  if (username) {
    openApp(username);
  }

});


// ================================
// AI QUIZ
// ================================

async function generateQuiz() {

  const topic =
    document.getElementById("topic")
      .value.trim();

  const count =
    Number(
      document.getElementById("questionCount")
        .value
    );

  const difficulty =
    document.getElementById("difficulty")
      .value;

  const language =
    document.getElementById("language")
      .value;


  if (!topic) {
    alert("Pehle topic likho.");
    return;
  }


  const loading =
    document.getElementById("loading");

  loading.innerText =
    "🤖 AI questions bana raha hai...";


  try {

    const response =
      await fetch(
        API_URL + "/api/quiz",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            topic: topic,

            count: count,

            difficulty: difficulty,

            language: language

          })
        }
      );


    if (!response.ok) {
      throw new Error("Server error");
    }


    const data =
      await response.json();


    if (
      !data.questions ||
      data.questions.length === 0
    ) {
      throw new Error("Questions nahi mile");
    }


    questions =
      data.questions;

    currentQuestion = 0;
    score = 0;


    document.getElementById("homePage")
      .classList.add("hidden");

    document.getElementById("quizPage")
      .classList.remove("hidden");


    loading.innerText = "";

    showQuestion();

  }

  catch (error) {

    console.error(error);

    loading.innerText =
      "❌ AI server connect nahi hua.";

  }
}


// ================================
// SHOW QUESTION
// ================================

function showQuestion() {

  answered = false;


  const q =
    questions[currentQuestion];


  document.getElementById("questionNumber")
    .innerText =
      "Question " +
      (currentQuestion + 1) +
      " / " +
      questions.length;


  document.getElementById("scoreText")
    .innerText =
      "Score: " + score;


  document.getElementById("questionText")
    .innerText =
      q.question;


  const progress =
    ((currentQuestion + 1) /
      questions.length) * 100;


  document.getElementById("progressBar")
    .style.width =
      progress + "%";


  const options =
    document.getElementById("options");

  options.innerHTML = "";


  q.options.forEach(function(option, index) {

    const button =
      document.createElement("button");

    button.className =
      "option-btn";

    button.innerText =
      option;


    button.onclick =
      function() {
        checkAnswer(index, button);
      };


    options.appendChild(button);

  });


  document.getElementById("explanation")
    .classList.add("hidden");

  document.getElementById("nextButton")
    .classList.add("hidden");
}


// ================================
// ANSWER
// ================================

function checkAnswer(
  selected,
  selectedButton
) {

  if (answered) {
    return;
  }


  answered = true;


  const q =
    questions[currentQuestion];


  const buttons =
    document.querySelectorAll(
      ".option-btn"
    );


  buttons.forEach(function(button, index) {

    if (index === q.answer) {
      button.classList.add("correct");
    }

  });


  if (selected === q.answer) {

    score++;

    selectedButton.classList.add("correct");

  } else {

    selectedButton.classList.add("wrong");

  }


  const explanation =
    document.getElementById(
      "explanation"
    );


  explanation.innerText =
    "💡 " + q.explanation;


  explanation.classList.remove("hidden");


  document.getElementById("nextButton")
    .classList.remove("hidden");


  document.getElementById("scoreText")
    .innerText =
      "Score: " + score;
}


// ================================
// NEXT QUESTION
// ================================

function nextQuestion() {

  currentQuestion++;


  if (
    currentQuestion >=
    questions.length
  ) {

    showResult();

    return;
  }


  showQuestion();
}


// ================================
// RESULT
// ================================

function showResult() {

  document.getElementById("quizPage")
    .classList.add("hidden");

  document.getElementById("resultPage")
    .classList.remove("hidden");


  const percentage =
    Math.round(
      (score / questions.length) * 100
    );


  document.getElementById("finalScore")
    .innerText =
      score +
      " / " +
      questions.length;


  let message;


  if (percentage >= 80) {

    message =
      "🔥 Excellent! Bahut achha!";

  } else if (percentage >= 50) {

    message =
      "👍 Good! Thodi aur practice karo.";

  } else {

    message =
      "📚 Topic ko revise karke dobara quiz do.";

  }


  document.getElementById("resultMessage")
    .innerText =
      message;
}


// ================================
// NEW QUIZ
// ================================

function backHome() {

  document.getElementById("resultPage")
    .classList.add("hidden");

  document.getElementById("homePage")
    .classList.remove("hidden");

  document.getElementById("topic")
    .value = "";

}
