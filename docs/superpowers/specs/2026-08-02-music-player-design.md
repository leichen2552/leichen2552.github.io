# Music Player Repair Design

## Goal

Repair the fixed music player without slowing down article reading, and replace the two legacy tracks with five quiet instrumental tracks whose official pages identify them as CC BY 4.0.

## Selected music

- Scott Buckley — Growing Up
- Scott Buckley — Hymn
- Scott Buckley — Elementary
- Scott Buckley — Felicity
- Scott Buckley — Snowfall

The audio files will come from Wikimedia Commons copies whose file pages identify Scott Buckley as the author and reference the original Scott Buckley source. Each selected track also has an official Scott Buckley page confirming CC BY 4.0. The site footer will link to the artist, the official track pages, Wikimedia Commons, and the CC BY 4.0 license using the attribution format requested by the artist.

## Architecture and performance

- Keep a fixed control in the lower-left corner, but render only a small accessible music button during the initial page load.
- Do not include APlayer JavaScript or CSS in the initial document head.
- On the first click of the music button, load the vendored APlayer JavaScript and CSS from the site itself, then replace the button with the existing fixed APlayer interface.
- Initialize APlayer with `autoplay: false` and `preload: "none"`. Loading the page or opening the player must not download an MP3; audio begins loading only after the visitor presses play.
- Store the five Commons audio files under `media/audio/`. The existing build already copies the complete `media/` directory, so no new asset pipeline is needed.
- Remove the two legacy root-level MP3 files and remove their special cases from the build script.
- Use no album-cover image so the player creates no additional image request.

This approach adds only a small inline button and loader to the initial HTML. The player library, its styles, and all audio remain outside the critical rendering path.

## Configuration and rendering

`site.config.json` remains the source of truth for track metadata. Each entry will contain a title, Scott Buckley as author, a local `/media/audio/` URL, the official track page, and the Commons file page. The footer template will safely serialize this data for the lazy initializer and render a compact attribution block.

If the player resources fail to load, the button will display a short failure message and the article remains fully usable. Existing unrelated theme JavaScript errors are outside this change unless they prevent the lazy player from operating.

## Verification

- Extend `scripts/check-site.mjs` to require five non-empty track records, local audio files, official and mirror sources, copied build artifacts, lazy APlayer loading, `preload: "none"`, disabled autoplay, and visible attribution.
- Confirm generated HTML has no APlayer stylesheet or script in the initial `<head>` and contains no references to the two removed legacy songs.
- Run `npm run build` and `npm run check`.
- Serve the generated site locally and verify the article remains readable before interaction, the lower-left button expands the player, no MP3 request occurs before play, and every track can start successfully.
- After deployment, repeat the player and network checks on `https://c3ll.top`.

## Alternatives considered

- One local track would reduce repository and deployment size, but provides less variety and does not materially improve visitor page load because audio is already deferred.
- Remote audio URLs would keep the repository smaller, but introduce third-party availability and cross-origin risks.

The selected five-track, local, interaction-loaded design gives the best balance of copyright clarity, playback reliability, and reading performance.
