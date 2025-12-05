// --- ÉTAT DU JEU "SimLycée" ---
const initialState = {
  budget: 100000,
  inclusion: 50,
  responsabilite: 50,
  durabilite: 50,
  tour: 1,
  maxTours: 10, // 10 tours, 10 événements différents
  gameOver: false
};

let state = { ...initialState };
let currentEvent = null;
let remainingEvents = [];

// --- DOM ---
const budgetEl = document.getElementById("budget-value");
const inclusionEl = document.getElementById("gauge-inclusion");
const responsabiliteEl = document.getElementById("gauge-responsabilite");
const durabiliteEl = document.getElementById("gauge-durabilite");
const tourEl = document.getElementById("tour-value");

const eventTitleEl = document.getElementById("event-title");
const eventDescriptionEl = document.getElementById("event-description");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");

const startButton = document.getElementById("start-button");
const nextButton = document.getElementById("next-button");

const endScreenEl = document.getElementById("end-screen");
const endTitleEl = document.getElementById("end-title");
const endSummaryEl = document.getElementById("end-summary");
const restartButton = document.getElementById("restart-button");

// --- LISTE D'ÉVÉNEMENTS ---

const events = [
  {
    id: "windows10",
    title: "Fin de support Windows 10",
    description:
      "Le parc informatique du lycée tourne encore sous Windows 10, dont le support s’arrête. Que fais-tu ?",
    choices: [
      {
        text: "Acheter 50 PC neufs sous Windows 11.",
        effects: { budget: -45000, inclusion: +5, responsabilite: -5, durabilite: -15 },
        feedback:
          "Tu rassures tout le monde à court terme, mais tu restes très dépendant d’un seul éditeur et tu jettes du matériel encore utilisable."
      },
      {
        text: "Installer une distribution GNU/Linux sur les PC existants et former les profs.",
        effects: { budget: -8000, inclusion: +10, responsabilite: +15, durabilite: +15 },
        feedback:
          "Le lycée gagne en autonomie, tu prolonges la durée de vie des machines. Il faut accompagner le changement, mais le pari est payant."
      },
      {
        text: "Ne rien faire et repousser le problème.",
        effects: { budget: 0, inclusion: -10, responsabilite: -10, durabilite: -5 },
        feedback:
          "Les machines deviennent vulnérables et certains services refusent de fonctionner. Tu reportes les coûts, mais la facture sera plus salée."
      }
    ]
  },
  {
    id: "serveur",
    title: "Panne du serveur de fichiers",
    description:
      "Le serveur qui stocke les documents pédagogiques tombe en panne en pleine période d’examens blancs.",
    choices: [
      {
        text: "Tout migrer en urgence sur un cloud privé d’une grande Big Tech.",
        effects: { budget: -12000, inclusion: +5, responsabilite: -10, durabilite: -5 },
        feedback:
          "C’est rapide et pratique, mais tu externalises fortement tes données et renforces la dépendance au cloud d’un acteur unique."
      },
      {
        text: "Mettre en place une solution libre auto-hébergée (type Nextcloud) sur un serveur mutualisé.",
        effects: { budget: -15000, inclusion: +8, responsabilite: +12, durabilite: +8 },
        feedback:
          "Tu gardes un meilleur contrôle sur les données et les usages. La mise en place prend un peu plus de temps mais le socle est plus souverain."
      }
    ]
  },
  {
    id: "accessibilite",
    title: "Accessibilité numérique",
    description:
      "Un élève en situation de handicap visuel et un autre avec des difficultés de lecture arrivent au lycée.",
    choices: [
      {
        text: "Acheter quelques logiciels propriétaires spécialisés et des postes dédiés.",
        effects: { budget: -10000, inclusion: +15, responsabilite: -2, durabilite: -3 },
        feedback:
          "Ces solutions peuvent être efficaces mais restent chères et peu généralisables au reste du parc."
      },
      {
        text: "Former les équipes aux outils libres existants (lecteurs d’écran, extensions, etc.) et adapter les pratiques.",
        effects: { budget: -4000, inclusion: +20, responsabilite: +8, durabilite: +5 },
        feedback:
          "Tu rends l’accessibilité plus diffuse et durable, en changeant les usages et pas seulement le matériel."
      }
    ]
  },
  {
    id: "remplacement_pc",
    title: "Renouvellement des PC de salle info",
    description:
      "Les PC de la salle info sont lents et les profs se plaignent. Que fais-tu ?",
    choices: [
      {
        text: "Remplacer tous les PC par des modèles neufs haut de gamme.",
        effects: { budget: -60000, inclusion: +5, responsabilite: -5, durabilite: -15 },
        feedback:
          "Les performances sont là, mais tu jettes un grand nombre de machines encore réutilisables."
      },
      {
        text: "Réemployer des PC reconditionnés et optimiser les systèmes existants.",
        effects: { budget: -20000, inclusion: +5, responsabilite: +5, durabilite: +15 },
        feedback:
          "Tu limites l’impact environnemental et tu préserves le budget, en ayant un parc correct pour les usages pédagogiques."
      }
    ]
  },
  {
    id: "formations",
    title: "Formation des équipes",
    description:
      "Tu veux faire évoluer les usages numériques du lycée vers plus de sobriété et de logiciels libres.",
    choices: [
      {
        text: "Ne pas prévoir de temps de formation, chacun se débrouillera.",
        effects: { budget: 0, inclusion: -5, responsabilite: -5, durabilite: -5 },
        feedback:
          "Sans accompagnement, les outils ne sont pas adoptés, le changement est rejeté et les tensions augmentent."
      },
      {
        text: "Organiser des ateliers entre pairs, avec temps dédié dans le service des profs.",
        effects: { budget: -5000, inclusion: +10, responsabilite: +10, durabilite: +8 },
        feedback:
          "Les pratiques évoluent progressivement et les équipes gagnent en autonomie sur leurs choix numériques."
      }
    ]
  },
  {
    id: "reseaux_sociaux",
    title: "Groupes sur les réseaux sociaux",
    description:
      "Plusieurs profs ont créé des groupes sur un grand réseau social pour communiquer avec leurs classes.",
    choices: [
      {
        text: "Laisser faire, c’est pratique et gratuit.",
        effects: { budget: 0, inclusion: +5, responsabilite: -15, durabilite: -5 },
        feedback:
          "Les élèves suivent mieux l’info, mais leurs données partent chez un acteur privé et tout le monde doit accepter des CGU peu lisibles."
      },
      {
        text: "Basculer vers l’ENT officiel en expliquant les enjeux de protection des données.",
        effects: { budget: -2000, inclusion: +8, responsabilite: +10, durabilite: +5 },
        feedback:
          "La transition demande un effort, mais tu redonnes un cadre plus protecteur et mieux maîtrisé."
      },
      {
        text: "Tester une solution libre de messagerie avec un petit groupe pilote.",
        effects: { budget: -3000, inclusion: +6, responsabilite: +12, durabilite: +8 },
        feedback:
          "Tu avances par petites étapes, tu expérimentes et tu montres qu’il existe des alternatives plus responsables."
      }
    ]
  },
  {
    id: "video_streaming",
    title: "Usage massif de la vidéo",
    description:
      "Les enseignants utilisent énormément de vidéos en streaming en classe, ce qui sature la bande passante.",
    choices: [
      {
        text: "Augmenter simplement le débit Internet du lycée.",
        effects: { budget: -8000, inclusion: +3, responsabilite: 0, durabilite: -8 },
        feedback:
          "Tout le monde est content à court terme, mais tu encourages une consommation toujours plus importante de ressources."
      },
      {
        text: "Encourager le téléchargement préalable et la mutualisation des ressources sur un serveur local.",
        effects: { budget: -4000, inclusion: +5, responsabilite: +5, durabilite: +8 },
        feedback:
          "Moins de flux en direct, plus de ressources partagées, un usage plus sobre de la connexion."
      },
      {
        text: "Limiter l’usage de la vidéo à certains cours et proposer plus d’activités hors ligne.",
        effects: { budget: 0, inclusion: +2, responsabilite: +5, durabilite: +10 },
        feedback:
          "Tu réduis l’empreinte environnementale et encourages des approches pédagogiques variées."
      }
    ]
  },
  {
    id: "impression",
    title: "Impressions et photocopies",
    description:
      "Les copieurs tournent en permanence, les coûts et l’empreinte environnementale explosent.",
    choices: [
      {
        text: "Racheter des copieurs plus rapides et plus nombreux.",
        effects: { budget: -15000, inclusion: +2, responsabilite: -3, durabilite: -10 },
        feedback:
          "Tu réponds à la demande mais tu encourages un modèle très consommateur de papier."
      },
      {
        text: "Mettre en place un quota d’impression par classe et par utilisateur.",
        effects: { budget: -2000, inclusion: -2, responsabilite: +5, durabilite: +10 },
        feedback:
          "Ça grogne un peu au début, mais les impressions inutiles diminuent fortement."
      },
      {
        text: "Encourager les supports numériques sobres (PDF légers, projection) et mutualiser les impressions essentielles.",
        effects: { budget: -3000, inclusion: +5, responsabilite: +8, durabilite: +12 },
        feedback:
          "Tu réduis la consommation de papier tout en gardant la possibilité d’imprimer quand c’est vraiment nécessaire."
      }
    ]
  },
  {
    id: "byod",
    title: "Apporter son propre appareil (BYOD)",
    description:
      "Certains élèves demandent à pouvoir utiliser leur propre ordinateur ou tablette en classe.",
    choices: [
      {
        text: "Autoriser sans cadre précis, chacun fait comme il veut.",
        effects: { budget: 0, inclusion: -5, responsabilite: -5, durabilite: -2 },
        feedback:
          "Les inégalités d’équipement explosent et la sécurité du réseau devient difficile à garantir."
      },
      {
        text: "Refuser totalement, seuls les PC du lycée sont autorisés.",
        effects: { budget: 0, inclusion: -3, responsabilite: +3, durabilite: +2 },
        feedback:
          "C’est plus simple à gérer mais tu ne profites pas des équipements déjà disponibles chez certains élèves."
      },
      {
        text: "Mettre en place un cadre BYOD avec réseau dédié et règles claires.",
        effects: { budget: -5000, inclusion: +5, responsabilite: +8, durabilite: +5 },
        feedback:
          "Tu ouvres la porte aux appareils personnels tout en gardant un environnement plus sécurisé et équitable."
      }
    ]
  },
  {
    id: "donnees_evaluations",
    title: "Outils d’évaluation en ligne",
    description:
      "Plusieurs profs veulent utiliser une plateforme américaine très connue pour les quiz et évaluations.",
    choices: [
      {
        text: "Accepter, tout le monde la connaît déjà.",
        effects: { budget: -1000, inclusion: +5, responsabilite: -12, durabilite: -3 },
        feedback:
          "C’est simple à mettre en place, mais les données pédagogiques partent à l’étranger et tu dépends d’un service tiers opaque."
      },
      {
        text: "Proposer une solution libre hébergée par le rectorat ou un partenaire public.",
        effects: { budget: -3000, inclusion: +5, responsabilite: +12, durabilite: +8 },
        feedback:
          "Tu construis une solution plus souveraine, même si la prise en main demande un petit temps d’adaptation."
      },
      {
        text: "Limiter les évaluations en ligne aux usages vraiment nécessaires.",
        effects: { budget: 0, inclusion: +2, responsabilite: +5, durabilite: +5 },
        feedback:
          "Tu gardes un équilibre entre outils numériques et évaluations plus classiques, en réduisant la dépendance aux plateformes."
      }
    ]
  }
];

