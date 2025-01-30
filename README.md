# Transactions Management API

This API enables the creation and management of users, and their balances, including transactions in account, and between different registered accounts.

## Features

- **Authentication**: User signup and login using JWT.
- **User Management**: Create, retrieve, user information and transfer money to other users
- **Transactions Management**: CRUD for transactions including its impact to the user's balance
- **Modular Architecture**: Separate modules for authentication, users, balance, and transactions.

## Authentication Endpoints

- **POST /auth/signup**: Registers a new user with email, password, and an initial amount.
- **POST /auth/signin**: Authenticates a user using their email and password, returning an access token.

---

## Transaction Endpoints

- **GET /users/:userId/transactions/**: Retrieves all transactions associated with a specific user.
- **POST /users/:userId/transactions/**: Creates a new transaction for a user, including title, description, amount, and type.
- **GET /users/:userId/transactions/:transactionId**: Fetches details of a specific transaction by its ID.
- **PUT /users/:userId/transactions/:transactionId**: Updates an existing transaction for a user with new details.
- **DELETE /users/:userId/transactions/:transactionId**: Deletes a specific transaction for a user.

---

## User Endpoints

- **GET /users/**: Retrieves a paginated list of all users.
- **GET /users/money/**: Retrieves the available balance of the currently authenticated user.
- **PATCH /users/money/**: Transfers money from the authenticated user to another user by specifying the receiver's ID and the amount.

## Authentication

All endpoints (except `/auth/signup` and `/auth/signin`) are protected and require a valid JWT token. Include the token in the `Authorization` header as follows: 'Authorization: Bearer <token>'