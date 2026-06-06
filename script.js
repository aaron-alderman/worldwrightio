(function () {
  const shell = document.querySelector(".live-world-shell");
  if (!shell) return;

  const title = document.getElementById("world-state-title");
  const copy = document.getElementById("world-state-copy");
  const trailState = document.getElementById("world-trail-state");
  const statusPanel = shell.querySelector(".world-console__status");
  const buttons = Array.from(shell.querySelectorAll("[data-action]"));
  const entries = {
    alignment: shell.querySelector('[data-entry="alignment"]'),
    error: shell.querySelector('[data-entry="error"]'),
    repair: shell.querySelector('[data-entry="repair"]'),
    decision: shell.querySelector('[data-entry="decision"]')
  };
  const chips = {
    claim: shell.querySelector('[data-chip="claim"]'),
    simulation: shell.querySelector('[data-chip="simulation"]'),
    observation: shell.querySelector('[data-chip="observation"]'),
    disagreement: shell.querySelector('[data-chip="disagreement"]'),
    repair: shell.querySelector('[data-chip="repair"]'),
    decision: shell.querySelector('[data-chip="decision"]')
  };
  const fields = {
    simulation: shell.querySelector('[data-field="simulation"]'),
    observation: shell.querySelector('[data-field="observation"]'),
    delta: shell.querySelector('[data-field="delta"]'),
    repair: shell.querySelector('[data-field="repair"]'),
    decision: shell.querySelector('[data-field="decision"]')
  };

  const states = {
    stable: {
      title: "Aligned and inspectable",
      copy:
        "The workspace begins in a calm accepted state with claim, simulation, observation, and decision linked inside one world.",
      trailState: "accepted world",
      entries: {
        alignment: "Accepted world: simulation and observation are aligned.",
        error: "No active disagreement record.",
        repair: "No repair cycle is open.",
        decision: "Decision remains promotable and trusted."
      },
      chips: {
        claim: ["stable", "stable"],
        simulation: ["witnessed", "accepted"],
        observation: ["aligned", "accepted"],
        disagreement: ["dormant", "stable"],
        repair: ["standby", "healing"],
        decision: ["trusted", "accepted"]
      },
      fields: {
        simulation: "0.79",
        observation: "0.79",
        delta: "No active gap",
        repair: "Standby",
        decision: "Trusted"
      },
      enabled: ["introduce-error", "reset", "play-sequence"]
    },
    error: {
      title: "Reality has diverged",
      copy:
        "A new observed measurement enters with provenance, but it disagrees with the simulated expectation. The world does not hide the drift.",
      trailState: "drift detected",
      entries: {
        alignment: "Observed measurement lands lower than the accepted simulation.",
        error: "A disagreement record opens when model and observation diverge.",
        repair: "Repair is still unopened while the team absorbs the error.",
        decision: "Decision moves from trusted to caution."
      },
      chips: {
        claim: ["contested", "warning"],
        simulation: ["witnessed", "accepted"],
        observation: ["drifted", "warning"],
        disagreement: ["open", "critical"],
        repair: ["awaiting", "healing"],
        decision: ["cautioned", "warning"]
      },
      fields: {
        simulation: "0.79",
        observation: "0.72",
        delta: "Gap: -0.07",
        repair: "Awaiting response",
        decision: "Cautioned"
      },
      enabled: ["inspect-witness", "reset", "play-sequence"]
    },
    witness: {
      title: "The witness trail is active",
      copy:
        "The disagreement becomes inspectable. The team can see the exact simulation, the observed value, the delta, and the context around the break.",
      trailState: "witness open",
      entries: {
        alignment: "The simulation witness and observed notebook entry are visible side by side.",
        error: "Error has become inspectable instead of personal or ambiguous.",
        repair: "Policy and authority context are now visible before intervention.",
        decision: "Decision stays paused until a repair path exists."
      },
      chips: {
        claim: ["contested", "warning"],
        simulation: ["inspected", "critical"],
        observation: ["anchored", "critical"],
        disagreement: ["visible", "critical"],
        repair: ["reviewed", "healing"],
        decision: ["held", "warning"]
      },
      fields: {
        simulation: "0.79",
        observation: "0.72",
        delta: "Witnessed delta: -0.07",
        repair: "Context visible",
        decision: "Held"
      },
      enabled: ["propose-healing", "reset", "play-sequence"]
    },
    repair: {
      title: "Healing is in progress",
      copy:
        "A repair cycle opens without erasing the disagreement. The path forward becomes part of the same governed world instead of an off-record workaround.",
      trailState: "repair active",
      entries: {
        alignment: "The failed path remains visible in the same world.",
        error: "Disagreement is linked directly to a proposed repair cycle.",
        repair: "Healing begins as an explicit governed response.",
        decision: "Decision remains held while the repair is reviewed."
      },
      chips: {
        claim: ["stabilizing", "healing"],
        simulation: ["witnessed", "accepted"],
        observation: ["anchored", "critical"],
        disagreement: ["resolving", "warning"],
        repair: ["active", "healing"],
        decision: ["held", "warning"]
      },
      fields: {
        simulation: "0.79",
        observation: "0.72",
        delta: "Gap under repair",
        repair: "Repair proposal active",
        decision: "Held for review"
      },
      enabled: ["accept-healing", "reset", "play-sequence"]
    },
    healed: {
      title: "The world heals without forgetting",
      copy:
        "Healing is accepted, the disagreement is resolved, and the final state keeps the full path: witness, error, repair, and acceptance together.",
      trailState: "healed state",
      entries: {
        alignment: "A healed state is accepted without deleting the disagreement trail.",
        error: "Witness, error, and repair now coexist in the final record.",
        repair: "The repair cycle closes as part of the accepted world.",
        decision: "The team can trust the decision because the path back is explicit."
      },
      chips: {
        claim: ["healed", "accepted"],
        simulation: ["witnessed", "accepted"],
        observation: ["resolved", "accepted"],
        disagreement: ["resolved", "accepted"],
        repair: ["accepted", "accepted"],
        decision: ["trusted", "accepted"]
      },
      fields: {
        simulation: "0.79",
        observation: "0.79 restored",
        delta: "Resolved with witness",
        repair: "Healing accepted",
        decision: "Trusted again"
      },
      enabled: ["reset", "introduce-error", "play-sequence"]
    }
  };

  const nextModeByAction = {
    "introduce-error": "error",
    "inspect-witness": "witness",
    "propose-healing": "repair",
    "accept-healing": "healed",
    reset: "stable"
  };

  let currentMode = "stable";
  let playing = false;
  let playbackTimers = [];

  function clearPlayback() {
    playbackTimers.forEach((timer) => clearTimeout(timer));
    playbackTimers = [];
    playing = false;
  }

  function retriggerUpdate(element, delay) {
    if (!element) return;
    element.classList.remove("is-updated");
    element.style.setProperty("--update-delay", `${delay}ms`);
    void element.offsetWidth;
    element.classList.add("is-updated");
  }

  function markChanges(mode) {
    const previous = states[currentMode];
    const next = states[mode];
    let delayIndex = 0;

    if (!previous || !next || mode === currentMode) return;

    const changedNodeKeys = new Set();

    Object.keys(next.chips).forEach((key) => {
      const before = previous.chips[key].join("|");
      const after = next.chips[key].join("|");
      if (before !== after) {
        changedNodeKeys.add(key);
        retriggerUpdate(chips[key], delayIndex * 140);
        delayIndex += 1;
      }
    });

    Object.keys(next.fields).forEach((key) => {
      if (previous.fields[key] !== next.fields[key]) {
        const relatedNode =
          key === "delta" ? "disagreement" :
          key === "repair" ? "repair" :
          key === "decision" ? "decision" :
          key;

        changedNodeKeys.add(relatedNode);
        retriggerUpdate(fields[key], delayIndex * 140);
        delayIndex += 1;
      }
    });

    Object.keys(next.entries).forEach((key) => {
      if (previous.entries[key] !== next.entries[key]) {
        retriggerUpdate(entries[key], delayIndex * 140);
        delayIndex += 1;
      }
    });

    changedNodeKeys.forEach((key) => {
      const node = shell.querySelector(`[data-node="${key}"]`);
      retriggerUpdate(node, delayIndex * 110);
      delayIndex += 1;
    });

    retriggerUpdate(trailState, Math.max(0, delayIndex - 1) * 110);
    retriggerUpdate(statusPanel, Math.max(0, delayIndex - 1) * 110);
  }

  function setButtonsForMode(state) {
    buttons.forEach((button) => {
      if (playing) {
        button.disabled = true;
        return;
      }

      button.disabled = !state.enabled.includes(button.dataset.action);
    });
  }

  function render(mode, animate) {
    const state = states[mode];
    if (!state) return;

    shell.dataset.worldMode = mode;
    title.textContent = state.title;
    copy.textContent = state.copy;
    trailState.textContent = state.trailState;

    Object.keys(state.entries).forEach((key) => {
      entries[key].textContent = state.entries[key];
    });

    Object.keys(state.fields).forEach((key) => {
      fields[key].textContent = state.fields[key];
    });

    Object.keys(state.chips).forEach((key) => {
      const chip = chips[key];
      const [label, tone] = state.chips[key];
      chip.textContent = label;
      chip.dataset.tone = tone;
    });

    if (animate) {
      markChanges(mode);
    }

    currentMode = mode;
    setButtonsForMode(state);
  }

  function playSequence() {
    clearPlayback();
    playing = true;
    setButtonsForMode(states[currentMode]);

    if (currentMode !== "stable") {
      render("stable", false);
    }

    const sequence = [
      { mode: "error", at: 450 },
      { mode: "witness", at: 2550 },
      { mode: "repair", at: 4800 },
      { mode: "healed", at: 7050 }
    ];

    sequence.forEach((step) => {
      playbackTimers.push(
        setTimeout(() => {
          render(step.mode, true);
        }, step.at)
      );
    });

    playbackTimers.push(
      setTimeout(() => {
        playing = false;
        setButtonsForMode(states[currentMode]);
      }, 8600)
    );
  }

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      const action = this.dataset.action;

      if (action === "play-sequence") {
        playSequence();
        return;
      }

      clearPlayback();
      render(nextModeByAction[action], true);
    });
  });

  render("stable", false);
})();