// --- OUTILS GÉNÉRAUX ---

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function resetEventsPool() {
  remainingEvents = [...events];
  shuffleArray(remainingEvents);
}

// --- FONCTIONS "SimLycée" ---

function resetGame() {
  state = { ...initialState };
  state.gameOver = false;
  resetEventsPool();

  endScreenEl.classList.add("hidden");
  document.getElementById("event").classList.remove("hidden");
  feedbackEl.textContent = "";
  startButton.classList.remove("hidden");
  nextButton.classList.add("hidden");
  eventTitleEl.textContent = 'Clique sur "Commencer" pour lancer la simulation';
  eventDescriptionEl.textContent = "";
  choicesEl.innerHTML = "";
  updateUI();
}

function updateUI() {
  budgetEl.textContent = state.budget.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR"
  });
  inclusionEl.style.width = clamp(state.inclusion, 0, 100) + "%";
  responsabiliteEl.style.width = clamp(state.responsabilite, 0, 100) + "%";
  durabiliteEl.style.width = clamp(state.durabilite, 0, 100) + "%";
  tourEl.textContent = `${state.tour} / ${state.maxTours}`;
}

function pickNextEvent() {
  if (remainingEvents.length === 0) {
    console.warn("Plus d'événements disponibles.");
    return null;
  }
  return remainingEvents.shift();
}

