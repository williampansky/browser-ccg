# The shared interface controls.

Every screen that is meant to follow the interface theme builds its buttons, drop-downs, checkboxes and switches from these, not from raw `<button>` / `<select>`, so a theme (`styles/themes/_themes.scss`) and any behaviour change (focus, sounds, a11y) lands everywhere at once. The look lives in `styles/site-styles/_ui-kit.scss`.

Not for the cards, minions or heroes: those have their own look.