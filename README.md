# Monday CRM

A modern CRM application built with React, TypeScript, and Tailwind CSS.

## Features

- **Deal Management**: Track and manage deals with comprehensive details
- **Advanced Tables**: Sortable, filterable, and resizable data tables
- **Context Menus**: Right-click actions for columns and rows
- **Calendar Integration**: Date picker for close dates
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live data updates and state management

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd monday-crm
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8081`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Hooks, Local Storage
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Drag & Drop**: @dnd-kit

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── data/               # Mock data and configurations
├── lib/                # Utility functions
└── main.tsx           # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
