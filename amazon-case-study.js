(() => {
  const carousels = document.querySelectorAll('.amazon-use-case-carousel');

  if (!carousels.length) {
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  carousels.forEach((carousel) => {
    const viewport = carousel.querySelector('.amazon-use-case-carousel-viewport');
    const track = carousel.querySelector('.amazon-use-case-carousel-track');
    const slides = [...carousel.querySelectorAll('.amazon-use-case-slide')];
    const previousButton = carousel.querySelector('.amazon-use-case-control-prev');
    const nextButton = carousel.querySelector('.amazon-use-case-control-next');
    const pagination = carousel.querySelector('.amazon-use-case-pagination');
    const status = carousel.querySelector('.amazon-use-case-status');
    const isWireframeCarousel = carousel.classList.contains('amazon-wireframe-carousel');
    let activeIndex = 0;
    let autoplayTimer;
    let experienceTimer;
    let scrollTimer;
    const wireframeSequences = slides.map((slide) => (
      slide.dataset.wireframeImages?.split(',') || []
    ));
    const wireframeFrameIndexes = slides.map(() => 0);
    const confettiColors = ['#ffd43b', '#ff6b6b', '#f06595', '#845ef7', '#22b8cf', '#20c997'];

    wireframeSequences.flat().forEach((file) => {
      const preload = new Image();
      preload.src = `images/amazon-pay-ux-research/${file}`;
    });

    if (isWireframeCarousel) {
      slides.forEach((slide) => {
        const screen = slide.querySelector('.amazon-wireframe-phone-screen');
        const layer = document.createElement('div');

        layer.className = 'amazon-confetti-layer';
        layer.setAttribute('aria-hidden', 'true');

        for (let index = 0; index < 48; index += 1) {
          const particle = document.createElement('span');
          const angle = (-168 + (index / 47) * 156 + ((index % 5) - 2) * 2) * (Math.PI / 180);
          const distance = 175 + ((index * 67) % 235);
          const width = 5 + (index % 4) * 2;
          const height = index % 3 === 0 ? width : width * 1.8;

          particle.className = `amazon-confetti-particle${index % 4 === 0 ? ' is-circle' : ''}`;
          particle.style.setProperty('--particle-color', confettiColors[index % confettiColors.length]);
          particle.style.setProperty('--particle-width', `${width}px`);
          particle.style.setProperty('--particle-height', `${height}px`);
          particle.style.setProperty('--particle-x', `${Math.cos(angle) * distance}px`);
          particle.style.setProperty('--particle-y', `${Math.sin(angle) * distance}px`);
          particle.style.setProperty('--particle-rotation', `${180 + ((index * 83) % 540)}deg`);
          particle.style.setProperty('--particle-duration', `${1750 + ((index * 71) % 650)}ms`);
          particle.style.setProperty('--particle-delay', `${(index * 19) % 140}ms`);
          layer.append(particle);
        }

        screen.append(layer);
      });
    }

    if (carousel.dataset.carouselType === 'use-cases') {
      slides.slice(2).forEach((slide) => {
        const title = slide.querySelector('figcaption').textContent;
        const screen = slide.querySelector('.amazon-use-case-phone-screen');
        const continuation = document.createElement('img');

        screen.classList.add('amazon-use-case-phone-screen-scrollable');
        screen.tabIndex = 0;
        screen.setAttribute('role', 'region');
        screen.setAttribute('aria-label', `Scrollable ${title} Thank You page`);
        continuation.src = 'images/amazon-pay-ux-research/use-case-screen-continuation.png?v=2';
        continuation.alt = `${title} offers, rewards, and navigation`;
        screen.append(continuation);
      });
    }

    let dots = [];

    function renderWireframePagination() {
      if (dots.length !== slides.length) {
        pagination.replaceChildren();
        dots = slides.map((slide, slideIndex) => {
          const dot = document.createElement('button');

          dot.type = 'button';
          dot.setAttribute('aria-label', `Show ${slide.querySelector('figcaption').textContent}`);
          dot.addEventListener('click', () => handleManualNavigation(slideIndex));
          pagination.append(dot);
          return dot;
        });
      }

      dots.forEach((dot, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    }

    if (isWireframeCarousel) {
      renderWireframePagination();
    } else {
      dots = slides.map((slide, index) => {
        const dot = document.createElement('button');

        dot.type = 'button';
        dot.setAttribute('aria-label', `Show ${slide.querySelector('figcaption').textContent}`);
        dot.addEventListener('click', () => handleManualNavigation(index));
        pagination.append(dot);
        return dot;
      });
    }

    const updateState = () => {
      slides.forEach((slide, index) => {
        const isActive = index === activeIndex;
        slide.classList.toggle('is-active', isActive);
        slide.classList.toggle('is-before', index < activeIndex);
        slide.classList.toggle('is-after', index > activeIndex);
        slide.setAttribute('aria-hidden', String(!isActive));
      });

      if (isWireframeCarousel) {
        renderWireframePagination();
      } else {
        dots.forEach((dot, index) => {
          const isActive = index === activeIndex;
          dot.classList.toggle('is-active', isActive);
          dot.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
      }

      status.textContent = slides[activeIndex].querySelector('figcaption').textContent;
    };

    const alignSlide = (slide, behavior = 'smooth') => {
      viewport.scrollTo({
        left: slide.offsetLeft - (viewport.clientWidth - slide.offsetWidth) / 2,
        behavior: reduceMotion.matches ? 'auto' : behavior,
      });
    };

    const alignActiveSlide = (behavior = 'smooth') => {
      alignSlide(slides[activeIndex], behavior);
    };

    function showWireframeFrame(slideIndex, frameIndex) {
      const sequence = wireframeSequences[slideIndex];
      if (!sequence.length) {
        return;
      }

      const slide = slides[slideIndex];
      const title = slide.querySelector('figcaption').textContent;
      const screen = slide.querySelector('.amazon-wireframe-phone-screen');
      const image = screen.querySelector('img');
      screen.classList.remove('show-confetti');
      wireframeFrameIndexes[slideIndex] = frameIndex;
      image.src = `images/amazon-pay-ux-research/${sequence[frameIndex]}`;
      image.alt = `${title} experience screen ${frameIndex + 1}`;

      if (frameIndex === 0) {
        void screen.offsetWidth;
        screen.classList.add('show-confetti');
      }
    }

    function showSlide(index, behavior = 'smooth') {
      const nextIndex = (index + slides.length) % slides.length;
      activeIndex = nextIndex;
      if (isWireframeCarousel) {
        showWireframeFrame(activeIndex, 0);
      }
      updateState();
      alignActiveSlide(behavior);
    }

    const stopAutoplay = () => window.clearInterval(autoplayTimer);
    const startExperienceAnimation = () => {
      window.clearInterval(experienceTimer);
      if (!isWireframeCarousel || reduceMotion.matches) {
        return;
      }

      experienceTimer = window.setInterval(() => {
        const sequence = wireframeSequences[activeIndex];
        const frameIndex = wireframeFrameIndexes[activeIndex] + 1;

        if (frameIndex >= sequence.length) {
          showSlide(activeIndex + 1);
        } else {
          showWireframeFrame(activeIndex, frameIndex);
        }
      }, 3000);
    };
    const startAutoplay = () => {
      stopAutoplay();
      if (
        !reduceMotion.matches
        && carousel.dataset.autoplay !== 'false'
        && !isWireframeCarousel
      ) {
        autoplayTimer = window.setInterval(() => showSlide(activeIndex + 1), 4500);
      }
    };

    const handleManualNavigation = (index) => {
      showSlide(index);
      startAutoplay();
      startExperienceAnimation();
    };

    previousButton.addEventListener('click', () => handleManualNavigation(activeIndex - 1));
    nextButton.addEventListener('click', () => handleManualNavigation(activeIndex + 1));
    if (isWireframeCarousel) {
      slides.forEach((slide, index) => {
        slide.querySelector('.amazon-wireframe-phone-screen')
          .addEventListener('click', () => {
            if (index === activeIndex) {
              showWireframeFrame(activeIndex, 0);
              startExperienceAnimation();
            } else {
              handleManualNavigation(index);
            }
          });
      });
    }

    viewport.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        handleManualNavigation(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });

    viewport.addEventListener('scroll', () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
        const nearestIndex = slides.reduce((closestIndex, slide, index) => {
          const currentDistance = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - viewportCenter);
          const closestSlide = slides[closestIndex];
          const closestDistance = Math.abs(
            closestSlide.offsetLeft + closestSlide.offsetWidth / 2 - viewportCenter,
          );
          return currentDistance < closestDistance ? index : closestIndex;
        }, 0);

        if (nearestIndex !== activeIndex) {
          activeIndex = nearestIndex;
          updateState();
        }
      }, 120);
    }, { passive: true });

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', (event) => {
      if (!carousel.contains(event.relatedTarget)) {
        startAutoplay();
      }
    });
    window.addEventListener('resize', () => alignActiveSlide('auto'));

    updateState();
    if (isWireframeCarousel) {
      showWireframeFrame(0, 0);
    }
    window.requestAnimationFrame(() => alignActiveSlide('auto'));
    startAutoplay();
    startExperienceAnimation();
  });
})();

