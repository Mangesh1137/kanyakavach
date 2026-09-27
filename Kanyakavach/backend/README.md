# Kanyakavach API

This Express API stores accounts, emergency contacts, SOS events, and safety trips in MySQL. The mobile app talks to this API; it never connects to MySQL directly.

## Local setup

1. In MySQL Workbench, open and run `schema.sql`.
2. Copy `.env.example` to `.env`. Set your MySQL password and replace `JWT_SECRET` with a long random secret (at least 32 characters). Keep `.env` private.
3. From this `backend` folder, run `npm install`, then `npm start`.
4. Check `http://localhost:3000/health`; it should return `{"ok":true,"database":"connected"}`.
5. In the Expo app root, create `.env` with `EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:3000`. Use the computer's Wi-Fi IPv4 address, not `localhost`, so a phone can reach it. Allow Node.js on the private network in Windows Firewall.
6. Restart Expo with `npx expo start -c`. Keep the API and Expo terminal running. The phone and computer must be on the same Wi-Fi.

For other people to use the app outside your Wi-Fi, deploy the API and MySQL to internet-accessible hosting, use HTTPS, and set `EXPO_PUBLIC_API_URL` to the deployed API URL before building the app. Do not expose the MySQL port publicly.

Passwords are hashed by the API. Access tokens expire after 7 days. SOS location coordinates are stored when an SOS event is recorded. The existing SMS flow still opens the user's SMS app; this API does not send SMS itself.
