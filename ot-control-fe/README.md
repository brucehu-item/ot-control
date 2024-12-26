# Local Development Guide for `ot-control-bruce` Project

## Environment Setup
1. Install Node.js
   - Version requirement: 18+
   - Recommended to use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions

## Running Steps
1. Open terminal
2. Navigate to project directory:
   ```bash
   cd ot-control-bruce
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## Accessing the Project
After successful startup, you will see the following output:
```bash
VITE v4.5.5  ready in 573 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

Now you can visit http://localhost:5173/ in your browser to view the project.

After successful build, use the username and password from mock_data/users.json file to log in
