// --- ÉTAT DU JEU ---
const initialState = {
  budget: 100000,
  inclusion: 50,
  responsabilite: 50,
  durabilite: 50,
  tour: 1,
  maxTours: 10,
  gameOver: false
};

let state = { ...initialState };
let currentEvent = null;

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
  }
];

// --- FONCTIONS ---

function resetGame() {
  state = { ...initialState };
  endScreenEl.classList.add("hidden");
  document.getElementById("event").classList.remove("hidden");
  feedbackEl.textContent = "";
  startButton.classList.remove("hidden");
  nextButton.classList.add("hidden");
  eventTitleEl.textContent = "Clique sur \"Commencer\" pour lancer la simulation";
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function pickRandomEvent() {
  const index = Math.floor(Math.random() * events.length);
  return events[index];
}

function showEvent() {
  currentEvent = pickRandomEvent();
  eventTitleEl.textContent = currentEvent.title;
  eventDescriptionEl.textContent = currentEvent.description;
  feedbackEl.textContent = "";
  choicesEl.innerHTML = "";
  nextButton.classList.add("hidden");

  currentEvent.choices.forEach((choice, i) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice.text;
    btn.addEventListener("click", () => handleChoice(choice));
    choicesEl.appendChild(btn);
  });
}

function handleChoice(choice) {
  if (state.gameOver) return;

  // désactiver les boutons après le premier clic
  const buttons = document.querySelectorAll(".choice-btn");
  buttons.forEach((b) => b.classList.add("disabled"));
  buttons.forEach((b) => (b.disabled = true));

  // appliquer les effets
  const e = choice.effects;
  state.budget += e.budget;
  state.inclusion += e.inclusion;
  state.responsabilite += e.responsabilite;
  state.durabilite += e.durabilite;

  // clamp des jauges
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
    // calcul du bilan
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

// --- LISTENERS ---

startButton.addEventListener("click", () => {
  startButton.classList.add("hidden");
  state.gameOver = false;
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

// init affichage
updateUI();