function showEvent() {
  currentEvent = pickNextEvent();
  if (!currentEvent) return;

  eventTitleEl.textContent = currentEvent.title;
  eventDescriptionEl.textContent = currentEvent.description;
  feedbackEl.textContent = "";
  choicesEl.innerHTML = "";
  nextButton.classList.add("hidden");

  currentEvent.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice.text;
    btn.addEventListener("click", () => handleChoice(choice));
    choicesEl.appendChild(btn);
  });
}

function handleChoice(choice) {
  if (state.gameOver) return;

  const buttons = document.querySelectorAll(".choice-btn");
  buttons.forEach((b) => {
    b.classList.add("disabled");
    b.disabled = true;
  });

  const e = choice.effects;
  state.budget += e.budget;
  state.inclusion += e.inclusion;
  state.responsabilite += e.responsabilite;
  state.durabilite += e.durabilite;

  state.inclusion = clamp(state.inclusion, 0, 100);
  state.responsabilite = clamp(state.responsabilite, 0, 100);
  state.durabilite = clamp(state.durabilite, 0, 100);

  feedbackEl.textContent = choice.feedback;

  updateUI();
  checkEndConditions();

  if (!state.gameOver) {
    nextButton.classList.remove("hidden");
  }
}

function checkEndConditions() {
  if (state.budget < 0) {
    endGame(
      "Faillite du lycée",
      "Le budget est passé dans le rouge. Les projets NIRD sont suspendus et le lycée doit revoir totalement sa stratégie."
    );
    return;
  }

  if (state.inclusion <= 0 || state.responsabilite <= 0 || state.durabilite <= 0) {
    endGame(
      "Crise majeure",
      "L’une des dimensions NIRD est tombée à zéro. Les tensions deviennent trop fortes pour continuer le projet."
    );
    return;
  }

  if (state.tour > state.maxTours) {
    const moyenne =
      (state.inclusion + state.responsabilite + state.durabilite) / 3;
    let mention = "";
    if (moyenne < 40) {
      mention = "Lycée très dépendant des Big Tech.";
    } else if (moyenne < 70) {
      mention = "Lycée en transition vers un numérique plus responsable.";
    } else {
      mention = "Lycée NIRD exemplaire et résilient 🎉";
    }

    const resume = `Budget final : ${state.budget.toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR"
    })}

Inclusion : ${Math.round(state.inclusion)} / 100
Responsabilité : ${Math.round(state.responsabilite)} / 100
Durabilité : ${Math.round(state.durabilite)} / 100

${mention}`;

    endGame("Bilan de ta gestion", resume.replace(/\n/g, "<br>"));
  }
}

