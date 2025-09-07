// server.js - Standalone server for development and manual testing
import app, { resetData } from './src/provider.js';

const PORT = process.env.PORT || 3000;

// Reset to initial state
resetData();

// Start the server
app.listen(PORT, () => {
    console.log(` Items API Server running on http://localhost:${PORT}`);
    console.log(` Available endpoints:`);
    console.log(`   GET    http://localhost:${PORT}/items`);
    console.log(`   GET    http://localhost:${PORT}/items/:id`);
    console.log(`   POST   http://localhost:${PORT}/items`);
    console.log(`   PUT    http://localhost:${PORT}/items/:id`);
    console.log(`   PATCH  http://localhost:${PORT}/items/:id`);
    console.log(`   DELETE http://localhost:${PORT}/items/:id`);
    console.log(`\n Try: curl http://localhost:${PORT}/items`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n Shutting down server...');
    process.exit(0);
});
