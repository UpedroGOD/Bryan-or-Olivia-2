const eventDate = new Date("2026-05-24T13:00:00-03:00");
const countdownElement = document.querySelector(".countdown");
const whatsappLinks = document.querySelectorAll(".message-link");
const presenceForm = document.querySelector("#presence-form");
const guestNameInput = document.querySelector("#guest-name");
const presenceFeedback = document.querySelector("#presence-feedback");
const whatsappConfirmLink = document.querySelector("#whatsapp-confirm-link");
const animatedNames = document.querySelectorAll(".name-boy, .name-girl");
const addressCopyFields = document.querySelectorAll(".address-copy-field");
const copyToast = document.querySelector("#copy-toast");
const inviteConfig = window.INVITE_CONFIG || {};
const whatsappNumber = "5531993586484";
const whatsappMessage =
  "Oi! Confirmando minha presenca no cha revelacao do dia 24 de maio. Vou estar com voces nesse momento especial e levar as fraldas com carinho.";
const initialGirlAnimationDelay = 2500;
const initialBoyAnimationDelay = 3000;
const nameAnimationDuration = 4000;
const nameReturnDuration = 900;
const copyToastDuration = 2200;
const presenceFeedbackDuration = 3200;

updateCountdown();
markExternalLinks();
enhanceWhatsAppLinks();
setupPresenceForm();
setupWhatsAppLink();
prepareAnimatedNameLetters();
setupNameAnimations();
setupAddressCopyFields();
scheduleInitialNameAnimations();

function updateCountdown() {
  if (!countdownElement) {
    return;
  }

  const now = new Date();
  const diffInMs = eventDate - now;
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  const baseMessage = countdownElement.dataset.baseText || countdownElement.textContent.trim();

  if (diffInDays > 1) {
    countdownElement.textContent = `${baseMessage} Faltam ${diffInDays} dias.`;
    return;
  }

  if (diffInDays === 1) {
    countdownElement.textContent = `${baseMessage} Falta 1 dia.`;
    return;
  }

  if (diffInMs > 0) {
    countdownElement.textContent = `${baseMessage} E hoje!`;
    return;
  }

  countdownElement.textContent = "Esse momento ja aconteceu, mas continua guardado com carinho.";
}

function markExternalLinks() {
  const externalLinks = document.querySelectorAll('a[href^="http"]');

  externalLinks.forEach((link) => {
    link.setAttribute("rel", "noreferrer noopener");
  });
}

function enhanceWhatsAppLinks() {
  whatsappLinks.forEach((link) => {
    link.addEventListener("click", () => {
      link.dataset.clicked = "true";
    });
  });
}

function setupPresenceForm() {
  if (!presenceForm || !guestNameInput || !presenceFeedback) {
    return;
  }

  guestNameInput.addEventListener("input", () => {
    clearPresenceFeedback();
  });

  presenceForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const guestName = guestNameInput.value.trim();

    if (!guestName) {
      setPresenceFeedback("Digite seu nome para confirmar.");
      return;
    }

    saveGuestLocally(guestName);

    if (hasRemoteConfirmationSetup()) {
      submitPresenceToRemoteForm(guestName);
      clearPresenceFeedback();
      showStatusToast(
        inviteConfig.confirmationSuccessMessage || "Presenca confirmada"
      );
    } else {
      setPresenceFeedback(
        `${guestName}, sua presenca foi salva so neste aparelho. ` +
          "Para receber a lista completa de todos os convidados, configure o Google Form no arquivo config.js."
      );
    }

    presenceForm.reset();
  });
}

