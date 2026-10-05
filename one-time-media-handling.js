const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

/* ---------- OTMH walkthrough video controls ---------- */
const otmhVideo = document.querySelector("#otmhVideo");
const otmhPlayToggle = document.querySelector("#otmhPlayToggle");
const otmhFullscreenBtn = document.querySelector("#otmhFullscreenBtn");
const otmhMuteToggle = document.querySelector("#otmhMuteToggle");
const otmhTime = document.querySelector("#otmhTime");
const otmhSeek = document.querySelector("#otmhSeek");

function formatTime(seconds) {
  if (!isFinite(seconds)) return "0:00";
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

if (otmhVideo && otmhPlayToggle) {
  otmhPlayToggle.addEventListener("click", () => {
    if (otmhVideo.paused) {
      otmhVideo.play();
    } else {
      otmhVideo.pause();
    }
  });
  otmhVideo.addEventListener("play", () => {
    otmhPlayToggle.classList.remove("is-paused");
    otmhPlayToggle.setAttribute("aria-label", "Pause video");
  });
  otmhVideo.addEventListener("pause", () => {
    otmhPlayToggle.classList.add("is-paused");
    otmhPlayToggle.setAttribute("aria-label", "Play video");
  });
}

if (otmhVideo && otmhMuteToggle) {
  otmhMuteToggle.classList.toggle("is-muted", otmhVideo.muted);
  otmhMuteToggle.addEventListener("click", () => {
    otmhVideo.muted = !otmhVideo.muted;
    otmhMuteToggle.classList.toggle("is-muted", otmhVideo.muted);
    otmhMuteToggle.setAttribute("aria-label", otmhVideo.muted ? "Unmute video" : "Mute video");
  });
}

if (otmhVideo && otmhTime && otmhSeek) {
  let seeking = false;
  otmhVideo.addEventListener("loadedmetadata", () => {
    otmhTime.textContent = `${formatTime(otmhVideo.currentTime)} / ${formatTime(otmhVideo.duration)}`;
  });
  otmhVideo.addEventListener("timeupdate", () => {
    if (seeking) return;
    otmhTime.textContent = `${formatTime(otmhVideo.currentTime)} / ${formatTime(otmhVideo.duration)}`;
    if (otmhVideo.duration) {
      otmhSeek.value = (otmhVideo.currentTime / otmhVideo.duration) * 100;
    }
  });
  otmhSeek.addEventListener("input", () => {
    seeking = true;
    if (otmhVideo.duration) {
      otmhVideo.currentTime = (otmhSeek.value / 100) * otmhVideo.duration;
    }
  });
  otmhSeek.addEventListener("change", () => {
    seeking = false;
  });
}

if (otmhVideo && otmhFullscreenBtn) {
  otmhFullscreenBtn.addEventListener("click", () => {
    if (otmhVideo.requestFullscreen) {
      otmhVideo.requestFullscreen();
    } else if (otmhVideo.webkitRequestFullscreen) {
      otmhVideo.webkitRequestFullscreen();
    }
  });
  const syncNativeControls = () => {
    const isFullscreen = document.fullscreenElement === otmhVideo || document.webkitFullscreenElement === otmhVideo;
    otmhVideo.controls = isFullscreen;
  };
  document.addEventListener("fullscreenchange", syncNativeControls);
  document.addEventListener("webkitfullscreenchange", syncNativeControls);
}

menuToggle?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

navLinks?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation");
  });
});

const imageDialog = document.querySelector("#image-dialog");
const dialogImage = imageDialog?.querySelector("img");
const closeDialogButton = imageDialog?.querySelector(".dialog-close");

document.querySelectorAll("[data-lightbox-src]").forEach((button) => {
  button.addEventListener("click", () => {
    dialogImage.src = button.dataset.lightboxSrc;
    dialogImage.alt = button.dataset.lightboxAlt;
    imageDialog.showModal();
  });
});

closeDialogButton?.addEventListener("click", () => imageDialog.close());

imageDialog?.addEventListener("click", (event) => {
  if (event.target === imageDialog) {
    imageDialog.close();
  }
});

const questionOptions = Array.from(document.querySelectorAll(".question-option"));
const questionPanels = Array.from(document.querySelectorAll(".question-panel"));
let activeQuestionIndex = questionOptions.findIndex((option) => option.classList.contains("is-active"));

