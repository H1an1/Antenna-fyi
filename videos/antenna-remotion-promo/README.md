# Antenna Remotion Promo

Remotion version of the Antenna promo film.

The composition combines:

- A real capture of the live homepage.
- Remotion-built login and verification beats matching the current app.
- The real dashboard flip recording with the Antenna profile and Hermes back.
- Eleven profile videos fanning into the Antenna wordmark.

Storyboard:

1. Enter the live homepage at `http://localhost:3001/`.
2. Click `Get started` and move to `http://localhost:3001/login`.
3. Type `hellp@antenna.fyi`.
4. Show the verification-code step, type `123456`, then move into the dashboard journey.
5. Use the promo dashboard profile for Antenna.
6. Flip the real profile card to its back.
7. Lift the back profile card while the dashboard fades.
8. Bring ten more profile videos from below and fan all eleven cards open.
9. Flash into the Antenna wordmark.

Commands:

```bash
npm install
npm run prepare-assets
npm run studio
npm run render
```

`npm run capture` is available for refreshing browser captures, but the checked
composition only depends on `public/captures/homepage.jpg` and
`public/captures/dashboard-interaction.mp4`.
