import express from 'express';

const app = express();

// JSON middleware
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Hello from TypeScript on Cloud Run!');
});

// Simple API endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

export default app;
