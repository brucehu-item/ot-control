# Local Development Guide for `ot-control-be` Project

## Environment Setup
1. Install Node.js
   - Version requirement: 18+
   - Recommended to use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions

## Running Steps
1. Open terminal
2. Navigate to project directory:
   ```bash
   cd ot-control-be
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
After successful startup, the server will be running at:
```
http://localhost:3000
```

## Testing the Server
You can test if the server is running properly by using the following curl command:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"username": "worker1", "password": "worker123"}'
``` 