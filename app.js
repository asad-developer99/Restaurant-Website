/**
 * MULTI-SECTION SCROLL-DRIVEN MOTION ENGINE
 * Section 1: Burger Atelier (frames/frame_XXXX.jpg, 240 frames) with alternating typography stages
 * Transition: 5-part vertical yellow slat curtain rising up, adding up to reveal the pizza photo
 * Section 2: Stone-Fired Pizza (frames2/frame_XXXX.jpg, 105 frames) - Scroll-triggered deconstruction
 */

document.addEventListener('DOMContentLoaded', () => {
  const TOTAL_FRAMES_1 = 240;
  const TOTAL_FRAMES_2 = 105;
  const loader = document.getElementById('canvas-loader');

  // Track & Viewport Elements
  const track1 = document.getElementById('track-1');
  const trackTrans = document.getElementById('track-transition');
  const track2 = document.getElementById('track-2');
  const track3 = document.getElementById('track-3');
  const nextWaveSection = document.getElementById('next-section');
  let sectionHeaders = [];

  const canvas1 = document.getElementById('burger-canvas');
  const ctx1 = canvas1.getContext('2d', { alpha: false });

  const canvas2 = document.getElementById('pizza-canvas');
  const ctx2 = canvas2.getContext('2d', { alpha: false });

  const brandHeader = document.getElementById('brand-header');
  const slatsCurtain = document.getElementById('transition-slats');
  const slats = [
    document.getElementById('slat-0'),
    document.getElementById('slat-1'),
    document.getElementById('slat-2'),
    document.getElementById('slat-3'),
    document.getElementById('slat-4')
  ];

  // Section 1 Text Stages (Burger Atelier)
  const stages1 = [
    {
      el: document.getElementById('text-stage-1'),
      type: 'initial',
      exitStart: 10,
      exitEnd: 42
    },
    {
      el: document.getElementById('text-stage-2'),
      type: 'middle',
      enterStart: 38,
      enterEnd: 64,
      exitStart: 85,
      exitEnd: 106
    },
    {
      el: document.getElementById('text-stage-3'),
      type: 'middle',
      enterStart: 98,
      enterEnd: 122,
      exitStart: 138,
      exitEnd: 158
    },
    {
      el: document.getElementById('text-stage-4'),
      type: 'middle',
      enterStart: 150,
      enterEnd: 172,
      exitStart: 190,
      exitEnd: 208
    },
    {
      el: document.getElementById('text-stage-5'),
      type: 'final',
      enterStart: 200,
      enterEnd: 222
    }
  ];

  // Section 2 Text Stages (Stone-Fired Pizza Atelier, 105 frames)
  const stages2 = [
    {
      el: document.getElementById('text-pizza-1'),
      type: 'initial',
      exitStart: 6,
      exitEnd: 22
    },
    {
      el: document.getElementById('text-pizza-2'),
      type: 'middle',
      enterStart: 18,
      enterEnd: 32,
      exitStart: 44,
      exitEnd: 56
    },
    {
      el: document.getElementById('text-pizza-3'),
      type: 'middle',
      enterStart: 52,
      enterEnd: 64,
      exitStart: 74,
      exitEnd: 84
    },
    {
      el: document.getElementById('text-pizza-4'),
      type: 'middle',
      enterStart: 78,
      enterEnd: 86,
      exitStart: 89,
      exitEnd: 94
    },
    {
      el: document.getElementById('text-pizza-5'),
      type: 'final',
      enterStart: 95,
      enterEnd: 100
    }
  ];

  // Image caches
  const images1 = [];
  const images2 = [];
  let loadedCount1 = 0;
  let loadedCount2 = 0;

  // Frame animation states
  let currentFrame1 = 1;
  let targetFrame1 = 1;

  let currentFrame2 = 1;
  let targetFrame2 = 1;

  let currentTransProgress = 0;
  let targetTransProgress = 0;

  let currentWaveProgress = 0;
  let targetWaveProgress = 0;

  let isTicking = false;

  // Cached layout metrics to avoid ANY layout reflow during scroll & animation loop
  let cachedWinH = window.innerHeight;
  let cachedNextWaveHeight = 0;
  let cachedT1Top = 0;
  let cachedTTransTop = 0;
  let cachedTransHeight = 0;
  let cachedT2Top = 0;
  let cachedT2Height = 0;
  let cachedT3Top = 0;
  let cachedT3Height = 0;
  let cachedT3ScrollRange = 1;
  let cachedTotalMaxScroll = 1;
  let isWaveBackgroundEmerald = null;
  let lastDrawnFrame1 = -1;
  let lastDrawnFrame2 = -1;
  let cachedHeaderMetrics = [];
  let cachedFooterMetric = null;
  let areStagesHiddenForWave = false;

  function cacheFooterMetric() {
    const footerEl = document.getElementById('restaurant-footer');
    if (!footerEl || !nextWaveSection) return;
    let cur = footerEl;
    let top = 0;
    while (cur && cur !== nextWaveSection) {
      top += cur.offsetTop || 0;
      cur = cur.offsetParent;
    }
    cachedFooterMetric = {
      el: footerEl,
      top: top,
      height: footerEl.offsetHeight || 240
    };
  }

  function cacheHeaderMetrics() {
    if (!sectionHeaders || !sectionHeaders.length || !nextWaveSection) return;
    cachedHeaderMetrics = sectionHeaders.map(header => {
      let cur = header;
      let top = 0;
      while (cur && cur !== nextWaveSection) {
        top += cur.offsetTop || 0;
        cur = cur.offsetParent;
      }
      return {
        el: header,
        top: top,
        height: header.offsetHeight || 60
      };
    });
  }

  function updateAllLayoutMetrics() {
    cachedWinH = window.innerHeight;
    if (nextWaveSection) {
      cachedNextWaveHeight = nextWaveSection.offsetHeight;
    }
    cachedT1Top = track1 ? track1.offsetTop : 0;
    cachedTTransTop = trackTrans ? trackTrans.offsetTop : (track1 ? track1.offsetHeight : 0);
    cachedTransHeight = trackTrans ? trackTrans.offsetHeight : cachedWinH;
    cachedT2Top = track2 ? track2.offsetTop : (cachedTTransTop + cachedTransHeight);
    cachedT2Height = track2 ? track2.offsetHeight : (cachedWinH * 3.8);
    cachedT3Top = track3 ? track3.offsetTop : (cachedT2Top + cachedT2Height);
    cachedT3Height = track3 ? track3.offsetHeight : (cachedWinH * 5.8);
    cachedT3ScrollRange = Math.max(1, cachedT3Height - cachedWinH);
    const scrollEl = document.documentElement || document.body;
    cachedTotalMaxScroll = Math.max(1, (scrollEl ? scrollEl.scrollHeight : 0) - cachedWinH);
    cacheHeaderMetrics();
    cacheFooterMetric();
  }

  // Resize both canvases to fit screen with devicePixelRatio
  function resizeCanvases() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth * dpr;
    const h = window.innerHeight * dpr;

    canvas1.width = w;
    canvas1.height = h;
    canvas2.width = w;
    canvas2.height = h;

    lastDrawnFrame1 = -1;
    lastDrawnFrame2 = -1;
    renderCanvas(ctx1, canvas1, images1, Math.round(currentFrame1), TOTAL_FRAMES_1);
    renderCanvas(ctx2, canvas2, images2, Math.round(currentFrame2), TOTAL_FRAMES_2);
  }

  window.addEventListener('resize', () => {
    resizeCanvases();
    updateAllLayoutMetrics();
  }, { passive: true });

  // Adaptive renderer with device-optimized subject framing & studio yellow backing
  function renderCanvas(ctx, canvas, imageArray, frameIndex, maxFrames) {
    const clamped = Math.max(1, Math.min(maxFrames, frameIndex));
    const targetIdx = clamped - 1;
    let img = imageArray[targetIdx];

    const cw = canvas.width;
    const ch = canvas.height;
    if (cw === 0 || ch === 0) return;

    // Check if exact target frame is ready
    const isTargetReady = img && img.complete && img.naturalWidth > 0;

    if (!isTargetReady) {
      // Find the nearest already-loaded frame so canvas NEVER blanks, freezes, or turns black
      let bestImg = null;
      let minDiff = Infinity;
      for (let i = 0; i < maxFrames; i++) {
        const cand = imageArray[i];
        if (cand && cand.complete && cand.naturalWidth > 0) {
          const diff = Math.abs(i - targetIdx);
          if (diff < minDiff) {
            minDiff = diff;
            bestImg = cand;
          }
        }
      }

      if (bestImg) {
        img = bestImg;
      } else {
        // Fallback fill with studio background color #F5C03E
        ctx.fillStyle = '#F5C03E';
        ctx.fillRect(0, 0, cw, ch);
        return;
      }
    }

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const aspect = cw / ch;

    let scale, nw, nh, nx, ny;

    if (aspect >= 1.25) {
      // Desktop & Landscape Widescreen:
      // Food sits centered in full cover, with spacious yellow background on left and right for stages
      scale = Math.max(cw / iw, ch / ih);
      nw = iw * scale;
      nh = ih * scale;
      nx = (cw - nw) / 2;
      ny = (ch - nh) / 2;
    } else {
      // Portrait / Narrow Screens (Mobile phones, tablets in portrait, split views):
      // Intelligently fit food subject within viewport width & lower 55% of height,
      // ensuring burger and pizza are completely visible, never blown up or cropped,
      // and preserving a clear yellow background zone above for the brand header and text stages.
      const scaleW = (cw * 0.88) / 680;
      const scaleH = (ch * 0.54) / 520;
      scale = Math.min(scaleW, scaleH);
      nw = iw * scale;
      nh = ih * scale;
      nx = (cw - nw) / 2;
      // Position food slightly below center so text stages sit proudly on solid yellow background
      ny = Math.round((ch - nh) / 2 + ch * 0.075);
    }

    // Solid studio background behind image so all letterboxes & edges are pure studio yellow
    ctx.fillStyle = '#F5C03E';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, nx, ny, nw, nh);
  }

  // Text stages animator for Section 1 & Section 2
  function updateStages(stageList, frame) {
    const isMobile = window.innerWidth <= 900;
    const maxOffset = isMobile ? 42 : 70;

    stageList.forEach(stage => {
      if (!stage.el) return;

      let opacity = 0;
      let offsetY = maxOffset; // Below

      if (stage.type === 'initial') {
        if (frame <= stage.exitStart) {
          opacity = 1;
          offsetY = 0;
        } else if (frame < stage.exitEnd) {
          const t = (frame - stage.exitStart) / (stage.exitEnd - stage.exitStart);
          opacity = 1 - t;
          offsetY = -maxOffset * t; // Moves UP on initial scroll
        } else {
          opacity = 0;
          offsetY = -maxOffset;
        }
      } else if (stage.type === 'middle') {
        if (frame < stage.enterStart) {
          opacity = 0;
          offsetY = maxOffset;
        } else if (frame < stage.enterEnd) {
          const t = (frame - stage.enterStart) / (stage.enterEnd - stage.enterStart);
          opacity = t;
          offsetY = maxOffset * (1 - t);
        } else if (frame <= stage.exitStart) {
          opacity = 1;
          offsetY = 0;
        } else if (frame < stage.exitEnd) {
          const t = (frame - stage.exitStart) / (stage.exitEnd - stage.exitStart);
          opacity = 1 - t;
          offsetY = -maxOffset * t;
        } else {
          opacity = 0;
          offsetY = -maxOffset;
        }
      } else if (stage.type === 'final') {
        if (frame < stage.enterStart) {
          opacity = 0;
          offsetY = maxOffset;
        } else if (frame < stage.enterEnd) {
          const t = (frame - stage.enterStart) / (stage.enterEnd - stage.enterStart);
          opacity = t;
          offsetY = maxOffset * (1 - t);
        } else {
          opacity = 1;
          offsetY = 0;
        }
      }

      // If this is stageList 2 and wave section is rising, force fade out all stages
      if (stageList === stages2 && currentWaveProgress > 0) {
        if (currentWaveProgress >= 0.02) {
          opacity = 0;
        } else {
          const waveFade = Math.max(0, 1 - currentWaveProgress * 50);
          opacity = opacity * waveFade;
        }
      }

      stage.el.style.opacity = opacity.toFixed(3);
      stage.el.style.transform = `translateY(calc(-50% + ${offsetY.toFixed(1)}px))`;
      stage.el.style.visibility = opacity <= 0.005 ? 'hidden' : 'visible';
    });
  }

  function wireFrameImage(img, frameIndex, isBurger) {
    img.onload = () => {
      if (isBurger) {
        loadedCount1++;
        if (frameIndex === 1) {
          resizeCanvases();
          updateStages(stages1, 1);
        }
        if (Math.round(currentFrame1) === frameIndex) {
          renderCanvas(ctx1, canvas1, images1, frameIndex, TOTAL_FRAMES_1);
        }
      } else {
        loadedCount2++;
        if (frameIndex === 1) {
          renderCanvas(ctx2, canvas2, images2, 1, TOTAL_FRAMES_2);
        }
        if (Math.round(currentFrame2) === frameIndex) {
          renderCanvas(ctx2, canvas2, images2, frameIndex, TOTAL_FRAMES_2);
        }
      }
      checkLoader();
    };

    img.onerror = () => {
      if (isBurger) loadedCount1++; else loadedCount2++;
      checkLoader();
    };
  }

  // Preload frames for Section 1 (240) and Section 2 (105) using stratified progressive loading
  function preloadAll() {
    // 1. Instantiate all Image objects upfront
    for (let i = 1; i <= TOTAL_FRAMES_1; i++) {
      const img = new Image();
      img.decoding = 'async';
      images1.push(img);
      wireFrameImage(img, i, true);
    }
    for (let i = 1; i <= TOTAL_FRAMES_2; i++) {
      const img = new Image();
      img.decoding = 'async';
      images2.push(img);
      wireFrameImage(img, i, false);
    }

    function requestFrame(isBurger, frameIndex) {
      const arr = isBurger ? images1 : images2;
      const total = isBurger ? TOTAL_FRAMES_1 : TOTAL_FRAMES_2;
      if (frameIndex < 1 || frameIndex > total) return;
      const img = arr[frameIndex - 1];
      if (!img.src) {
        const padded = String(frameIndex).padStart(4, '0');
        const folder = isBurger ? 'frames' : 'frames2';
        img.src = `${folder}/frame_${padded}.jpg`;
      }
    }

    window.__requestFrame = requestFrame;

    // Phase 1: PRIORITY 0 (Instant Boot) - Frame 1 & 2 of both Burger & Pizza
    requestFrame(true, 1);
    requestFrame(false, 1);
    requestFrame(true, 2);
    requestFrame(false, 2);

    // Phase 2: Interleaved Anchor Keyframes (every 6th frame of Burger, every 5th of Pizza)
    const maxSteps = Math.max(Math.ceil(TOTAL_FRAMES_1 / 6), Math.ceil(TOTAL_FRAMES_2 / 5));
    for (let step = 1; step <= maxSteps; step++) {
      const bFrame = step * 6;
      if (bFrame <= TOTAL_FRAMES_1) requestFrame(true, bFrame);
      const pFrame = step * 5;
      if (pFrame <= TOTAL_FRAMES_2) requestFrame(false, pFrame);
    }

    // Phase 3: High-density fill queue: load remaining frames in non-blocking batches
    const remainingQueue = [];
    for (let f = 3; f <= TOTAL_FRAMES_1; f += 2) {
      if (f % 6 !== 0) remainingQueue.push([true, f]);
    }
    for (let f = 3; f <= TOTAL_FRAMES_2; f += 2) {
      if (f % 5 !== 0) remainingQueue.push([false, f]);
    }
    for (let f = 1; f <= TOTAL_FRAMES_1; f++) {
      if (!images1[f - 1].src) remainingQueue.push([true, f]);
    }
    for (let f = 1; f <= TOTAL_FRAMES_2; f++) {
      if (!images2[f - 1].src) remainingQueue.push([false, f]);
    }

    let queueIdx = 0;
    function processBatch() {
      const BATCH_SIZE = 12;
      const end = Math.min(remainingQueue.length, queueIdx + BATCH_SIZE);
      for (; queueIdx < end; queueIdx++) {
        const [isBurger, f] = remainingQueue[queueIdx];
        requestFrame(isBurger, f);
      }
      if (queueIdx < remainingQueue.length) {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(processBatch, { timeout: 100 });
        } else {
          setTimeout(processBatch, 25);
        }
      }
    }

    setTimeout(processBatch, 30);
  }

  let isSiteLoaded = false;
  let isHeroSectionActive = false;
  let heroAnimationTl = null;

  function triggerHeroAnimationsIfAtTop() {
    if (isSiteLoaded) return;
    isSiteLoaded = true;
    const scrollY = window.scrollY || window.pageYOffset;
    if (scrollY <= 40) {
      isHeroSectionActive = true;
      setTimeout(playHeroAnimations, 140);
    }
  }

  // Rotating circular motion logo animation & minimal text animation for "CRAFTED"
  function playHeroAnimations() {
    if (typeof gsap === 'undefined') return;

    const brandHdr = document.getElementById('brand-header');
    const brandIcon = brandHdr ? brandHdr.querySelector('.brand-icon') : null;
    const brandTxt = brandHdr ? brandHdr.querySelector('.brand-text') : null;
    const craftedText = document.getElementById('hero-crafted-text');
    const perfectionText = document.getElementById('hero-perfection-text');

    if (heroAnimationTl) {
      heroAnimationTl.kill();
    }

    heroAnimationTl = gsap.timeline();

    // 1. Reveal brand header container
    if (brandHdr) {
      gsap.set(brandHdr, { visibility: 'visible', opacity: 1 });
    }

    // 2. Circular motion & rotating arrival of logo from left outside of the screen
    if (brandIcon) {
      // Horizontal glide + continuous rotation
      heroAnimationTl.fromTo(brandIcon,
        {
          x: -320,
          rotation: -540,
          opacity: 0,
          scale: 0.82,
          transformOrigin: 'center center'
        },
        {
          x: 0,
          rotation: 0,
          opacity: 1,
          scale: 1,
          duration: 1.35,
          ease: 'power2.out'
        },
        0
      );

      // Arc component in Y creating circular motion
      heroAnimationTl.fromTo(brandIcon,
        { y: 65 },
        {
          keyframes: [
            { y: -32, duration: 0.58, ease: 'sine.out' },
            { y: 10, duration: 0.44, ease: 'sine.inOut' },
            { y: 0, duration: 0.33, ease: 'sine.out' }
          ]
        },
        0
      );
    }

    // Accompanying brand text glides in smoothly
    if (brandTxt) {
      heroAnimationTl.fromTo(brandTxt,
        {
          x: -30,
          opacity: 0,
          filter: 'blur(6px)'
        },
        {
          x: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.95,
          ease: 'power2.out'
        },
        0.38
      );
    }

    // 3. New 3D Kinetic Letter Stagger Animation for "CRAFTED"
    const chars = document.querySelectorAll('#hero-crafted-text .char');
    if (chars && chars.length > 0) {
      heroAnimationTl.fromTo(chars,
        {
          opacity: 0,
          y: 55,
          rotateX: -80,
          scale: 0.65,
          transformOrigin: '50% 100%'
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.85,
          stagger: 0.055,
          ease: 'back.out(1.7)'
        },
        0.2
      );
    } else if (craftedText) {
      heroAnimationTl.fromTo(craftedText,
        { opacity: 0, y: 35, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: 'back.out(1.5)' },
        0.2
      );
    }

    // Flowing cursive accompaniment
    if (perfectionText) {
      heroAnimationTl.fromTo(perfectionText,
        {
          opacity: 0,
          y: 16,
          filter: 'blur(3px)'
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.85,
          ease: 'power2.out'
        },
        0.62
      );
    }
  }

  function checkLoader() {
    if (loadedCount1 >= 1 && loadedCount2 >= 1 && loader && !loader.classList.contains('loaded')) {
      loader.classList.add('loaded');
      triggerHeroAnimationsIfAtTop();
    }
  }

  // Safety fallback: Never keep user stuck behind loader
  setTimeout(() => {
    if (loader && !loader.classList.contains('loaded')) {
      loader.classList.add('loaded');
    }
    triggerHeroAnimationsIfAtTop();
  }, 1200);

  // 5-Part Vertical Slat Transition Updater
  function updateTransition(pTrans) {
    // 5 Slats stagger: each slat duration = 0.52, stagger delay = i * 0.08
    // slat 0 ends at 0.52, slat 4 ends at 4*0.08 + 0.52 = 0.84
    const slatDur = 0.52;
    const staggerStep = 0.08;

    slats.forEach((slat, i) => {
      if (!slat) return;
      const start = i * staggerStep;
      const raw = Math.min(1, Math.max(0, (pTrans - start) / slatDur));
      // Ease out cubic for natural upward momentum
      const eased = 1 - Math.pow(1 - raw, 3);
      const translateY = (1 - eased) * 102;
      slat.style.transform = `translateY(${translateY.toFixed(2)}%)`;
    });

    // Fade brand header and Section 1 final text as slats rise
    if (brandHeader) {
      const headerFade = Math.max(0, 1 - pTrans * 3.2);
      brandHeader.style.opacity = headerFade.toFixed(3);
    }
    const stage5 = stages1[4];
    if (stage5 && stage5.el) {
      if (pTrans > 0) {
        const textFade = Math.max(0, 1 - pTrans * 3.2);
        stage5.el.style.opacity = (parseFloat(stage5.el.style.opacity || '1') * textFade).toFixed(3);
      }
    }

    // Smoothly fade out burger canvas under the rising slats so only solid yellow studio backdrop remains
    if (canvas1) {
      const c1Opacity = pTrans > 0.35 ? Math.max(0, 1 - (pTrans - 0.35) / 0.35) : 1;
      canvas1.style.opacity = c1Opacity.toFixed(3);
    }

    // When 4-5 parts add up (meeting at the top by ~0.84):
    // "and when this adds up the pizza photo will be shown"
    if (pTrans >= 0.84) {
      const revealT = Math.min(1, Math.max(0, (pTrans - 0.84) / 0.16));
      canvas2.style.visibility = 'visible';
      canvas2.style.opacity = revealT.toFixed(3);
      canvas2.style.transform = `scale(${(0.96 + 0.04 * revealT).toFixed(3)})`;

      // Guarantee Section 1 stages are completely hidden so they never overlap Section 2
      stages1.forEach(s => {
        if (s && s.el) {
          s.el.style.opacity = '0';
          s.el.style.visibility = 'hidden';
        }
      });

      // Fade in the initial pizza text stage along with the pizza photo reveal
      if (currentFrame2 <= 6) {
        if (stages2[0] && stages2[0].el) {
          stages2[0].el.style.opacity = revealT.toFixed(3);
          stages2[0].el.style.visibility = revealT > 0.01 ? 'visible' : 'hidden';
          stages2[0].el.style.transform = 'translateY(-50%)';
        }
      }
    } else {
      canvas2.style.opacity = '0';
      canvas2.style.visibility = 'hidden';
      canvas2.style.transform = 'scale(0.96)';

      // Keep all pizza stages hidden while in Section 1 or during the slat transition
      stages2.forEach(s => {
        if (s && s.el) {
          s.el.style.opacity = '0';
          s.el.style.visibility = 'hidden';
          s.el.style.transform = 'translateY(calc(-50% + 70px))';
        }
      });
    }
  }

  // Wave Section Updater (Wavy pattern rises from bottom on scroll, then scrolls editorial showcase)
  function updateWave(pWave) {
    if (!nextWaveSection) return;
    const clamped = Math.min(1, Math.max(0, pWave));
    const winH = cachedWinH || window.innerHeight;
    const fullHeight = cachedNextWaveHeight || nextWaveSection.offsetHeight;
    const maxScrollUp = Math.max(0, fullHeight - winH);
    const riseThreshold = 0.09;

    let translatePx = 0;
    if (clamped <= riseThreshold) {
      const t = clamped / riseThreshold;
      // Smoothstep curve: smooth acceleration and smooth arrival with zero dead stall
      const easedRise = t * t * (3 - 2 * t);
      translatePx = (1 - easedRise) * winH;
    } else {
      const t = (clamped - riseThreshold) / (1 - riseThreshold);
      translatePx = - (t * maxScrollUp);
    }

    nextWaveSection.style.transform = `translate3d(0, ${translatePx}px, 0)`;

    // Hardware-accelerated heading visibility check (Zero forced layout reflows!)
    if (cachedHeaderMetrics.length) {
      for (let i = 0; i < cachedHeaderMetrics.length; i++) {
        const item = cachedHeaderMetrics[i];
        const screenY = item.top + translatePx;
        const inView = screenY < winH * 0.88 && (screenY + item.height) > 40;
        if (inView) {
          if (!item.el.classList.contains('in-view')) {
            item.el.classList.add('in-view');
          }
        } else if (screenY > winH * 1.08 || (screenY + item.height) < -60) {
          if (item.el.classList.contains('in-view')) {
            item.el.classList.remove('in-view');
          }
        }
      }
    }

    // Smooth reveal of the yellow footer section from outside of the screen
    if (cachedFooterMetric) {
      const footerScreenY = cachedFooterMetric.top + translatePx;
      if (footerScreenY < winH * 0.98) {
        if (!cachedFooterMetric.el.classList.contains('footer-revealed')) {
          cachedFooterMetric.el.classList.add('footer-revealed');
        }
      } else if (footerScreenY > winH * 1.15) {
        if (cachedFooterMetric.el.classList.contains('footer-revealed')) {
          cachedFooterMetric.el.classList.remove('footer-revealed');
        }
      }
    }

    // Clean background management: keep viewport-stage permanently as studio yellow (#F5C03E)
    // nextWaveSection (z-index: 55) already provides its own deep emerald gradient background
    const shouldBeEmerald = clamped >= riseThreshold;
    if (shouldBeEmerald !== isWaveBackgroundEmerald) {
      isWaveBackgroundEmerald = shouldBeEmerald;
      if (shouldBeEmerald) {
        if (slatsCurtain) {
          slatsCurtain.style.opacity = '0';
          slatsCurtain.style.visibility = 'hidden';
          slatsCurtain.classList.add('hidden-slats');
        }
        if (canvas1) canvas1.style.visibility = 'hidden';
      } else {
        if (slatsCurtain) {
          slatsCurtain.style.opacity = '1';
          slatsCurtain.style.visibility = 'visible';
          slatsCurtain.classList.remove('hidden-slats');
        }
        if (canvas1) canvas1.style.visibility = 'visible';
      }
    }

    // Fast-path hide of canvases & stages to prevent per-frame DOM churn, with progressive blur on previous section
    if (clamped >= riseThreshold) {
      if (!areStagesHiddenForWave) {
        areStagesHiddenForWave = true;
        stages2.forEach(s => {
          if (s && s.el) {
            s.el.style.opacity = '0';
            s.el.style.visibility = 'hidden';
            s.el.style.filter = 'none';
          }
        });
        stages1.forEach(s => {
          if (s && s.el) {
            s.el.style.opacity = '0';
            s.el.style.visibility = 'hidden';
          }
        });
        if (canvas2) {
          canvas2.style.opacity = '0';
          canvas2.style.visibility = 'hidden';
          canvas2.style.filter = 'none';
        }
      }
    } else if (clamped > 0) {
      areStagesHiddenForWave = false;
      const progress = clamped / riseThreshold;
      const blurPx = progress * 20; // Previous section slowly turns blurry (0px -> 20px)

      if (canvas2 && currentTransProgress >= 0.8) {
        const c2Fade = Math.max(0, 1 - progress * 0.35);
        canvas2.style.opacity = c2Fade.toFixed(3);
        canvas2.style.visibility = 'visible';
        canvas2.style.filter = blurPx > 0.1 ? `blur(${blurPx.toFixed(1)}px)` : 'none';
        canvas2.style.transform = `scale(${(1 + progress * 0.03).toFixed(3)})`;
      }
      // Immediately hide pizza stages when wave begins rising so they NEVER collide with wave headings
      stages2.forEach(s => {
        if (s && s.el) {
          s.el.style.opacity = '0';
          s.el.style.visibility = 'hidden';
          s.el.style.filter = 'none';
        }
      });
    } else {
      areStagesHiddenForWave = false;
      if (canvas2) {
        if (currentTransProgress >= 0.84) {
          canvas2.style.opacity = '1';
          canvas2.style.visibility = 'visible';
          canvas2.style.filter = 'none';
          canvas2.style.transform = 'scale(1)';
        } else {
          canvas2.style.opacity = '0';
          canvas2.style.visibility = 'hidden';
        }
      }
      if (canvas1) {
        canvas1.style.visibility = 'visible';
      }
      // Delegate to updateStages based on currentFrame2 so only the active frame stage is visible
      if (currentTransProgress >= 0.8 || currentFrame2 > 1) {
        updateStages(stages2, currentFrame2);
      }
    }
  }

  // Active scroll window prefetcher: immediately prefetch frames around user cursor
  function prefetchAroundCursor(f1, f2, scrollY) {
    if (!window.__requestFrame) return;
    const r1 = Math.round(f1);
    for (let offset = -4; offset <= 8; offset++) {
      window.__requestFrame(true, r1 + offset);
    }
    if (targetTransProgress > 0.3 || (cachedT2Top > 0 && scrollY >= cachedT2Top - 300)) {
      const r2 = Math.round(f2);
      for (let offset = -4; offset <= 8; offset++) {
        window.__requestFrame(false, r2 + offset);
      }
    }
  }

  // Track scroll position for both sections & the transition (Zero layout queries during scroll)
  function handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset;

    // Update top progress bar
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
      const scrollPercent = Math.min(100, Math.max(0, (scrollY / cachedTotalMaxScroll) * 100));
      progressBar.style.width = `${scrollPercent.toFixed(1)}%`;
    }

    // Hero section visit & return detection (triggers whenever user visits / returns to the hero section)
    if (scrollY <= 40) {
      if (!isHeroSectionActive && isSiteLoaded) {
        isHeroSectionActive = true;
        playHeroAnimations();
      }
    } else if (scrollY > 160) {
      isHeroSectionActive = false;
    }

    // 1. SECTION 1 (Burger Atelier)
    if (cachedTTransTop > 0) {
      const p1 = Math.min(1, Math.max(0, scrollY / cachedTTransTop));
      targetFrame1 = 1 + p1 * (TOTAL_FRAMES_1 - 1);
    }

    // 2. TRANSITION CURTAIN (5 Yellow Slats Rise Vertically)
    if (cachedTransHeight > 0) {
      targetTransProgress = Math.min(1, Math.max(0, (scrollY - cachedTTransTop) / cachedTransHeight));
    }

    // 3. SECTION 2 (Stone-FIRed Pizza Scroll Trigger)
    if (scrollY >= cachedT2Top) {
      const p2 = Math.min(1, Math.max(0, (scrollY - cachedT2Top) / cachedT2Height));
      targetFrame2 = 1 + p2 * (TOTAL_FRAMES_2 - 1);
    } else {
      targetFrame2 = 1;
    }

    // 4. SECTION 3 (Wave Section - Deep Emerald / Midnight Teal Wavy Pattern comes UP)
    if (scrollY >= cachedT3Top) {
      const p3 = Math.min(1, Math.max(0, (scrollY - cachedT3Top) / cachedT3ScrollRange));
      targetWaveProgress = p3;
    } else {
      targetWaveProgress = 0;
    }

    // Proactively prefetch frames in the direction the user is scrolling
    prefetchAroundCursor(targetFrame1, targetFrame2, scrollY);

    // Toggle floating luxury navbar - only show when SOUVENIR DE LA TABLE section fully opens
    const floatingNav = document.getElementById('floating-nav');
    if (floatingNav) {
      if (targetWaveProgress >= 0.09) {
        floatingNav.classList.add('visible');
      } else {
        floatingNav.classList.remove('visible');
      }
    }

    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(tickAnimation);
    }
  }

  // Smooth lerp loop with smart cull of hidden sections and zero redundant canvas draws
  function tickAnimation() {
    let continueTicking = false;
    // Only cull Section 1/2 if wave is fully active AND user is scrolled down in wave section
    const isWaveActive = currentWaveProgress > 0.15 && targetWaveProgress > 0.15;

    // 1. Smooth Section 1 (Burger) & 2. Slats & 3. Pizza - completely skip when wave is active!
    if (!isWaveActive) {
      const diff1 = targetFrame1 - currentFrame1;
      if (Math.abs(diff1) > 0.01) {
        currentFrame1 += diff1 * 0.25;
        const r1 = Math.round(currentFrame1);
        if (r1 !== lastDrawnFrame1) {
          lastDrawnFrame1 = r1;
          renderCanvas(ctx1, canvas1, images1, r1, TOTAL_FRAMES_1);
        }
        updateStages(stages1, currentFrame1);
        continueTicking = true;
      } else if (currentFrame1 !== targetFrame1) {
        currentFrame1 = targetFrame1;
        const r1 = Math.round(currentFrame1);
        if (r1 !== lastDrawnFrame1) {
          lastDrawnFrame1 = r1;
          renderCanvas(ctx1, canvas1, images1, r1, TOTAL_FRAMES_1);
        }
        updateStages(stages1, currentFrame1);
      }

      // 2. Smooth Transition Slats & Pizza Photo Reveal
      const transDiff = targetTransProgress - currentTransProgress;
      if (Math.abs(transDiff) > 0.001) {
        currentTransProgress += transDiff * 0.25;
        updateTransition(currentTransProgress);
        continueTicking = true;
      } else if (currentTransProgress !== targetTransProgress) {
        currentTransProgress = targetTransProgress;
        updateTransition(currentTransProgress);
      }

      // 3. Smooth Section 2 (Pizza deconstruction scroll trigger)
      const diff2 = targetFrame2 - currentFrame2;
      if (Math.abs(diff2) > 0.01) {
        currentFrame2 += diff2 * 0.25;
        const r2 = Math.round(currentFrame2);
        if (r2 !== lastDrawnFrame2) {
          lastDrawnFrame2 = r2;
          renderCanvas(ctx2, canvas2, images2, r2, TOTAL_FRAMES_2);
        }
        if (currentTransProgress >= 0.8 || currentFrame2 > 1) {
          updateStages(stages2, currentFrame2);
        }
        continueTicking = true;
      } else if (currentFrame2 !== targetFrame2) {
        currentFrame2 = targetFrame2;
        const r2 = Math.round(currentFrame2);
        if (r2 !== lastDrawnFrame2) {
          lastDrawnFrame2 = r2;
          renderCanvas(ctx2, canvas2, images2, r2, TOTAL_FRAMES_2);
        }
        if (currentTransProgress >= 0.8 || currentFrame2 > 1) {
          updateStages(stages2, currentFrame2);
        }
      }
    }

    // 4. Smooth Wave Section (Wavy Pattern Rising Up) - responsive & instant 60fps
    const waveDiff = targetWaveProgress - currentWaveProgress;
    const waveThreshold = 0.0001;
    if (Math.abs(waveDiff) > waveThreshold) {
      const waveSpeed = 0.45;
      currentWaveProgress += waveDiff * waveSpeed;
      updateWave(currentWaveProgress);
      continueTicking = true;
    } else if (currentWaveProgress !== targetWaveProgress) {
      currentWaveProgress = targetWaveProgress;
      updateWave(currentWaveProgress);
    }

    if (continueTicking) {
      requestAnimationFrame(tickAnimation);
    } else {
      isTicking = false;
    }
  }

  // Dynamic track3 height adjustment to guarantee full scroll of all new sections
  function adjustTrackHeight() {
    if (nextWaveSection) {
      cachedNextWaveHeight = nextWaveSection.offsetHeight;
      const neededHeight = cachedNextWaveHeight + window.innerHeight * 2.0;
      if (track3 && track3.offsetHeight < neededHeight) {
        track3.style.height = `${Math.ceil(neededHeight)}px`;
      }
    }
    updateAllLayoutMetrics();
  }

  // Initialize persistent floating luxury navigation
  function initNavigation() {
    const navLinkBtns = document.querySelectorAll('.nav-link-btn');
    navLinkBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        const t1Top = track1 ? track1.offsetTop : 0;
        const tTransTop = trackTrans ? trackTrans.offsetTop : (track1 ? track1.offsetHeight : 0);
        const transHeight = trackTrans ? trackTrans.offsetHeight : window.innerHeight;
        const t2Top = track2 ? track2.offsetTop : (tTransTop + transHeight);
        const t2Height = track2 ? track2.offsetHeight : window.innerHeight * 3.8;
        const t3Top = track3 ? track3.offsetTop : (t2Top + t2Height);
        const t3Height = track3 ? track3.offsetHeight : (window.innerHeight * 5.8);

        let targetY = 0;
        if (target === 'track-1') targetY = 0;
        else if (target === 'track-2') targetY = t2Top + 10;
        else if (target === 'track-3-story') targetY = t3Top + t3Height * 0.09;
        else if (target === 'track-3-signatures') targetY = t3Top + t3Height * 0.48;
        else if (target === 'track-3-degustation') targetY = t3Top + t3Height * 0.77;
        else if (target === 'track-3-reserve') targetY = t3Top + t3Height;

        window.scrollTo({ top: targetY, behavior: 'smooth' });
      });
    });

    const navBrand = document.getElementById('nav-brand-link');
    if (navBrand) {
      navBrand.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // Initialize Interactive Reservation Modal
  function initReservationModal() {
    const modal = document.getElementById('reservation-modal');
    const openBtns = [document.getElementById('reserve-btn'), document.getElementById('nav-reserve-btn')];
    const closeBtn = document.getElementById('modal-close-btn');
    const closeConfirmedBtn = document.getElementById('close-confirmed-btn');
    const bookingForm = document.getElementById('booking-form');
    const formView = document.getElementById('modal-form-view');
    const successView = document.getElementById('modal-success-view');

    let selectedGuests = '2';
    let selectedDate = 'Tonight';
    let selectedTime = '20:00';
    let selectedExp = 'degustation';

    function openModal() {
      if (!modal) return;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (formView && successView) {
          formView.classList.remove('hidden-view');
          successView.classList.add('hidden-view');
        }
      }, 400);
    }

    openBtns.forEach(b => {
      if (b) b.addEventListener('click', openModal);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeConfirmedBtn) closeConfirmedBtn.addEventListener('click', closeModal);

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
        closeModal();
      }
    });

    // Guest selector
    const guestBtns = document.querySelectorAll('.guest-btn');
    guestBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        guestBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedGuests = btn.getAttribute('data-guests') || '2';
      });
    });

    // Date selector
    const datePills = document.querySelectorAll('.date-pill');
    datePills.forEach(pill => {
      pill.addEventListener('click', () => {
        datePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedDate = pill.getAttribute('data-date') || 'Tonight';
      });
    });

    // Time selector
    const timePills = document.querySelectorAll('.time-pill');
    timePills.forEach(pill => {
      pill.addEventListener('click', () => {
        timePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedTime = pill.getAttribute('data-time') || '20:00';
      });
    });

    // Experience selector
    const expCards = document.querySelectorAll('.exp-card');
    expCards.forEach(card => {
      card.addEventListener('click', () => {
        expCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          selectedExp = radio.value;
        }
      });
    });

    // Form submission
    if (bookingForm) {
      bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const guestName = document.getElementById('guest-name')?.value || 'Honored Guest';
        const randomRef = 'ART-' + Math.floor(1000 + Math.random() * 9000) + '-PARIS';

        const summaryRef = document.getElementById('summary-ref');
        const summaryParty = document.getElementById('summary-party');
        const summaryExp = document.getElementById('summary-exp');
        const summaryGuest = document.getElementById('summary-guest');

        if (summaryRef) summaryRef.textContent = randomRef;
        if (summaryParty) summaryParty.textContent = `${selectedGuests} Guests · ${selectedDate} at ${selectedTime}`;
        if (summaryExp) summaryExp.textContent = selectedExp === 'degustation' ? "Le Menu Dégustation (7 Courses)" : "À La Carte Atelier Dining";
        if (summaryGuest) summaryGuest.textContent = guestName;

        if (formView && successView) {
          formView.classList.add('hidden-view');
          successView.classList.remove('hidden-view');
        }
      });
    }
  }

  // Initialize GSAP 3D hover tilt and interactive dynamics
  function initGsapFeatures() {
    if (typeof gsap === 'undefined') return;

    // 1. Interactive 3D mouse tilt with cached bounding rect (Zero layout reflow during scroll)
    const foodWrappers = document.querySelectorAll('.food-png-wrapper');
    foodWrappers.forEach((wrapper) => {
      const img = wrapper.querySelector('.food-png-img');
      if (!img) return;

      let rect = null;

      wrapper.addEventListener('mouseenter', () => {
        rect = wrapper.getBoundingClientRect();
      }, { passive: true });

      wrapper.addEventListener('mousemove', (e) => {
        if (!rect) rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const tiltX = (x / (rect.width / 2)) * 10;
        const tiltY = (y / (rect.height / 2)) * 10;

        gsap.to(img, {
          rotationY: tiltX,
          rotationX: -tiltY,
          duration: 0.4,
          ease: "power1.out",
          overwrite: "auto"
        });
      }, { passive: true });

      wrapper.addEventListener('mouseleave', () => {
        rect = null;
        gsap.to(img, {
          rotationY: 0,
          rotationX: 0,
          duration: 0.6,
          ease: "power2.out",
          overwrite: "auto"
        });
      }, { passive: true });
    });

    // 2. Magnetic Hover on Reserve Buttons
    const reserveBtns = [document.getElementById('reserve-btn'), document.getElementById('nav-reserve-btn')];
    reserveBtns.forEach(btn => {
      if (!btn) return;
      let btnRect = null;
      btn.addEventListener('mouseenter', () => {
        btnRect = btn.getBoundingClientRect();
      }, { passive: true });
      btn.addEventListener('mousemove', (e) => {
        if (!btnRect) btnRect = btn.getBoundingClientRect();
        const x = e.clientX - btnRect.left - btnRect.width / 2;
        const y = e.clientY - btnRect.top - btnRect.height / 2;
        gsap.to(btn, {
          x: x * 0.25,
          y: y * 0.25,
          duration: 0.3,
          ease: "power1.out"
        });
      }, { passive: true });
      btn.addEventListener('mouseleave', () => {
        btnRect = null;
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.4)"
        });
      }, { passive: true });
    });

    // 3. Hardware-Accelerated Scroll-Triggered Text Animations across All Non-Hero Sections
    sectionHeaders = [
      document.querySelector('.editorial-lead'),
      document.querySelector('.signature-header'),
      document.querySelector('.degustation-header'),
      document.querySelector('.reservation-content')
    ].filter(Boolean);
    cacheHeaderMetrics();

    const sigSection = document.getElementById('signature-section');
    const sigItems = sigSection ? Array.from(sigSection.querySelectorAll('.signature-item')) : [];
    const allAnimatedTargets = [...sectionHeaders, ...sigItems];

    if ('IntersectionObserver' in window) {
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          } else {
            if (entry.intersectionRatio === 0) {
              entry.target.classList.remove('in-view');
            }
          }
        });
      }, { threshold: [0, 0.12], rootMargin: "80px 0px 40px 0px" });

      allAnimatedTargets.forEach(el => sectionObserver.observe(el));
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', () => {
    adjustTrackHeight();
  }, { passive: true });
  window.addEventListener('load', () => {
    adjustTrackHeight();
  });

  // Watch for all images to ensure track height is pixel-perfect
  document.querySelectorAll('img').forEach(img => {
    if (img.complete) {
      adjustTrackHeight();
    } else {
      img.addEventListener('load', adjustTrackHeight);
    }
  });

  // Start preloading and initialize
  preloadAll();
  resizeCanvases();
  updateStages(stages1, 1);
  updateStages(stages2, 1);
  updateTransition(0);
  updateWave(0);
  adjustTrackHeight();
  initGsapFeatures();
  initNavigation();
  initReservationModal();
  handleScroll();
});

