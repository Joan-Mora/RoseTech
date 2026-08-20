let touchMoveGuard: ((e: TouchEvent) => void) | null = null;
let lockCount = 0;

function clearLockStyles() {
  const html = document.documentElement;
  const body = document.body;
  const lockedTop = body.style.top;

  html.classList.remove("nav-lock");
  body.classList.remove("nav-lock");
  html.style.removeProperty("overflow");
  body.style.removeProperty("overflow");
  body.style.removeProperty("position");
  body.style.removeProperty("top");
  body.style.removeProperty("left");
  body.style.removeProperty("right");
  body.style.removeProperty("width");
  body.style.removeProperty("padding-right");
  html.style.removeProperty("padding-right");

  if (touchMoveGuard) {
    document.removeEventListener("touchmove", touchMoveGuard);
    touchMoveGuard = null;
  }

  if (lockedTop) {
    const y = Math.abs(Number.parseInt(lockedTop, 10) || 0);
    window.scrollTo(0, y);
  }
}

export function unlockBody() {
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount === 0) clearLockStyles();
}

export function lockBody() {
  if (lockCount === 0) {
    const html = document.documentElement;
    const body = document.body;
    const scrollY = Math.round(window.scrollY);

    if (touchMoveGuard) {
      document.removeEventListener("touchmove", touchMoveGuard);
      touchMoveGuard = null;
    }

    html.classList.add("nav-lock");
    body.classList.add("nav-lock");
    body.style.top = `-${scrollY}px`;

    touchMoveGuard = (e: TouchEvent) => {
      const drawer = document.getElementById("mobile-nav");
      if (drawer?.contains(e.target as Node)) return;
      e.preventDefault();
    };
    document.addEventListener("touchmove", touchMoveGuard, { passive: false });
  }
  lockCount += 1;
}

/** Force-clear lock state (e.g. desktop breakpoint while menu open). */
export function forceUnlockBody() {
  lockCount = 0;
  clearLockStyles();
}
