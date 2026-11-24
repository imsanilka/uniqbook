 # UniQbook

UniQbook is a mobile student support app developed for the SE303.3 Mobile Application Development coursework. It gives university students one place to ask questions, report problems, track responses, and find university and club information.

## Project status

Student navigation and Firebase email registration, sign-in, sign-out, and session restoration are implemented. Request tracking, staff replies, routing, notifications, clubs and events, and admin tools are in development.

## Tech stack

React Native, Expo, TypeScript, Expo Router, and Firebase Authentication. Cloud Firestore and Firebase Cloud Functions are planned for the shared data and request workflows.

## Run locally

```bash
git clone https://github.com/imsanilka/uniqbook.git
cd uniqbook
npm ci
```

1. Copy `.env.example` to `.env.local` if it does not already exist.
2. Ask the team lead for the shared Firebase web app configuration and fill in the matching variables. Keep `.env.local` out of Git.
3. Run `npx expo start` and scan the QR code with Expo Go. If the phone cannot connect, try `npx expo start --tunnel`.

## Development checks

```bash
npm run lint
npx tsc --noEmit
```

## Contributing

Read the [project architecture](docs/ARCHITECTURE.md) and [repository instructions](AGENTS.md). Work on your assigned GitHub issue from your feature branch. Open a pull request into `main` with a summary, test steps, and `Closes #` followed by your issue number.
