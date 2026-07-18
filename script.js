(() => {
  "use strict";

  const BLOOM_THRESHOLD = 6;
  const POUR_ANGLE = 25;
  const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const REACTION_CLASSES = [
    "reaction-umbrella",
    "reaction-move",
    "reaction-down",
    "reaction-giant",
    "reaction-drink",
    "reaction-too-much",
    "reaction-shake",
    "reaction-escape",
    "reaction-flower",
    "reaction-give-back",
  ];

  const reactions = [
    {
      id: "umbrella",
      log: "Opened an emergency umbrella",
      status: "Umbrella deployed. Apparently rain is unacceptable.",
      mood: "Weather prepared",
      note: "It has been expecting this betrayal.",
      face: "ಠ_ಠ",
      drama: "Defensive",
      duration: 2400,
    },
    {
      id: "move",
      log: "Moved away from the water",
      status: "The plant scooted away without breaking eye contact.",
      mood: "Avoidant",
      note: "It would like you to respect the new seating plan.",
      face: "¬_¬",
      drama: "Elusive",
      duration: 2300,
    },
    {
      id: "down",
      log: "Grew downward on principle",
      status: "New growth direction: anywhere but toward you.",
      mood: "Contrarian",
      note: "Botany has become more of a suggestion.",
      face: "ↆ_ↆ",
      drama: "Defiant",
      duration: 2350,
    },
    {
      id: "giant",
      log: "Became a giant tree briefly",
      status: "A majestic tree! No, wait. It changed its mind.",
      mood: "Powerful",
      note: "For one glorious moment, it owned the lease.",
      face: "ᕦ•ᴗ•ᕤ",
      drama: "Colossal",
      duration: 2750,
    },
    {
      id: "drink",
      log: "Drank every last drop",
      status: "Glug, glug, glug. Not a drop left for anyone else.",
      mood: "Parched, somehow",
      note: "The straw feels unnecessarily theatrical.",
      face: "◉ᴗ◉",
      drama: "Thirsty",
      duration: 2350,
    },
    {
      id: "too-much",
      log: "Filed a ‘Too much water’ complaint",
      status: "Too much water! The official complaint is now on record.",
      mood: "Overwhelmed",
      note: "That was exactly three droplets over the limit.",
      face: ">﹏<",
      drama: "Saturated",
      duration: 2500,
    },
    {
      id: "shake",
      log: "Shook water from every leaf",
      status: "Shake, shake, shake. Now the room is watered too.",
      mood: "Soggy",
      note: "Personal space has been restored at high speed.",
      face: "≋_≋",
      drama: "Splashy",
      duration: 2200,
    },
    {
      id: "escape",
      log: "Grew legs and attempted escape",
      status: "It grew legs. This was not covered in the care guide.",
      mood: "Out of office",
      note: "Its forwarding address is confidential.",
      face: "ᕕ•ᴗ•ᕗ",
      drama: "Fugitive",
      duration: 2700,
    },
    {
      id: "flower",
      log: "Showed a flower, then hid it",
      status: "A flower appeared! You blinked, so it is gone now.",
      mood: "Secretly pleased",
      note: "Compliments may cause another sighting.",
      face: "•ᴗ•",
      drama: "Coy",
      duration: 2450,
    },
    {
      id: "give-back",
      log: "Gave the water straight back",
      status: "Return to sender. The plant kept the receipt.",
      mood: "Generous-ish",
      note: "It insists the water was the wrong size.",
      face: "•̀ᴗ•́",
      drama: "Reversible",
      duration: 2350,
    },
  ];

  const elements = {
    stage: document.querySelector("#game-stage"),
    can: document.querySelector("#watering-can"),
    target: document.querySelector("#watering-target"),
    tilt: document.querySelector("#tilt-control"),
    tiltOutput: document.querySelector("#tilt-output"),
    soundToggle: document.querySelector("#sound-toggle"),
    soundLabel: document.querySelector("#sound-label"),
    resetButton: document.querySelector("#reset-button"),
    bloomButton: document.querySelector("#bloom-button"),
    reactionBubble: document.querySelector("#reaction-bubble"),
    dropletLayer: document.querySelector("#droplet-layer"),
    stageStatus: document.querySelector("#stage-status"),
    liveStatus: document.querySelector("#live-status"),
    moodFace: document.querySelector("#mood-face"),
    moodChipText: document.querySelector("#mood-chip-text"),
    moodText: document.querySelector("#mood-text"),
    moodNote: document.querySelector("#mood-note"),
    attemptCount: document.querySelector("#attempt-count"),
    dramaLabel: document.querySelector("#drama-label"),
    growthText: document.querySelector("#growth-text"),
    growthTrack: document.querySelector("#growth-track"),
    growthFill: document.querySelector("#growth-fill"),
    reactionList: document.querySelector("#reaction-list"),
  };

  const state = {
    attempts: 0,
    healthy: false,
    soundOn: readSoundPreference(),
    tilt: 0,
    canX: 0,
    canY: 0,
    isDragging: false,
    pointerId: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
    pourLatched: false,
    reactionDeck: [],
    history: [],
    reactionTimer: 0,
    pourTimer: 0,
    dropInterval: 0,
    keyboardPourTimer: 0,
    audioContext: null,
  };

  function readSoundPreference() {
    try {
      return localStorage.getItem("dramaplant-sound") !== "off";
    } catch {
      return true;
    }
  }

  function saveSoundPreference() {
    try {
      localStorage.setItem("dramaplant-sound", state.soundOn ? "on" : "off");
    } catch {
      // The sound toggle still works when storage is blocked.
    }
  }

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function nextReaction() {
    if (state.reactionDeck.length === 0) {
      state.reactionDeck = shuffle(reactions);
    }
    return state.reactionDeck.pop();
  }

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function setInitialCanPosition() {
    const stageRect = elements.stage.getBoundingClientRect();
    const canWidth = elements.can.offsetWidth;
    state.canX = Math.max(12, stageRect.width - canWidth - Math.max(15, stageRect.width * 0.05));
    state.canY = Math.max(80, stageRect.height * 0.16);
    applyCanPosition();
  }

  function constrainCanPosition() {
    const stageRect = elements.stage.getBoundingClientRect();
    const canWidth = elements.can.offsetWidth;
    const canHeight = elements.can.offsetHeight;
    state.canX = clamp(state.canX, -canWidth * 0.08, stageRect.width - canWidth * 0.7);
    state.canY = clamp(state.canY, 48, stageRect.height - canHeight * 0.8);
  }

  function applyCanPosition() {
    constrainCanPosition();
    elements.can.style.left = `${state.canX}px`;
    elements.can.style.top = `${state.canY}px`;
    elements.can.style.setProperty("--tilt", state.tilt.toString());
  }

  function setTilt(nextTilt, evaluate = true) {
    state.tilt = clamp(Number(nextTilt), 0, 55);
    elements.tilt.value = state.tilt.toString();
    elements.tiltOutput.value = `${Math.round(state.tilt)}°`;
    elements.tilt.style.setProperty("--range-fill", `${(state.tilt / 55) * 100}%`);
    elements.can.style.setProperty("--tilt", state.tilt.toString());

    if (state.tilt < 18) {
      state.pourLatched = false;
    }

    if (evaluate) {
      evaluatePour();
    }
  }

  function getNozzlePoint() {
    const canWidth = elements.can.offsetWidth;
    const canHeight = elements.can.offsetHeight;
    const localX = (10 / 220) * canWidth;
    const localY = (95 / 145) * canHeight;
    const centerX = canWidth / 2;
    const centerY = canHeight / 2;
    const angle = (-state.tilt * Math.PI) / 180;
    const offsetX = localX - centerX;
    const offsetY = localY - centerY;
    const rotatedX = offsetX * Math.cos(angle) - offsetY * Math.sin(angle);
    const rotatedY = offsetX * Math.sin(angle) + offsetY * Math.cos(angle);

    return {
      x: state.canX + centerX + rotatedX,
      y: state.canY + centerY + rotatedY,
    };
  }

  function nozzleIsOverPlant(point) {
    const stageRect = elements.stage.getBoundingClientRect();
    const targetRect = elements.target.getBoundingClientRect();
    const target = {
      left: targetRect.left - stageRect.left,
      right: targetRect.right - stageRect.left,
      top: targetRect.top - stageRect.top,
      bottom: targetRect.bottom - stageRect.top,
    };

    return (
      point.x >= target.left - 18 &&
      point.x <= target.right + 18 &&
      point.y >= target.top - 65 &&
      point.y <= target.bottom - 10
    );
  }

  function evaluatePour() {
    const nozzle = getNozzlePoint();
    const canPour = state.tilt >= POUR_ANGLE && nozzleIsOverPlant(nozzle);

    if (canPour && !state.pourLatched) {
      startPour(nozzle);
    } else if (state.tilt >= POUR_ANGLE && !canPour && !state.pourLatched) {
      elements.stageStatus.textContent = "Good tilt. Move the spout over the plant.";
    }
  }

  function startPour(nozzle) {
    state.pourLatched = true;
    elements.can.classList.add("is-pouring");
    clearInterval(state.dropInterval);
    clearTimeout(state.pourTimer);

    const dropCount = REDUCED_MOTION ? 2 : 11;
    let dropsCreated = 0;
    createFallingDrop(nozzle);
    dropsCreated += 1;

    state.dropInterval = window.setInterval(() => {
      createFallingDrop(getNozzlePoint());
      dropsCreated += 1;
      if (dropsCreated >= dropCount) {
        clearInterval(state.dropInterval);
      }
    }, REDUCED_MOTION ? 80 : 105);

    playWaterSound();
    window.setTimeout(waterPlant, REDUCED_MOTION ? 40 : 260);

    state.pourTimer = window.setTimeout(() => {
      clearInterval(state.dropInterval);
      elements.can.classList.remove("is-pouring");
      setTilt(0, false);
      state.pourLatched = false;
    }, REDUCED_MOTION ? 480 : 1450);
  }

  function createFallingDrop(point, options = {}) {
    const drop = document.createElement("span");
    const targetRect = elements.target.getBoundingClientRect();
    const stageRect = elements.stage.getBoundingClientRect();
    const soilY = targetRect.bottom - stageRect.top;
    const fallDistance = clamp(soilY - point.y, 70, 245);
    const size = options.size ?? 7 + Math.random() * 7;

    drop.className = "water-drop";
    drop.style.left = `${point.x + (Math.random() - 0.5) * 10}px`;
    drop.style.top = `${point.y + (Math.random() - 0.5) * 5}px`;
    drop.style.setProperty("--drop-size", `${size}px`);
    drop.style.setProperty("--fall", `${fallDistance}px`);
    drop.style.setProperty("--drift", `${-8 + (Math.random() - 0.5) * 18}px`);
    drop.style.setProperty("--drop-speed", `${600 + Math.random() * 260}ms`);
    elements.dropletLayer.append(drop);
    window.setTimeout(() => drop.remove(), REDUCED_MOTION ? 80 : 950);
  }

  function createShakeDrops() {
    const stageRect = elements.stage.getBoundingClientRect();
    const targetRect = elements.target.getBoundingClientRect();
    const amount = REDUCED_MOTION ? 3 : 18;

    for (let index = 0; index < amount; index += 1) {
      window.setTimeout(() => {
        const point = {
          x: targetRect.left - stageRect.left + targetRect.width * (0.25 + Math.random() * 0.5),
          y: targetRect.top - stageRect.top + targetRect.height * (0.15 + Math.random() * 0.45),
        };
        createFallingDrop(point, { size: 5 + Math.random() * 5 });
      }, REDUCED_MOTION ? 0 : index * 45);
    }
  }

  function createReturnDrops() {
    const stageRect = elements.stage.getBoundingClientRect();
    const targetRect = elements.target.getBoundingClientRect();
    const nozzle = getNozzlePoint();
    const start = {
      x: targetRect.left - stageRect.left + targetRect.width * 0.52,
      y: targetRect.top - stageRect.top + targetRect.height * 0.48,
    };
    const amount = REDUCED_MOTION ? 3 : 12;

    for (let index = 0; index < amount; index += 1) {
      window.setTimeout(() => {
        const drop = document.createElement("span");
        drop.className = "water-drop reverse";
        drop.style.left = `${start.x + (Math.random() - 0.5) * 34}px`;
        drop.style.top = `${start.y + (Math.random() - 0.5) * 20}px`;
        drop.style.setProperty("--drop-size", `${6 + Math.random() * 6}px`);
        drop.style.setProperty("--return-x", `${nozzle.x - start.x}px`);
        drop.style.setProperty("--return-y", `${nozzle.y - start.y}px`);
        drop.style.setProperty("--drop-speed", `${720 + Math.random() * 260}ms`);
        elements.dropletLayer.append(drop);
        window.setTimeout(() => drop.remove(), REDUCED_MOTION ? 80 : 1100);
      }, REDUCED_MOTION ? 0 : index * 65);
    }
  }

  function waterPlant() {
    state.attempts += 1;
    if (state.healthy) {
      handleHealthyWatering();
      return;
    }

    const reaction = nextReaction();
    performReaction(reaction);
    updateProgress();
  }

  function clearReaction() {
    window.clearTimeout(state.reactionTimer);
    elements.stage.classList.remove(...REACTION_CLASSES);
    elements.reactionBubble.hidden = true;
  }

  function performReaction(reaction) {
    clearReaction();
    elements.stage.classList.add(`reaction-${reaction.id}`);
    elements.reactionBubble.hidden = reaction.id !== "too-much";

    if (reaction.id === "shake") {
      window.setTimeout(createShakeDrops, REDUCED_MOTION ? 0 : 220);
    }
    if (reaction.id === "give-back") {
      window.setTimeout(createReturnDrops, REDUCED_MOTION ? 0 : 330);
    }

    setMood(reaction.mood, reaction.note, reaction.face, reaction.drama);
    addHistory(reaction.log);
    announce(reaction.status);
    playReactionSound(reaction.id);

    state.reactionTimer = window.setTimeout(() => {
      clearReaction();
      elements.stageStatus.textContent = "The plant is pretending that never happened.";
    }, REDUCED_MOTION ? 1550 : reaction.duration);
  }

  function handleHealthyWatering() {
    clearReaction();
    setMood("Thriving", "It finally trusts your watering technique.", "•‿•", "Joyful");
    addHistory("Accepted the water without a scene");
    announce("The flowering plant drinks happily. Character development!");
    playHealthySound();
    updateProgress();
  }

  function setMood(mood, note, face, drama) {
    elements.moodChipText.textContent = mood;
    elements.moodText.textContent = mood;
    elements.moodNote.textContent = note;
    elements.moodFace.textContent = face;
    elements.dramaLabel.textContent = drama;
  }

  function addHistory(entry) {
    state.history.unshift(entry);
    state.history = state.history.slice(0, 4);
    elements.reactionList.replaceChildren(
      ...state.history.map((item) => {
        const listItem = document.createElement("li");
        listItem.textContent = item;
        return listItem;
      }),
    );
  }

  function updateProgress() {
    const trust = Math.min(state.attempts, BLOOM_THRESHOLD);
    const progress = (trust / BLOOM_THRESHOLD) * 100;
    elements.attemptCount.textContent = state.attempts.toString();
    elements.growthText.textContent = state.healthy ? "Bloomed!" : `${trust} / ${BLOOM_THRESHOLD}`;
    elements.growthFill.style.width = `${progress}%`;
    elements.growthTrack.setAttribute("aria-valuenow", trust.toString());
    elements.growthTrack.setAttribute(
      "aria-valuetext",
      state.healthy ? "The plant has bloomed" : `${trust} of ${BLOOM_THRESHOLD} trust earned`,
    );
    elements.bloomButton.hidden = state.healthy || state.attempts < BLOOM_THRESHOLD;
  }

  function announce(message) {
    elements.stageStatus.textContent = message;
    elements.liveStatus.textContent = message;
  }

  function bloomPlant() {
    if (state.healthy || state.attempts < BLOOM_THRESHOLD) {
      return;
    }

    clearReaction();
    state.healthy = true;
    elements.stage.classList.add("is-healthy");
    setMood("Thriving", "Drama and hydration have reached a healthy balance.", "•‿•", "Flourishing");
    addHistory("Finally agreed to become a flowering plant");
    updateProgress();
    announce("The plant takes a deep breath and blooms into a healthy flowering plant!");
    playHealthySound();
  }

  function resetGame() {
    clearInterval(state.dropInterval);
    clearTimeout(state.pourTimer);
    clearTimeout(state.keyboardPourTimer);
    clearReaction();
    state.attempts = 0;
    state.healthy = false;
    state.history = [];
    state.reactionDeck = [];
    state.pourLatched = false;
    elements.stage.classList.remove("is-healthy");
    elements.can.classList.remove("is-pouring", "is-dragging");
    elements.dropletLayer.replaceChildren();
    const emptyLog = document.createElement("li");
    emptyLog.className = "empty-log";
    emptyLog.textContent = "No incidents. Yet.";
    elements.reactionList.replaceChildren(emptyLog);
    setTilt(0, false);
    setInitialCanPosition();
    setMood("Suspicious but hydrated", "It saw you pick up the can.", "•ᴗ•", "Calm-ish");
    updateProgress();
    announce("Fresh start. The plant is watching the watering can.");
    playTone(330, 0.08, 0, "triangle", 0.025);
  }

  function moveCanFromPointer(event) {
    const stageRect = elements.stage.getBoundingClientRect();
    state.canX = event.clientX - stageRect.left - state.dragOffsetX;
    state.canY = event.clientY - stageRect.top - state.dragOffsetY;
    applyCanPosition();
    evaluatePour();
  }

  function handlePointerDown(event) {
    if (event.button !== 0 || state.pointerId !== null) {
      return;
    }
    const stageRect = elements.stage.getBoundingClientRect();
    state.pointerId = event.pointerId;
    state.isDragging = true;
    state.dragOffsetX = event.clientX - stageRect.left - state.canX;
    state.dragOffsetY = event.clientY - stageRect.top - state.canY;
    elements.can.classList.add("is-dragging");
    elements.can.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function handlePointerMove(event) {
    if (!state.isDragging || event.pointerId !== state.pointerId) {
      return;
    }
    moveCanFromPointer(event);
  }

  function finishPointerInteraction(event) {
    if (event.pointerId !== state.pointerId) {
      return;
    }
    state.isDragging = false;
    state.pointerId = null;
    elements.can.classList.remove("is-dragging");
    if (elements.can.hasPointerCapture(event.pointerId)) {
      elements.can.releasePointerCapture(event.pointerId);
    }
  }

  function moveCanWithKeyboard(deltaX, deltaY) {
    state.canX += deltaX;
    state.canY += deltaY;
    applyCanPosition();
    evaluatePour();
  }

  function handleCanKeydown(event) {
    const distance = event.shiftKey ? 30 : 12;
    const movement = {
      ArrowLeft: [-distance, 0],
      ArrowRight: [distance, 0],
      ArrowUp: [0, -distance],
      ArrowDown: [0, distance],
    }[event.key];

    if (movement) {
      event.preventDefault();
      moveCanWithKeyboard(...movement);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setTilt(0, false);
      setInitialCanPosition();
      announce("The watering can returned to its starting place.");
      return;
    }

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      clearTimeout(state.keyboardPourTimer);
      setTilt(43);
      if (!state.pourLatched) {
        announce("Move the spout over the plant before pouring.");
      }
      state.keyboardPourTimer = window.setTimeout(() => {
        if (!elements.can.classList.contains("is-pouring")) {
          setTilt(0, false);
        }
      }, 800);
    }
  }

  function updateSoundButton() {
    elements.soundToggle.setAttribute("aria-pressed", state.soundOn.toString());
    elements.soundLabel.textContent = state.soundOn ? "Sound on" : "Sound off";
    elements.soundToggle.querySelector(".button-icon").textContent = state.soundOn ? "♪" : "×";
  }

  function toggleSound() {
    state.soundOn = !state.soundOn;
    saveSoundPreference();
    updateSoundButton();
    if (state.soundOn) {
      playTone(540, 0.09, 0, "sine", 0.035);
    }
    announce(state.soundOn ? "Generated sounds are on." : "Sounds are off.");
  }

  function getAudioContext() {
    if (!state.soundOn) {
      return null;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      return null;
    }
    if (!state.audioContext) {
      state.audioContext = new AudioContext();
    }
    if (state.audioContext.state === "suspended") {
      state.audioContext.resume().catch(() => {});
    }
    return state.audioContext;
  }

  function playTone(frequency, duration, delay = 0, wave = "sine", volume = 0.04) {
    const context = getAudioContext();
    if (!context) {
      return;
    }
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function playWaterSound() {
    const context = getAudioContext();
    if (!context) {
      return;
    }

    const duration = 0.42;
    const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      const fade = 1 - index / data.length;
      data[index] = (Math.random() * 2 - 1) * fade;
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    filter.type = "bandpass";
    filter.frequency.value = 1450;
    filter.Q.value = 0.8;
    gain.gain.value = 0.035;
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(context.destination);
    source.start();
    playTone(260, 0.12, 0, "sine", 0.025);
    playTone(210, 0.16, 0.14, "sine", 0.022);
  }

  function playReactionSound(id) {
    const soundPatterns = {
      umbrella: [[520, 0.09, 0], [690, 0.12, 0.08]],
      move: [[440, 0.07, 0], [350, 0.07, 0.08], [280, 0.09, 0.16]],
      down: [[430, 0.1, 0], [330, 0.1, 0.11], [230, 0.15, 0.22]],
      giant: [[170, 0.22, 0], [220, 0.22, 0.13], [290, 0.3, 0.27]],
      drink: [[330, 0.08, 0], [295, 0.08, 0.1], [260, 0.08, 0.2]],
      "too-much": [[720, 0.08, 0], [620, 0.08, 0.09], [720, 0.13, 0.18]],
      shake: [[760, 0.05, 0], [520, 0.05, 0.07], [760, 0.05, 0.14]],
      escape: [[300, 0.07, 0], [380, 0.07, 0.09], [470, 0.07, 0.18], [590, 0.1, 0.27]],
      flower: [[523, 0.14, 0], [659, 0.14, 0.12], [784, 0.2, 0.24]],
      "give-back": [[620, 0.09, 0], [480, 0.09, 0.1], [340, 0.13, 0.2]],
    };
    for (const [frequency, duration, delay] of soundPatterns[id] ?? []) {
      playTone(frequency, duration, delay, id === "giant" ? "sawtooth" : "triangle", 0.028);
    }
  }

  function playHealthySound() {
    playTone(392, 0.25, 0, "sine", 0.03);
    playTone(494, 0.25, 0.05, "sine", 0.025);
    playTone(587, 0.32, 0.1, "sine", 0.025);
  }

  elements.can.addEventListener("pointerdown", handlePointerDown);
  elements.can.addEventListener("pointermove", handlePointerMove);
  elements.can.addEventListener("pointerup", finishPointerInteraction);
  elements.can.addEventListener("pointercancel", finishPointerInteraction);
  elements.can.addEventListener("keydown", handleCanKeydown);
  elements.tilt.addEventListener("input", (event) => setTilt(event.currentTarget.value));
  elements.soundToggle.addEventListener("click", toggleSound);
  elements.resetButton.addEventListener("click", resetGame);
  elements.bloomButton.addEventListener("click", bloomPlant);
  window.addEventListener("resize", () => {
    constrainCanPosition();
    applyCanPosition();
  });

  updateSoundButton();
  setTilt(0, false);
  window.requestAnimationFrame(() => {
    setInitialCanPosition();
    updateProgress();
  });
})();