(() => {
  const prototypes = document.querySelectorAll('.amazon-rewards-prototype');

  if (!prototypes.length) {
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prototypeSteps = {
    impact: [
      ['rewards-presence-phone.png?v=3', 'Rewards presence on Thank You page'],
      ['misc-2.png', 'Rewards experience step 1'],
      ['misc-3.png', 'Rewards experience step 2'],
    ],
    wireframes: [
      ['misc-4.png', 'Cashback rewards wireframe 1', 'Cashback rewards'],
      ['misc-5.png', 'Cashback rewards wireframe 2', 'Cashback rewards'],
      ['misc-6.png', 'Cashback rewards wireframe 3', 'Cashback rewards'],
      ['misc-10.png', 'Scratch rewards wireframe 1', 'Scratch rewards'],
      ['misc-11.png', 'Scratch rewards wireframe 2', 'Scratch rewards'],
      ['misc-12.png', 'Scratch rewards wireframe 3', 'Scratch rewards'],
      ['misc-7.png', 'Offer rewards wireframe 1', 'Offer rewards'],
      ['misc-8.png', 'Offer rewards wireframe 2', 'Offer rewards'],
      ['misc-9.png', 'Offer rewards wireframe 3', 'Offer rewards'],
    ],
  };

  prototypes.forEach((prototype) => {
    const screen = prototype.querySelector('.amazon-rewards-prototype-screen');
    const image = screen.querySelector('img');
    const status = prototype.querySelector('.amazon-rewards-prototype-status');
    const category = prototype.querySelector('.amazon-rewards-prototype-category');
    const steps = prototypeSteps[prototype.dataset.rewardsPrototype].map(([file, label, group]) => ({
      src: `images/amazon-pay-ux-research/${file}`,
      label,
      alt: label,
      group,
    }));
    let activeIndex = 0;
    let autoplayTimer;

    steps.slice(1).forEach(({ src }) => {
      const preload = new Image();
      preload.src = src;
    });

    function showStep(index) {
      activeIndex = (index + steps.length) % steps.length;
      const step = steps[activeIndex];
      image.src = step.src;
      image.alt = step.alt;
      screen.setAttribute('aria-label', `${step.label}. Click to continue.`);
      status.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${steps.length} — ${step.label}`;
      if (category) {
        category.textContent = step.group;
      }

    }

    const stopAutoplay = () => window.clearInterval(autoplayTimer);
    const startAutoplay = () => {
      stopAutoplay();
      if (!reduceMotion.matches) {
        autoplayTimer = window.setInterval(() => showStep(activeIndex + 1), 3500);
      }
    };
    const handleManualNavigation = (index) => {
      showStep(index);
      startAutoplay();
    };

    screen.addEventListener('click', () => handleManualNavigation(activeIndex + 1));
    prototype.addEventListener('focusin', stopAutoplay);
    prototype.addEventListener('focusout', (event) => {
      if (!prototype.contains(event.relatedTarget)) {
        startAutoplay();
      }
    });
    showStep(0);
    startAutoplay();
  });
})();

(() => {
  const mappings = document.querySelectorAll('.amazon-pay-opportunity');

  if (!mappings.length) {
    return;
  }

  mappings.forEach((mapping) => {
    const problems = [...mapping.querySelectorAll('.problem-note')];
    const opportunities = [...mapping.querySelectorAll('.design-opportunity')];

    const activateOpportunity = (activeIndex) => {
      problems.forEach((problem, index) => {
        let offset = (index - activeIndex + problems.length) % problems.length;
        if (offset > Math.floor(problems.length / 2)) {
          offset -= problems.length;
        }

        problem.classList.remove('is-active', 'is-before', 'is-before-far', 'is-after', 'is-after-far');
        problem.classList.add(
          offset === 0
            ? 'is-active'
            : offset === -1
              ? 'is-before'
              : offset < -1
                ? 'is-before-far'
                : offset === 1
                  ? 'is-after'
                  : 'is-after-far',
        );
        problem.setAttribute('aria-pressed', String(offset === 0));
        problem.setAttribute('tabindex', Math.abs(offset) <= 1 ? '0' : '-1');
      });

      opportunities.forEach((opportunity, index) => {
        opportunity.classList.toggle('is-active', index === activeIndex);
        opportunity.setAttribute('aria-hidden', String(index !== activeIndex));
      });
    };

    problems.forEach((problem, index) => {
      problem.addEventListener('click', () => activateOpportunity(index));
      problem.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activateOpportunity(index);
        }
      });
    });

    activateOpportunity(0);
  });
})();

(() => {
  const voicesSection = document.querySelector('.amazon-pdf-voices');
  const control = voicesSection?.querySelector('.amazon-pdf-voices-control');
  const label = control?.querySelector('.amazon-pdf-voices-control-label');

  if (!voicesSection || !control || !label) {
    return;
  }

  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    control.disabled = true;
    label.textContent = 'Voiceover unavailable';
    return;
  }

  const visibleQuotes = [...voicesSection.querySelectorAll('blockquote:not([aria-hidden="true"])')];
  const allQuotes = [...voicesSection.querySelectorAll('blockquote')];
  const masculineVoicePatterns = [
    /\brishi\b/i,
    /\bdaniel\b/i,
    /microsoft (david|mark|guy|ryan|christopher|eric)/i,
    /google uk english male/i,
    /\b(alex|ralph|fred|aaron|arthur|bruce|eddy|reed|rocko)\b/i,
    /\bmale\b/i,
  ];
  let currentIndex = 0;
  let isPlaying = false;
  let isPaused = false;
  let playbackId = 0;

  const selectMasculineVoice = () => {
    const englishVoices = window.speechSynthesis
      .getVoices()
      .filter((voice) => voice.lang.toLowerCase().startsWith('en'));

    for (const pattern of masculineVoicePatterns) {
      const match = englishVoices.find((voice) => pattern.test(voice.name));
      if (match) {
        return match;
      }
    }

    return englishVoices[0] ?? null;
  };

  const waitForMasculineVoice = async () => {
    const availableVoice = selectMasculineVoice();
    if (availableVoice) {
      return availableVoice;
    }

    await new Promise((resolve) => {
      const handleVoicesChanged = () => {
        window.clearTimeout(timeoutId);
        resolve();
      };
      const timeoutId = window.setTimeout(() => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve();
      }, 750);

      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged, { once: true });
    });

    return selectMasculineVoice();
  };

  const updateControl = () => {
    control.classList.toggle('is-playing', isPlaying && !isPaused);
    control.setAttribute('aria-pressed', String(isPlaying));
    label.textContent = !isPlaying
      ? 'Play customer voices'
      : isPaused
        ? 'Resume customer voices'
        : 'Pause customer voices';
  };

  const highlightQuote = () => {
    allQuotes.forEach((quote, index) => {
      quote.classList.toggle('is-speaking', isPlaying && index % visibleQuotes.length === currentIndex);
    });
  };

  const finishPlayback = () => {
    isPlaying = false;
    isPaused = false;
    currentIndex = 0;
    highlightQuote();
    updateControl();
  };

  const speakCurrentQuote = async (activePlaybackId) => {
    if (!isPlaying || activePlaybackId !== playbackId) {
      return;
    }

    if (currentIndex >= visibleQuotes.length) {
      finishPlayback();
      return;
    }

    highlightQuote();
    const masculineVoice = await waitForMasculineVoice();
    if (!isPlaying || activePlaybackId !== playbackId) {
      return;
    }

    const quote = visibleQuotes[currentIndex].textContent.trim();
    const irritatedDelivery = quote.replace(/[“”]/g, '').replace(/\?+$/, '?!');
    const utterance = new SpeechSynthesisUtterance(irritatedDelivery);
    if (masculineVoice) {
      utterance.voice = masculineVoice;
    }
    utterance.lang = masculineVoice?.lang ?? 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => {
      if (!isPlaying || activePlaybackId !== playbackId) {
        return;
      }

      currentIndex += 1;
      speakCurrentQuote(activePlaybackId);
    };
    utterance.onerror = (event) => {
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        finishPlayback();
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  control.addEventListener('click', () => {
    if (!isPlaying) {
      playbackId += 1;
      currentIndex = 0;
      isPlaying = true;
      isPaused = false;
      updateControl();
      speakCurrentQuote(playbackId);
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      isPaused = false;
    } else {
      window.speechSynthesis.pause();
      isPaused = true;
    }

    updateControl();
  });

  window.addEventListener('pagehide', () => {
    playbackId += 1;
    window.speechSynthesis.cancel();
  });

  updateControl();
})();