/* ==========================================================================
   ACCORDION GALLERY — vanilla JS + GSAP port of React Bits AccordionGallery
   config: defaultIndex=2, expandRatio=0.52, trigger='hover', 5 panels
   ========================================================================== */
(function initAccordionGallery() {
  const root = document.getElementById('accordion-gallery');
  if (!root || typeof gsap === 'undefined') return;

  const COUNT        = 5;
  const EXPAND_RATIO = 0.52;
  const DURATION     = 0.26;
  const EASE         = 'power2.out';
  const PARALLAX     = 0.35;
  const TILT         = 6;
  const STAGGER      = 0.03;

  const panels   = Array.from(root.querySelectorAll('.ag-panel'));
  const medias   = Array.from(root.querySelectorAll('.ag-panel__media'));
  const overlays = Array.from(root.querySelectorAll('.ag-panel__overlay'));
  const imgs     = Array.from(root.querySelectorAll('.ag-panel__media img'));
  const bars     = Array.from(root.querySelectorAll('.ag-panel__bar'));
  const texts    = Array.from(root.querySelectorAll('.ag-panel__text'));

  let activeIdx  = 2; // defaultIndex
  let mediaSizePx = 420;
  let currentTl  = null;

  const prefersReduced = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  function applyLayout(animate) {
    const grow = COUNT > 1
      ? (EXPAND_RATIO * (COUNT - 1)) / (1 - EXPAND_RATIO)
      : 1;

    if (currentTl) currentTl.kill();
    const dur = (animate && !prefersReduced) ? DURATION : 0;
    const tl  = gsap.timeline();

    panels.forEach((panel, i) => {
      const isActive = i === activeIdx;
      const media    = medias[i];
      const overlay  = overlays[i];
      const img      = imgs[i];
      const bar      = bars[i];
      const text     = texts[i];

      const rot = isActive ? 0 : (i < activeIdx ? TILT : -TILT);
      tl.to(panel, { flexGrow: isActive ? grow : 1, rotateY: rot, duration: dur, ease: EASE }, 0);

      if (media) {
        const drift = Math.max(-1.5, Math.min(1.5, activeIdx - i));
        const shift = drift * PARALLAX * mediaSizePx * 0.06;
        tl.to(media, {
          xPercent: -50,
          yPercent: -50,
          x: isActive ? 0 : shift,
          duration: dur,
          ease: EASE
        }, 0);
      }

      if (img) {
        tl.to(img, {
          scale: isActive ? 1.04 : 1.0,
          duration: dur,
          ease: EASE
        }, 0);
      }

      if (overlay) {
        tl.to(overlay, {
          opacity: isActive ? 0.18 : 0.65,
          duration: dur,
          ease: EASE
        }, 0);
      }

      if (bar && text) {
        if (isActive) {
          tl.to([bar, text], { opacity: 1, x: 0, duration: dur, ease: EASE, stagger: prefersReduced ? 0 : STAGGER }, 0);
        } else {
          tl.to([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease: EASE }, 0);
        }
      }
    });

    // Sync active class for CSS fallback / accessibility
    panels.forEach((p, i) => {
      p.classList.toggle('ag-panel--active', i === activeIdx);
      p.setAttribute('aria-current', i === activeIdx ? 'true' : 'false');
    });

    currentTl = tl;
  }

  function setActive(idx) {
    if (idx === activeIdx) return;
    activeIdx = idx;
    applyLayout(true);
  }

  function measure() {
    const rect  = root.getBoundingClientRect();
    const total = rect.width;
    const usable = Math.max(total - 10 * (COUNT - 1), 120);
    mediaSizePx  = Math.max(140, usable * EXPAND_RATIO * 1.22);
    root.style.setProperty('--ag-media-size', `${mediaSizePx}px`);
    applyLayout(false);
  }

  // Wire hover / focus events
  panels.forEach((panel, i) => {
    panel.addEventListener('mouseenter', () => setActive(i));
    panel.addEventListener('focus',      () => setActive(i));
    panel.addEventListener('click', e => {
      if (i !== activeIdx) { e.preventDefault(); setActive(i); }
    });
    panel.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault(); setActive((i + 1) % COUNT);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault(); setActive((i - 1 + COUNT) % COUNT);
      }
    });
  });

  // Initial measure + ResizeObserver
  measure();
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(measure).observe(root);
  }
})();
