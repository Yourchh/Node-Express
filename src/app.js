const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Importar rutas con rutas absolutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const roleRoutes = require('./routes/roles');

const app = express();

// Middleware básico
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido al Sistema de Autenticación',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      roles: '/api/roles'
    }
  });
});

// Manejo de errores 404 - DEBE IR ANTES del manejador de errores general
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});


// Manejador de errores global - DEBE IR AL FINAL
app.use((error, req, res, next) => {
  console.error('Error global:', error);
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ 
      error: 'JSON malformado en el cuerpo de la solicitud' 
    });
  }
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal'
  });
});

module.exports = app;