const selectQuestion = (nextIndex) => {
  activeQuestionIndex = (nextIndex + questionOptions.length) % questionOptions.length;

  questionOptions.forEach((option, index) => {
    const offset = (index - activeQuestionIndex + questionOptions.length) % questionOptions.length;
    const position = offset === 0 ? "active" : offset === 1 ? "next" : "previous";
    const isActive = index === activeQuestionIndex;

    option.dataset.position = position;
    option.classList.toggle("is-active", isActive);
    option.setAttribute("aria-selected", String(isActive));
    option.tabIndex = isActive ? 0 : -1;
  });

  questionPanels.forEach((panel, index) => {
    panel.classList.toggle("is-active", index === activeQuestionIndex);
  });
};

questionOptions.forEach((option, index) => {
  option.addEventListener("click", () => selectQuestion(index));
  option.addEventListener("keydown", (event) => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? questionOptions.length - 1
          : activeQuestionIndex + (["ArrowUp", "ArrowLeft"].includes(event.key) ? -1 : 1);
    selectQuestion(nextIndex);
    questionOptions[activeQuestionIndex].focus();
  });
});

selectQuestion(activeQuestionIndex);

const impactTrack = document.querySelector(".impact-track");
const impactCards = Array.from(document.querySelectorAll(".impact-card"));
const impactDots = document.querySelector(".impact-dots");
const impactNavigation = document.querySelector(".impact-section .impact-carousel-navigation");
const impactPrevious = document.querySelector(".impact-previous");
const impactNext = document.querySelector(".impact-next");

if (
  impactTrack &&
  impactCards.length &&
  impactDots &&
  impactNavigation &&
  impactPrevious &&
  impactNext
) {
  const autoplayDelay = 4500;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let currentPage = 0;
  let autoplayTimer;
  let scrollFrame;

  const getVisibleCardCount = () => (window.matchMedia("(max-width: 720px)").matches ? 1 : 3);
  const getPageCount = () => Math.ceil(impactCards.length / getVisibleCardCount());

  const updateDots = () => {
    impactDots.querySelectorAll("button").forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentPage);
      dot.setAttribute("aria-current", index === currentPage ? "true" : "false");
    });

    const lastPage = getPageCount() - 1;
    impactNavigation.hidden = lastPage <= 0;
    impactPrevious.disabled = currentPage === 0;
    impactNext.disabled = currentPage === lastPage;
  };

  const goToPage = (page, behavior = "smooth") => {
    const pageCount = getPageCount();
    currentPage = (page + pageCount) % pageCount;
    const cardIndex = currentPage * getVisibleCardCount();
    const firstCardOffset = impactCards[0].offsetLeft;
    impactTrack.scrollTo({
      left: impactCards[cardIndex].offsetLeft - firstCardOffset,
      behavior,
    });
    updateDots();
  };

  const stopAutoplay = () => {
    window.clearInterval(autoplayTimer);
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (!reducedMotion.matches && !document.hidden) {
      autoplayTimer = window.setInterval(() => goToPage(currentPage + 1), autoplayDelay);
    }
  };

  const renderDots = () => {
    impactDots.replaceChildren();
    for (let page = 0; page < getPageCount(); page += 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Show impact page ${page + 1}`);
      dot.addEventListener("click", () => {
        goToPage(page);
        startAutoplay();
      });
      impactDots.appendChild(dot);
    }
    updateDots();
  };

  impactTrack.addEventListener(
    "scroll",
    () => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(() => {
        const pagePositions = Array.from({ length: getPageCount() }, (_, page) => {
          const card = impactCards[page * getVisibleCardCount()];
          return card.offsetLeft - impactCards[0].offsetLeft;
        });
        currentPage = pagePositions.reduce(
          (closest, position, index) =>
            Math.abs(position - impactTrack.scrollLeft) <
            Math.abs(pagePositions[closest] - impactTrack.scrollLeft)
              ? index
              : closest,
          0,
        );
        updateDots();
      });
    },
    { passive: true },
  );

  impactTrack.addEventListener("mouseenter", stopAutoplay);
  impactTrack.addEventListener("mouseleave", startAutoplay);
  impactTrack.addEventListener("focusin", stopAutoplay);
  impactTrack.addEventListener("focusout", startAutoplay);

  window.addEventListener("resize", () => {
    currentPage = 0;
    renderDots();
    goToPage(0, "auto");
  });

  document.addEventListener("visibilitychange", startAutoplay);
  reducedMotion.addEventListener("change", startAutoplay);

  impactPrevious.addEventListener("click", () => {
    goToPage(currentPage - 1);
    startAutoplay();
  });
  impactNext.addEventListener("click", () => {
    goToPage(currentPage + 1);
    startAutoplay();
  });

  renderDots();
  startAutoplay();
}

window.addEventListener("load", () => {
  const targetId = window.location.hash.slice(1);
  const target = document.getElementById(targetId);
  target?.scrollIntoView();
  window.setTimeout(() => target?.scrollIntoView(), 500);
});
