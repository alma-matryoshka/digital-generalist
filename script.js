(function () {
  const MOBILE_MQ = window.matchMedia("(max-width: 900px)");
  const REDUCE_MQ = window.matchMedia("(prefers-reduced-motion: reduce)");

  const heroVisual = document.getElementById("heroVisual");
  const matryoshkaWrap = document.getElementById("matryoshkaWrap");
  const mobileSplash = document.querySelector(".mobile-splash");
  const symbols = document.querySelector(".hero-visual .symbols");

  const PARALLAX_STRENGTH = { x: 22, y: 16 };
  let parallaxTarget = { x: 0, y: 0 };
  let parallaxCurrent = { x: 0, y: 0 };
  let parallaxRaf = null;

  /* ——— Symbols: reduced motion ——— */
  function applySymbolMotion() {
    if (!symbols) return;
    symbols.style.animationPlayState = REDUCE_MQ.matches ? "paused" : "running";
  }

  applySymbolMotion();
  REDUCE_MQ.addEventListener("change", applySymbolMotion);

  /* ——— Desktop: matryoshka follows cursor ——— */
  function setParallaxCSS(x, y) {
    document.documentElement.style.setProperty("--parallax-x", `${x}px`);
    document.documentElement.style.setProperty("--parallax-y", `${y}px`);
  }

  function lerpParallax() {
    const ease = REDUCE_MQ.matches ? 1 : 0.08;
    parallaxCurrent.x += (parallaxTarget.x - parallaxCurrent.x) * ease;
    parallaxCurrent.y += (parallaxTarget.y - parallaxCurrent.y) * ease;

    setParallaxCSS(
      parallaxCurrent.x.toFixed(2),
      parallaxCurrent.y.toFixed(2)
    );

    const settled =
      Math.abs(parallaxTarget.x - parallaxCurrent.x) < 0.05 &&
      Math.abs(parallaxTarget.y - parallaxCurrent.y) < 0.05;

    if (!settled) {
      parallaxRaf = requestAnimationFrame(lerpParallax);
    } else {
      parallaxRaf = null;
    }
  }

  function requestParallaxFrame() {
    if (parallaxRaf === null) {
      parallaxRaf = requestAnimationFrame(lerpParallax);
    }
  }

  function onHeroMouseMove(event) {
    if (MOBILE_MQ.matches || REDUCE_MQ.matches || !heroVisual) return;

    const rect = heroVisual.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;

    parallaxTarget.x = nx * PARALLAX_STRENGTH.x;
    parallaxTarget.y = ny * PARALLAX_STRENGTH.y;
    requestParallaxFrame();
  }

  function resetParallax() {
    parallaxTarget = { x: 0, y: 0 };
    requestParallaxFrame();
  }

  if (heroVisual) {
    heroVisual.addEventListener("mousemove", onHeroMouseMove);
    heroVisual.addEventListener("mouseleave", resetParallax);
  }

  /* ——— Mobile: splash dismiss on scroll ——— */
  function updateMobileSplash() {
    if (!mobileSplash || !MOBILE_MQ.matches) {
      document.documentElement.style.setProperty("--splash-progress", "0");
      if (mobileSplash) mobileSplash.classList.remove("is-dismissed");
      return;
    }

    const threshold = window.innerHeight * 0.72;
    const progress = Math.min(1, window.scrollY / threshold);

    document.documentElement.style.setProperty(
      "--splash-progress",
      progress.toFixed(4)
    );

    mobileSplash.classList.toggle("is-dismissed", progress >= 0.98);
    mobileSplash.setAttribute(
      "aria-hidden",
      progress >= 0.98 ? "true" : "false"
    );
  }

  let scrollTicking = false;
  function onScroll() {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(() => {
        updateMobileSplash();
        scrollTicking = false;
      });
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    updateMobileSplash();
    if (MOBILE_MQ.matches) resetParallax();
  });

  MOBILE_MQ.addEventListener("change", () => {
    updateMobileSplash();
    resetParallax();
  });

  updateMobileSplash();
})();
