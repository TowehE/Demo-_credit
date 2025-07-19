# Lendsqr Wallet Service - MVP

## Overview
A robust wallet service API built with Node.js, TypeScript, and MySQL that provides core financial operations including account creation, funding, transfers, and withdrawals with integrated blacklist verification.

## Architecture & Design Decisions

### 1. **Clean Architecture Pattern**
- **Controllers**: Handle HTTP requests/responses and validation
- **Services**: Business logic implementation
- **Repositories**: Data access layer with KnexJS
- **Models**: TypeScript interfaces for type safety
- **Middleware**: Authentication, validation, and error handling

### 2. **Database Design**
```sql
-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_blacklisted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Wallets table
CREATE TABLE wallets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'NGN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Transactions table
CREATE TABLE transactions (
    id VARCHAR(36) PRIMARY KEY,
    reference VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    wallet_id VARCHAR(36) NOT NULL,
    type ENUM('CREDIT', 'DEBIT') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    status ENUM('PENDING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (wallet_id) REFERENCES wallets(id)
);
```

### 3. **Key Features**
- **Account Creation**: User registration with Karma blacklist verification
- **Wallet Funding**: Credit operations with transaction logging
- **P2P Transfers**: Secure fund transfers between users
- **Withdrawals**: Debit operations with balance validation
- **Transaction History**: Complete audit trail
- **Blacklist Integration**: Lendsqr Adjutor Karma API integration

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login (faux token generation)

### User Management
- `POST /api/users/register` - Create new user account
- `GET /api/users/profile` - Get user profile

### Wallet Operations
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/fund` - Fund wallet
- `POST /api/wallet/transfer` - Transfer funds to another user
- `POST /api/wallet/withdraw` - Withdraw funds
- `GET /api/wallet/transactions` - Get transaction history

## Technical Implementation

### 1. **Error Handling Strategy**
```typescript
class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;
    
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}
```

### 2. **Transaction Management**
- Database transactions for all financial operations
- Optimistic locking for concurrent balance updates
- Idempotency keys for duplicate request prevention

### 3. **Security Measures**
- Input validation with Joi
- SQL injection prevention with parameterized queries
- Rate limiting for API endpoints
- Secure token-based authentication

### 4. **Testing Strategy**
- Unit tests for all service methods
- Integration tests for API endpoints
- Database transaction testing
- Mock external API calls (Karma blacklist)

## Environment Setup

### Prerequisites
- Node.js (LTS version)
- MySQL 8.0+
- TypeScript
- KnexJS

### Installation
```bash
# Clone repository
git clone <repository-url>
cd lendsqr-wallet-service

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run database migrations
npm run migrate

# Start development server
npm run dev
```


## Testing
```bash
# Run all tests
npm test


## Entity-Relationship Diagram (ERD)
```
The database schema was modeled using DB Designer. It defines the relationships between users, wallets, and transactions.
View the ERD here:
https://dbdesigner.page.link/jhov4NrCmv2gjvqY9



## Deployment
The application is deployed on onRender: https://toweh-elizabeth-lendsqr-be-test.onrender.com 


## Performance Optimizations
- Database indexing on frequently queried columns
- Connection pooling for database operations
- Caching for user profile data
- Pagination for transaction history

## Monitoring & Logging
- Structured logging with Winston
- Request/response logging middleware
- Error tracking and alerting
- Performance metrics collection

## Future Enhancements
- Multi-currency support
- Advanced fraud detection
- Webhook notifications
- Mobile API versioning
- Advanced analytics dashboard
