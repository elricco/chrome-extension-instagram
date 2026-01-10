/**
 * Instagram Reels Controls - Popup Script
 * Handles settings UI and storage
 */

(function () {
  'use strict';

  const STORAGE_KEYS = {
    SEEK_STEP: 'reelsSeekStep',
    VOLUME_STEP: 'reelsVolumeStep',
    AUTO_UNMUTE: 'reelsAutoUnmute'
  };

  const DEFAULTS = {
    SEEK_STEP: 5,
    VOLUME_STEP: 0.1,
    AUTO_UNMUTE: true
  };

  // DOM Elements
  const seekStepSelect = document.getElementById('seek-step');
  const volumeStepSelect = document.getElementById('volume-step');
  const autoUnmuteCheckbox = document.getElementById('auto-unmute');
  const saveStatus = document.getElementById('save-status');

  // Load saved settings
  async function loadSettings() {
    try {
      const result = await chrome.storage.local.get([
        STORAGE_KEYS.SEEK_STEP,
        STORAGE_KEYS.VOLUME_STEP,
        STORAGE_KEYS.AUTO_UNMUTE
      ]);

      // Set seek step
      const seekStep = result[STORAGE_KEYS.SEEK_STEP] ?? DEFAULTS.SEEK_STEP;
      seekStepSelect.value = seekStep.toString();

      // Set volume step
      const volumeStep = result[STORAGE_KEYS.VOLUME_STEP] ?? DEFAULTS.VOLUME_STEP;
      volumeStepSelect.value = volumeStep.toString();

      // Set auto-unmute (default is true)
      const autoUnmute = result[STORAGE_KEYS.AUTO_UNMUTE] ?? DEFAULTS.AUTO_UNMUTE;
      autoUnmuteCheckbox.checked = autoUnmute;

    } catch (e) {
      console.error('Error loading settings:', e);
    }
  }

  // Save setting
  async function saveSetting(key, value) {
    try {
      await chrome.storage.local.set({ [key]: value });
      showSaveStatus();
    } catch (e) {
      console.error('Error saving setting:', e);
    }
  }

  // Show "Saved" status briefly
  function showSaveStatus() {
    saveStatus.textContent = '✓ Gespeichert';
    saveStatus.classList.add('visible');

    setTimeout(() => {
      saveStatus.classList.remove('visible');
    }, 1500);
  }

  // Event listeners
  seekStepSelect.addEventListener('change', (e) => {
    const value = parseFloat(e.target.value);
    saveSetting(STORAGE_KEYS.SEEK_STEP, value);
  });

  volumeStepSelect.addEventListener('change', (e) => {
    const value = parseFloat(e.target.value);
    saveSetting(STORAGE_KEYS.VOLUME_STEP, value);
  });

  autoUnmuteCheckbox.addEventListener('change', (e) => {
    saveSetting(STORAGE_KEYS.AUTO_UNMUTE, e.target.checked);
  });

  // Initialize
  loadSettings();
})();
