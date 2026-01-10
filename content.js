/**
 * Instagram Reels Controls - Content Script
 * Adds video scrubbing, volume control, and keyboard shortcuts to Instagram Reels
 */

(function () {
  'use strict';

  // Browser compatibility: Firefox uses 'browser', Chrome uses 'chrome'
  const browserAPI = (typeof browser !== 'undefined') ? browser : chrome;

  // ============================================
  // CONFIGURATION
  // ============================================
  const CONFIG = {
    SEEK_STEP: 5,           // Seconds to skip with arrow keys (default, loaded from storage)
    VOLUME_STEP: 0.1,       // Volume change per key press (default, loaded from storage)
    DEFAULT_VOLUME: 0.5,    // Default volume (50%)
    AUTO_UNMUTE: true,        // Auto-unmute videos on play (default, loaded from storage)
    STORAGE_KEYS: {
      VOLUME: 'reelsVolume',
      SEEK_STEP: 'reelsSeekStep',
      VOLUME_STEP: 'reelsVolumeStep',
      AUTO_UNMUTE: 'reelsAutoUnmute'
    },
    DATA_ATTR: 'data-reels-enhanced',
    CONTROLS_CLASS: 'reels-controls',
    DEBUG: true             // Set to false in production
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  function log(...args) {
    if (CONFIG.DEBUG) {
      console.log('[Reels Controls]', ...args);
    }
  }

  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // ============================================
  // SVG ICONS
  // ============================================
  const ICONS = {
    volumeHigh: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>`,
    volumeLow: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>`,
    volumeMuted: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    </svg>`
  };

  // ============================================
  // STORAGE FUNCTIONS
  // ============================================
  let currentVolume = CONFIG.DEFAULT_VOLUME;

  async function loadSettings() {
    try {
      const result = await browserAPI.storage.local.get([
        CONFIG.STORAGE_KEYS.VOLUME,
        CONFIG.STORAGE_KEYS.SEEK_STEP,
        CONFIG.STORAGE_KEYS.VOLUME_STEP,
        CONFIG.STORAGE_KEYS.AUTO_UNMUTE
      ]);

      // Load volume
      if (result[CONFIG.STORAGE_KEYS.VOLUME] !== undefined) {
        currentVolume = result[CONFIG.STORAGE_KEYS.VOLUME];
        log('Loaded volume:', currentVolume);
      }

      // Load seek step
      if (result[CONFIG.STORAGE_KEYS.SEEK_STEP] !== undefined) {
        CONFIG.SEEK_STEP = result[CONFIG.STORAGE_KEYS.SEEK_STEP];
        log('Loaded seek step:', CONFIG.SEEK_STEP);
      }

      // Load volume step
      if (result[CONFIG.STORAGE_KEYS.VOLUME_STEP] !== undefined) {
        CONFIG.VOLUME_STEP = result[CONFIG.STORAGE_KEYS.VOLUME_STEP];
        log('Loaded volume step:', CONFIG.VOLUME_STEP);
      }

      // Load auto-unmute setting (default is true)
      if (result[CONFIG.STORAGE_KEYS.AUTO_UNMUTE] !== undefined) {
        CONFIG.AUTO_UNMUTE = result[CONFIG.STORAGE_KEYS.AUTO_UNMUTE];
        log('Loaded auto-unmute:', CONFIG.AUTO_UNMUTE);
      }
    } catch (e) {
      log('Error loading settings:', e);
    }
    return currentVolume;
  }

  async function saveVolume(volume) {
    try {
      currentVolume = volume;
      await browserAPI.storage.local.set({ [CONFIG.STORAGE_KEYS.VOLUME]: volume });
      log('Saved volume:', volume);
    } catch (e) {
      log('Error saving volume:', e);
    }
  }

  // Listen for storage changes (when user changes settings in popup)
  function setupStorageListener() {
    browserAPI.storage.onChanged.addListener((changes, areaName) => {
      log('Storage changed:', areaName, changes);

      if (areaName !== 'local') return;

      if (changes[CONFIG.STORAGE_KEYS.SEEK_STEP]) {
        CONFIG.SEEK_STEP = changes[CONFIG.STORAGE_KEYS.SEEK_STEP].newValue;
        log('Seek step updated to:', CONFIG.SEEK_STEP);
      }

      if (changes[CONFIG.STORAGE_KEYS.VOLUME_STEP]) {
        CONFIG.VOLUME_STEP = changes[CONFIG.STORAGE_KEYS.VOLUME_STEP].newValue;
        log('Volume step updated to:', CONFIG.VOLUME_STEP);
      }

      if (changes[CONFIG.STORAGE_KEYS.AUTO_UNMUTE]) {
        CONFIG.AUTO_UNMUTE = changes[CONFIG.STORAGE_KEYS.AUTO_UNMUTE].newValue;
        log('Auto-unmute updated to:', CONFIG.AUTO_UNMUTE);
      }
    });

    log('Storage listener registered');
  }

  // ============================================
  // CONTROLS UI
  // ============================================
  function createControls(video) {
    const container = document.createElement('div');
    container.className = CONFIG.CONTROLS_CLASS;

    // Progress/Scrubber section
    const progressSection = document.createElement('div');
    progressSection.className = 'reels-progress-section';

    const timeDisplay = document.createElement('span');
    timeDisplay.className = 'reels-time';
    timeDisplay.textContent = '0:00 / 0:00';

    const progressBar = document.createElement('input');
    progressBar.type = 'range';
    progressBar.className = 'reels-progress';
    progressBar.min = 0;
    progressBar.max = 100;
    progressBar.value = 0;
    progressBar.step = 0.1;

    progressSection.appendChild(progressBar);
    progressSection.appendChild(timeDisplay);

    // Volume section - vertical slider above button
    const volumeSection = document.createElement('div');
    volumeSection.className = 'reels-volume-section';

    // Slider container (appears on hover)
    const volumeSliderContainer = document.createElement('div');
    volumeSliderContainer.className = 'reels-volume-slider-container';

    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.className = 'reels-volume';
    volumeSlider.min = 0;
    volumeSlider.max = 100;
    volumeSlider.value = currentVolume * 100;
    volumeSlider.step = 1;

    volumeSliderContainer.appendChild(volumeSlider);

    // Volume button
    const volumeBtn = document.createElement('button');
    volumeBtn.className = 'reels-volume-btn';
    volumeBtn.innerHTML = ICONS.volumeHigh;
    volumeBtn.title = 'Mute/Unmute (M)';

    volumeSection.appendChild(volumeSliderContainer);
    volumeSection.appendChild(volumeBtn);

    // Assemble container
    container.appendChild(progressSection);
    container.appendChild(volumeSection);

    return {
      container,
      progressBar,
      timeDisplay,
      volumeBtn,
      volumeSlider
    };
  }

  function updateVolumeIcon(btn, volume, muted) {
    if (muted || volume === 0) {
      btn.innerHTML = ICONS.volumeMuted;
    } else if (volume < 0.5) {
      btn.innerHTML = ICONS.volumeLow;
    } else {
      btn.innerHTML = ICONS.volumeHigh;
    }
  }

  // ============================================
  // VIDEO ENHANCEMENT
  // ============================================
  function enhanceVideo(video) {
    // Skip if already enhanced
    if (video.hasAttribute(CONFIG.DATA_ATTR)) {
      return;
    }
    video.setAttribute(CONFIG.DATA_ATTR, 'true');
    log('Enhancing video:', video);

    // Find the video container (parent element)
    const videoContainer = video.closest('div') || video.parentElement;
    if (!videoContainer) {
      log('Could not find video container');
      return;
    }

    // Ensure container has relative positioning for absolute children
    const containerStyle = window.getComputedStyle(videoContainer);
    if (containerStyle.position === 'static') {
      videoContainer.style.position = 'relative';
    }

    // Create and inject controls
    const controls = createControls(video);
    videoContainer.appendChild(controls.container);

    // Apply saved volume (use default 50% if not set)
    const volumeToApply = currentVolume > 0 ? currentVolume : CONFIG.DEFAULT_VOLUME;
    video.volume = volumeToApply;

    // Auto-unmute on play event (more robust than setting immediately)
    if (CONFIG.AUTO_UNMUTE) {
      const handlePlay = () => {
        if (CONFIG.AUTO_UNMUTE && video.muted) {
          video.muted = false;
          video.volume = volumeToApply;
          updateVolumeIcon(controls.volumeBtn, video.volume, false);
          log('Auto-unmuted on play, volume:', video.volume);
        }
      };

      // Listen for play events
      video.addEventListener('play', handlePlay);

      // Also try immediately if video is already playing
      if (!video.paused) {
        handlePlay();
      }
    }

    updateVolumeIcon(controls.volumeBtn, volumeToApply, video.muted);

    // ----------------------------------------
    // PROGRESS BAR / SCRUBBING
    // ----------------------------------------
    let isScrubbing = false;

    controls.progressBar.addEventListener('mousedown', (e) => {
      isScrubbing = true;
      e.stopPropagation();
    });

    controls.progressBar.addEventListener('mouseup', (e) => {
      isScrubbing = false;
      e.stopPropagation();
    });

    controls.progressBar.addEventListener('input', (e) => {
      e.stopPropagation();
      if (video.duration) {
        const seekTime = (e.target.value / 100) * video.duration;
        video.currentTime = seekTime;
      }
    });

    // Prevent click events from bubbling to Instagram
    controls.progressBar.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Update progress bar and time display
    video.addEventListener('timeupdate', () => {
      if (!isScrubbing && video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        controls.progressBar.value = progress;
        controls.timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
      }
    });

    // Handle metadata loaded
    video.addEventListener('loadedmetadata', () => {
      log('Video metadata loaded, duration:', video.duration);
      controls.timeDisplay.textContent = `0:00 / ${formatTime(video.duration)}`;
    });

    // If metadata already loaded
    if (video.duration) {
      controls.timeDisplay.textContent = `0:00 / ${formatTime(video.duration)}`;
    }

    // ----------------------------------------
    // VOLUME CONTROL
    // ----------------------------------------
    controls.volumeSlider.addEventListener('input', (e) => {
      e.stopPropagation();
      const volume = e.target.value / 100;
      video.volume = volume;
      video.muted = volume === 0;
      updateVolumeIcon(controls.volumeBtn, volume, video.muted);
      saveVolume(volume);
    });

    controls.volumeSlider.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    controls.volumeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      updateVolumeIcon(controls.volumeBtn, video.volume, video.muted);
      controls.volumeSlider.value = video.muted ? 0 : video.volume * 100;
    });

    // Sync with external volume changes
    video.addEventListener('volumechange', () => {
      controls.volumeSlider.value = video.muted ? 0 : video.volume * 100;
      updateVolumeIcon(controls.volumeBtn, video.volume, video.muted);
    });

    // Prevent container clicks from affecting Instagram
    controls.container.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    log('Video enhanced successfully');
  }

  // ============================================
  // VIDEO DETECTION
  // ============================================
  function findAndEnhanceVideos() {
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      if (!video.hasAttribute(CONFIG.DATA_ATTR)) {
        // Wait for metadata if not ready
        if (video.readyState >= 1) {
          enhanceVideo(video);
        } else {
          video.addEventListener('loadedmetadata', () => enhanceVideo(video), { once: true });
        }
      }
    });
  }

  // MutationObserver for dynamically loaded videos
  function setupObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;

      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeName === 'VIDEO') {
              shouldCheck = true;
              break;
            }
            if (node.querySelectorAll) {
              const videos = node.querySelectorAll('video');
              if (videos.length > 0) {
                shouldCheck = true;
                break;
              }
            }
          }
        }
        if (shouldCheck) break;
      }

      if (shouldCheck) {
        // Small delay to ensure DOM is ready
        setTimeout(findAndEnhanceVideos, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    log('MutationObserver setup complete');
    return observer;
  }

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================
  function getActiveVideo() {
    // Find the most visible/relevant video
    const videos = document.querySelectorAll(`video[${CONFIG.DATA_ATTR}]`);

    for (const video of videos) {
      const rect = video.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (isVisible && !video.paused) {
        return video;
      }
    }

    // Fallback: return first enhanced video
    return videos[0] || null;
  }

  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ignore if typing in input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      const video = getActiveVideo();
      if (!video) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - CONFIG.SEEK_STEP);
          log('Seek backward:', video.currentTime);
          break;

        case 'ArrowRight':
          e.preventDefault();
          video.currentTime = Math.min(video.duration || 0, video.currentTime + CONFIG.SEEK_STEP);
          log('Seek forward:', video.currentTime);
          break;

        case 'ArrowUp':
          e.preventDefault();
          video.volume = Math.min(1, video.volume + CONFIG.VOLUME_STEP);
          video.muted = false;
          saveVolume(video.volume);
          log('Volume up:', video.volume);
          break;

        case 'ArrowDown':
          e.preventDefault();
          video.volume = Math.max(0, video.volume - CONFIG.VOLUME_STEP);
          if (video.volume === 0) video.muted = true;
          saveVolume(video.volume);
          log('Volume down:', video.volume);
          break;

        case 'm':
        case 'M':
          e.preventDefault();
          video.muted = !video.muted;
          log('Mute toggled:', video.muted);
          break;

        case 'p':
        case 'P':
          e.preventDefault();
          if (video.paused) {
            video.play();
            log('Video playing');
          } else {
            video.pause();
            log('Video paused');
          }
          break;
      }
    });

    log('Keyboard shortcuts setup complete');
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  async function init() {
    log('Initializing Instagram Reels Controls...');

    // Setup storage listener FIRST (to catch any changes)
    setupStorageListener();

    // Load saved settings (volume, seek step, volume step)
    await loadSettings();

    // Find and enhance existing videos
    findAndEnhanceVideos();

    // Setup observer for new videos
    setupObserver();

    // Setup keyboard shortcuts
    setupKeyboardShortcuts();

    log('Initialization complete');
    log('Current settings - Seek:', CONFIG.SEEK_STEP, 'Volume step:', CONFIG.VOLUME_STEP);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
