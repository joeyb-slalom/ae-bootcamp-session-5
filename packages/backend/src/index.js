const app = require('./app');

const PORT = process.env.PORT || 3001;

// INTENTIONAL ISSUE: Missing error handling for server startup
app.listen(PORT, () => {
  // Server startup - using console for development server
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
