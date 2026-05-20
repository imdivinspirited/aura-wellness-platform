/**
 * Additive AOL script removed from the app shell (was causing freezes / blocking UI).
 * Stub only — keeps `window.AOLFeatures` defined if anything still expects it.
 */
window.AOLFeatures = {
  config: { enabled: false },
  reinit: function () {},
};
