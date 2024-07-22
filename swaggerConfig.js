const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0', // Specify the version of OpenAPI
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation for Notice OFfice',
    },
  },
  apis: ['./routes/*.js'], // Path to the files containing API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
