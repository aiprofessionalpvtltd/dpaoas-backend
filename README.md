# Digital Parliamentary Assembly Operations Automation System (DPAOAS) - Backend

## Overview
DPAOAS is a comprehensive backend system designed to automate and streamline parliamentary assembly operations. This system manages legislative processes, member management, document handling, and various administrative functions.

## Core Features

### Legislative Management
- Senate Bill Processing & Tracking
- Legislative Bills Management
- Finance & Money Bills Handling
- Private Member Bills
- Ordinance Management
- Resolution Management
- Motion Tracking
- Question Management
- Law & Acts Documentation

### Member Management
- Parliamentary Members Profile Management
- MNA (Member of National Assembly) Management
- Minister Tenure Tracking
- Parliamentary Years & Terms Management
- Attendance & Seating Plans
- Political Party Affiliations

### Administrative Functions
- Role-Based Access Control (RBAC)
- Employee Management
- Leave Management
- Document Management System
- Branch & Department Organization
- File Diary System
- Inventory Management
- Visitor Pass Management
- Translation Services

### Communication Tools
- SMS Management
- Contact Templates & Lists
- Event Calendar
- Notification System
- Correspondence Tracking

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database ORM**: Sequelize v5.0.0
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Real-time Communication**: Socket.IO
- **File Management**: Multer
- **PDF Processing**: PDFKit, pdf-lib
- **API Security**: CORS enabled
- **Validation**: Express Validator, Joi
- **Monitoring**: Winston Logger

## Prerequisites
- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn package manager

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/DPAOAS-Backend.git
cd DPAOAS-Backend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```

Required environment variables:
```
LOCAL_PORT=3000
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_jwt_secret
```

4. Start the server
```bash
# Development mode
npm run start

# Production mode
npm run build
```

## API Documentation
API documentation is available at `/api-docs` when the server is running. The documentation is generated using Swagger/OpenAPI.

### Main API Endpoints

#### Authentication & User Management
- `/api/auth` - Authentication routes
- `/api/users` - User management
- `/api/roles` - Role management
- `/api/permissions` - Permission management

#### Legislative Processes
- `/api/senate-bill` - Senate bill operations
- `/api/finance-money-bill` - Finance bill management
- `/api/legislativeBills` - Legislative bill handling
- `/api/ordinance` - Ordinance management
- `/api/resolution` - Resolution management
- `/api/motion` - Motion tracking
- `/api/questions` - Question management

#### Member Management
- `/api/members` - Member operations
- `/api/mnas` - MNA management
- `/api/parliamentaryYears` - Parliamentary year tracking
- `/api/tenures` - Tenure management

#### Administrative
- `/api/employee` - Employee management
- `/api/departments` - Department management
- `/api/branches` - Branch management
- `/api/files` - File management
- `/api/inventory` - Inventory tracking

#### Communication
- `/api/sms` - SMS management
- `/api/contactList` - Contact management
- `/api/event-calender` - Event calendar
- `/api/correspondence` - Correspondence tracking

## Socket.IO Integration
The system implements real-time communication using Socket.IO for features like notifications and live updates.

## Project Structure
```
DPAOAS-Backend/
├── routes/          # API route definitions
├── models/          # Sequelize models
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── config/          # Configuration files
├── public/          # Static files
├── uploads/         # File uploads
└── socket.js        # Socket.IO configuration
```

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a Pull Request

## License
This project is licensed under the [MIT License](LICENSE)

## Support
For support, Come to Senate

---
**Note**: This README should be updated as the project evolves. For detailed technical documentation, please refer to the Swagger documentation available at `/api-docs`.