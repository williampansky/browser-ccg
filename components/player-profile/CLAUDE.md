# Player profile (loaded when working in components/player-profile)

Moved out of the root `CLAUDE.md` so it only loads when this folder is in play.
The root `CLAUDE.md` still holds the rules that apply everywhere.

## Player profile (name + colour theme)

- `components/player-profile/` (`profile.ts`, `ProfileEditor.tsx`): a display name (up to 20 characters, cleaned by `cleanName`) and a colour theme
  (`THEMES`), edited on the `/profile` page (`ProfilePage.tsx`; the `/play` menu only shows it and links there) and saved in this browser's localStorage (`ccg.profile.v1`). Everything reads it through
  `normalizeProfile`; `loadProfile` / `saveProfile` are the only storage calls, so accounts later replace those two and nothing else.
- Player 1 shows the profile name on the hero bar, the turn banner and the log (the stored log keeps `**Player 1**` and the name is applied when it is drawn,
  so a rename also changes old lines). The theme colours your side (hero bar, log name); the other seat is red, or blue if you chose red.
  In hot-seat the second player is still "Player 2". The theme is a side colour, not a site-wide skin.