function setupWhatsAppLink() {
  if (!whatsappConfirmLink) {
    return;
  }

  if (whatsappNumber.trim()) {
    const sanitizedNumber = whatsappNumber.replace(/\D/g, "");
    whatsappConfirmLink.href = `https://wa.me/${sanitizedNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    return;
  }

  whatsappConfirmLink.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;
}

function saveGuestLocally(guestName) {
  const storedGuests = JSON.parse(localStorage.getItem("confirmacoes-cha-revelacao") || "[]");

  storedGuests.push({
    name: guestName,
    confirmedAt: new Date().toISOString()
  });

  localStorage.setItem("confirmacoes-cha-revelacao", JSON.stringify(storedGuests));
}

function hasRemoteConfirmationSetup() {
  return Boolean(
    inviteConfig.confirmationFormAction &&
      inviteConfig.confirmationNameField
  );
}

function submitPresenceToRemoteForm(guestName) {
  const hiddenForm = document.createElement("form");
  const hiddenInput = document.createElement("input");

  hiddenForm.action = inviteConfig.confirmationFormAction;
  hiddenForm.method = "POST";
  hiddenForm.target = "confirmation-submit-frame";
  hiddenForm.style.display = "none";

  hiddenInput.type = "hidden";
  hiddenInput.name = inviteConfig.confirmationNameField;
  hiddenInput.value = guestName;

  hiddenForm.appendChild(hiddenInput);
  document.body.appendChild(hiddenForm);
  hiddenForm.submit();
  document.body.removeChild(hiddenForm);
}

function prepareAnimatedNameLetters() {
  animatedNames.forEach((nameElement) => {
    const nameText = nameElement.querySelector(".name-text");

    if (!nameText || nameText.querySelector(".name-letter")) {
      return;
    }

    const letters = Array.from(nameText.textContent.trim());
    const totalLetters = letters.length;

    nameText.textContent = "";

    letters.forEach((letter, index) => {
      const letterSpan = document.createElement("span");

      letterSpan.className = "name-letter";
      letterSpan.textContent = letter;
      letterSpan.style.setProperty("--letter-index", String(index));
      letterSpan.style.setProperty("--letter-reverse-index", String(totalLetters - index - 1));
      nameText.appendChild(letterSpan);
    });

    nameElement.style.setProperty("--effect-delay", `${200 + totalLetters * 70}ms`);
    nameElement.style.setProperty("--name-scene-duration", `${nameAnimationDuration}ms`);
  });
}

function setupNameAnimations() {
  animatedNames.forEach((nameElement) => {
    nameElement.addEventListener("pointerenter", () => {
      triggerNameAnimation(nameElement);
    });

    nameElement.addEventListener("focusin", () => {
      triggerNameAnimation(nameElement);
    });

    nameElement.addEventListener("click", () => {
      triggerNameAnimation(nameElement);
    });
  });
}

function scheduleInitialNameAnimations() {
  if (!animatedNames.length) {
    return;
  }

  animatedNames.forEach((nameElement) => {
    const delay = nameElement.classList.contains("name-girl")
      ? initialGirlAnimationDelay
      : initialBoyAnimationDelay;

    window.setTimeout(() => {
      triggerNameAnimation(nameElement);
    }, delay);
  });
}

function setupAddressCopyFields() {
  addressCopyFields.forEach((field) => {
    field.addEventListener("click", () => {
      copyAddressField(field);
    });
  });
}

async function copyAddressField(field) {
  if (!field) {
    return;
  }

  const textToCopy = field.value.trim();
  const hint = field.closest(".highlight-card-address")?.querySelector(".copy-hint");

  field.focus();
  field.select();
  field.setSelectionRange(0, textToCopy.length);

  let copied = false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(textToCopy);
      copied = true;
    } catch (error) {
      copied = false;
    }
  }

  if (!copied) {
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
  }

  updateCopyHint(hint, copied);
  showStatusToast(
    copied
      ? "Endereco copiado com sucesso"
      : "Nao foi possivel copiar o endereco"
  );

  window.setTimeout(() => {
    field.blur();
  }, 120);
}

function updateCopyHint(hint, copied) {
  if (!hint) {
    return;
  }

  const defaultMessage = hint.dataset.defaultMessage || hint.textContent.trim();

  hint.dataset.defaultMessage = defaultMessage;
  hint.textContent = copied ? "Endereco copiado" : "Toque novamente para copiar";

  const previousTimerId = Number(hint.dataset.resetTimer || 0);

  if (previousTimerId) {
    window.clearTimeout(previousTimerId);
  }

  const timerId = window.setTimeout(() => {
    hint.textContent = defaultMessage;
    delete hint.dataset.resetTimer;
  }, 1800);

  hint.dataset.resetTimer = String(timerId);
}

function showStatusToast(message) {
  if (!copyToast) {
    return;
  }

  copyToast.textContent = message;
  copyToast.classList.add("is-visible");

  const previousTimerId = Number(copyToast.dataset.hideTimer || 0);

  if (previousTimerId) {
    window.clearTimeout(previousTimerId);
  }

  const timerId = window.setTimeout(() => {
    copyToast.classList.remove("is-visible");
    delete copyToast.dataset.hideTimer;
  }, copyToastDuration);

  copyToast.dataset.hideTimer = String(timerId);
}

function setPresenceFeedback(message) {
  if (!presenceFeedback) {
    return;
  }

  const previousTimerId = Number(presenceFeedback.dataset.hideTimer || 0);

  if (previousTimerId) {
    window.clearTimeout(previousTimerId);
  }

  presenceFeedback.textContent = message;

  const timerId = window.setTimeout(() => {
    clearPresenceFeedback();
  }, presenceFeedbackDuration);

  presenceFeedback.dataset.hideTimer = String(timerId);
}

function clearPresenceFeedback() {
  if (!presenceFeedback) {
    return;
  }

  const previousTimerId = Number(presenceFeedback.dataset.hideTimer || 0);

  if (previousTimerId) {
    window.clearTimeout(previousTimerId);
    delete presenceFeedback.dataset.hideTimer;
  }

  presenceFeedback.textContent = "";
}

function triggerNameAnimation(nameElement) {
  if (
    !nameElement ||
    nameElement.classList.contains("is-animating") ||
    nameElement.classList.contains("is-returning")
  ) {
    return;
  }

  clearNameAnimationTimers(nameElement);
  nameElement.classList.remove("is-returning");
  nameElement.classList.add("is-animating");

  const timerId = window.setTimeout(() => {
    startNameReturn(nameElement);
  }, nameAnimationDuration);

  nameElement.dataset.animationTimer = String(timerId);
}

function startNameReturn(nameElement) {
  if (!nameElement) {
    return;
  }

  const previousAnimationTimerId = Number(nameElement.dataset.animationTimer || 0);

  if (previousAnimationTimerId) {
    window.clearTimeout(previousAnimationTimerId);
    delete nameElement.dataset.animationTimer;
  }

  nameElement.classList.remove("is-animating");
  nameElement.classList.add("is-returning");

  const cleanupTimerId = window.setTimeout(() => {
    nameElement.classList.remove("is-returning");
    delete nameElement.dataset.cleanupTimer;
  }, nameReturnDuration);

  nameElement.dataset.cleanupTimer = String(cleanupTimerId);
}

function clearNameAnimationTimers(nameElement) {
  const animationTimerId = Number(nameElement.dataset.animationTimer || 0);
  const cleanupTimerId = Number(nameElement.dataset.cleanupTimer || 0);

  if (animationTimerId) {
    window.clearTimeout(animationTimerId);
    delete nameElement.dataset.animationTimer;
  }

  if (cleanupTimerId) {
    window.clearTimeout(cleanupTimerId);
    delete nameElement.dataset.cleanupTimer;
  }
}