function endGame(title, summaryHtml) {
  state.gameOver = true;
  document.getElementById("event").classList.add("hidden");
  endScreenEl.classList.remove("hidden");
  endTitleEl.textContent = title;
  endSummaryEl.innerHTML = summaryHtml;
}

function nextTurn() {
  state.tour += 1;
  if (state.tour > state.maxTours) {
    checkEndConditions();
    return;
  }
  showEvent();
  updateUI();
}

// --- LISTENERS SimLycée ---

startButton.addEventListener("click", () => {
  startButton.classList.add("hidden");
  state.gameOver = false;
  if (remainingEvents.length === 0) {
    resetEventsPool();
  }
  showEvent();
  updateUI();
});

nextButton.addEventListener("click", () => {
  nextButton.classList.add("hidden");
  nextTurn();
});

restartButton.addEventListener("click", () => {
  resetGame();
});

// init
resetEventsPool();
updateUI();

/* ------------------------------------------------------------------
   🐍 SNAKE CACHÉ - Code secret "NIRD"
------------------------------------------------------------------ */

const snakeOverlay = document.getElementById("snake-overlay");
const snakeCanvas = document.getElementById("snake-canvas");
const snakeCtx = snakeCanvas.getContext("2d");
const snakeCloseBtn = document.getElementById("snake-close");
const snakeScoreEl = document.getElementById("snake-score");

let snakeActive = false;
let snakeInterval = null;

const gridSize = 20; // 20x20 cases
const tileSize = snakeCanvas.width / gridSize;

let snake = [];
let snakeDir = { x: 1, y: 0 };
let food = null;
let snakeScore = 0;
let pendingDir = null;

// buffer pour le code secret "nird"
let secretBuffer = "";
const secretCode = "nird";

function startSnakeGame() {
  snakeActive = true;
  snakeOverlay.classList.remove("hidden");
  initSnake();
}

