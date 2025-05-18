# Nehes Israel Calling App

![Nehes Israel Logo](public/images/logo.png)

A modern, responsive calling application for Nehes Isreal that allows agents to bridge calls via Twilio. This internal tool features a visual keypad interface, call history tracking, dark/light mode, and multilingual support.

## Features

- **Agent Configuration**: Simple field for agents to enter their phone number (no sign-in required)
- **Visual Keypad Interface**: Traditional phone keypad layout for familiar user experience
- **Call Bridging**: Integration with Twilio API to bridge calls to agents' phones
- **Call History**: Track and display call details including duration and status
- **Dark/Light Mode**: Toggle between dark and light themes with dark mode as default
- **Multilingual Support**: Full Hebrew/English localization with RTL support
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Reusable UI components
- **next-themes**: Theme management
- **Lucide React**: Icon library
- **date-fns**: Date formatting utilities

## Getting Started

### Prerequisites

- Node.js 23.x or later
- npm (11.x or later) or yarn 

### Installation

1. Clone the repository (if installing from Github):

```bash
git clone https://github.com/kaimatzu/nehes-israel-calling-app.git
cd nehes-israel-calling-app
```

2. Or, unzip the archive (if installing using the zip archive):

```bash
# Extract the folder first then open your terminal from that location
cd nehes-israel-calling-app
```

3. Run the install command

```bash
npm install
```

4. Deploy the build (or run the dev server for development)

```bash
npm run build
npm run start

# or 

npm run dev
```