# React Vite TypeScript Jest Boilerplate

This is a boilerplate project for kickstarting React applications using Vite, TypeScript, and Jest for testing. It's configured with essential tools and settings to help you quickly start building React apps with modern tooling.

## Features

- **Vite:** A blazing fast build tool that provides near-instantaneous hot module replacement (HMR) and lightning-fast dev server.
- **React:** A JavaScript library for building user interfaces.
- **TypeScript:** A superset of JavaScript that adds static typing and other features to the language.
- **Jest:** A delightful JavaScript testing framework with a focus on simplicity.
- **Pre-configured Setup:** All necessary configurations are already set up, allowing you to focus on writing code instead of spending time configuring the project.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
   parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
   },
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/your-username/react-vite-ts-jest-boilerplate.git
   ```

2. Navigate into the project directory:

   ```bash
   cd react-vite-ts-jest-boilerplate
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

### Development

To start the development server, run:

```bash
npm run dev
```

This will start the Vite development server. You can now access your React application at `http://localhost:3000`.

### Testing

To run tests, use:

```bash
npm test
```

This will run all the test suites using Jest.

### Building

To build your application for production, run:

```bash
npm run build
```

This will generate an optimized build of your application in the `dist` directory.

## Folder Structure

```
react-vite-ts-jest-boilerplate/
├── src/                 
│   ├── features/ui/  
│   │   ├── footer.tsx
│   │   ├── haeder.tsx    
│   │   └── idnex.ts
│   ├── pages/           
│   │   ├── home.tsx
│   │   ├── page-data.tsx
│   │   └── router.tsx
│   └── App.tsx          
├── .eslintrc.cjs           
├── .gitignore           
├── index.html       
├── LICENSE         
├── package.json         
├── README.md            
├── tsconfig.json        
├── tsconfig.node.json        
└── vite.config.ts       
```

## Contributing

Contributions are welcome! Feel free to submit pull requests or open issues for any bugs or feature requests.

## License

This project is licensed under the [MIT License](LICENSE).