function stopSnakeGame() {
  snakeActive = false;
  snakeOverlay.classList.add("hidden");
  if (snakeInterval) {
    clearInterval(snakeInterval);
    snakeInterval = null;
  }
}

function initSnake() {
  snake = [
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 }
  ];
  snakeDir = { x: 1, y: 0 };
  pendingDir = null;
  snakeScore = 0;
  snakeScoreEl.textContent = "Score : 0";
  placeFood();

  if (snakeInterval) clearInterval(snakeInterval);
  snakeInterval = setInterval(updateSnake, 120);
  drawSnake();
}

function placeFood() {
  let valid = false;
  while (!valid) {
    const fx = Math.floor(Math.random() * gridSize);
    const fy = Math.floor(Math.random() * gridSize);
    if (!snake.some((seg) => seg.x === fx && seg.y === fy)) {
      food = { x: fx, y: fy };
      valid = true;
    }
  }
}

function updateSnake() {
  if (!snakeActive) return;

  if (pendingDir) {
    snakeDir = pendingDir;
    pendingDir = null;
  }

  const head = snake[0];
  const newHead = { x: head.x + snakeDir.x, y: head.y + snakeDir.y };

  // collisions bord
  if (
    newHead.x < 0 ||
    newHead.x >= gridSize ||
    newHead.y < 0 ||
    newHead.y >= gridSize
  ) {
    gameOverSnake();
    return;
  }

  // collisions corps
  if (snake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
    gameOverSnake();
    return;
  }

  snake.unshift(newHead);

  // manger la nourriture
  if (food && newHead.x === food.x && newHead.y === food.y) {
    snakeScore += 1;
    snakeScoreEl.textContent = "Score : " + snakeScore;
    placeFood();
  } else {
    snake.pop();
  }

  drawSnake();
}

function drawSnake() {
  snakeCtx.fillStyle = "#020617";
  snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

  if (food) {
    snakeCtx.fillStyle = "#22c55e";
    snakeCtx.fillRect(
      food.x * tileSize,
      food.y * tileSize,
      tileSize,
      tileSize
    );
  }

  snakeCtx.fillStyle = "#3b82f6";
  snake.forEach((seg, index) => {
    snakeCtx.fillRect(
      seg.x * tileSize,
      seg.y * tileSize,
      tileSize - 1,
      tileSize - 1
    );
  });
}

function gameOverSnake() {
  if (snakeInterval) {
    clearInterval(snakeInterval);
    snakeInterval = null;
  }
  snakeCtx.fillStyle = "rgba(15,23,42,0.7)";
  snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
  snakeCtx.fillStyle = "#e5e7eb";
  snakeCtx.font = "20px system-ui";
  snakeCtx.textAlign = "center";
  snakeCtx.fillText("Game Over", snakeCanvas.width / 2, snakeCanvas.height / 2 - 10);
  snakeCtx.font = "14px system-ui";
  snakeCtx.fillText(
    `Score : ${snakeScore} — appuie sur Échap pour fermer`,
    snakeCanvas.width / 2,
    snakeCanvas.height / 2 + 14
  );
}

// gestion des touches pour Snake + code secret
window.addEventListener("keydown", (e) => {
  // priorité au Snake si actif
  if (snakeActive) {
    handleSnakeKey(e);
    return;
  }

  // sinon, on écoute la séquence secrète "nird"
  if (e.key.length === 1) {
    secretBuffer += e.key.toLowerCase();
    if (secretBuffer.length > secretCode.length) {
      secretBuffer = secretBuffer.slice(-secretCode.length);
    }
    if (secretBuffer === secretCode) {
      startSnakeGame();
    }
  }
});

function handleSnakeKey(e) {
  if (!snakeActive) return;

  if (e.key === "Escape") {
    stopSnakeGame();
    return;
  }

  const key = e.key;

  if (key === "ArrowUp" && snakeDir.y !== 1) {
    pendingDir = { x: 0, y: -1 };
  } else if (key === "ArrowDown" && snakeDir.y !== -1) {
    pendingDir = { x: 0, y: 1 };
  } else if (key === "ArrowLeft" && snakeDir.x !== 1) {
    pendingDir = { x: -1, y: 0 };
  } else if (key === "ArrowRight" && snakeDir.x !== -1) {
    pendingDir = { x: 1, y: 0 };
  }
}

// bouton pour fermer l’overlay
snakeCloseBtn.addEventListener("click", () => {
  stopSnakeGame();
});
