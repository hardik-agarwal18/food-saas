# Food SaaS API Postman Collections

This directory contains a complete, production-grade Postman testing suite for the Food SaaS backend. It is divided into exactly 5 independent collections mapped closely to the domain modules of the application, along with a shared environment file.

## Contents

- `environment/food-saas.postman_environment.json`: The environment variables needed for the collections, including base URLs, dynamic IDs, tokens, and test credentials.
- `01-identity-auth.postman_collection.json`: Covers registration, login, token refresh, current user retrieval, password change, reset, and email verification.
- `02-customer-restaurant-admin.postman_collection.json`: Covers customer profile and addresses, restaurant onboarding, updates, admin approvals, and user suspension.
- `03-menu-management.postman_collection.json`: Covers restaurant menu categories, items, modifier groups, modifier items, and asynchronous OCR menu imports.
- `04-ordering-lifecycle.postman_collection.json`: Covers the entire ordering flow from placement by the customer to acceptance and preparation by the restaurant, to historical retrieval.
- `05-delivery-location-notifications-and-system.postman_collection.json`: Covers driver registration, delivery assignments, claiming deliveries, real-time driver location updates, and system health checks (`/live`, `/health`).

## Setup and Usage

1. **Import the Environment:** 
   Open Postman and import `environment/food-saas.postman_environment.json`. Select "Food SaaS — Local Dev" as your active environment in the top right corner.

2. **Configure Credentials:** 
   Update the `customerEmail`, `restaurantEmail`, `driverEmail`, and `adminEmail` variables in the environment to match accounts that exist (or that you will create) in your local database. Passwords default to `Test1234!`.

3. **Import Collections:**
   Import the 5 JSON collection files into Postman.

4. **Workflow Execution:**
   The collections are designed to be run in sequence, and they use Postman Test Scripts to dynamically extract IDs and Tokens into the environment for subsequent requests. For example:
   - Running "Login as Customer" automatically captures the `accessToken` into `customerAccessToken`.
   - Running "Place Order" automatically saves the `orderId` to the environment, allowing you to seamlessly run the "Update Order Status" request.

5. **Assertions & Tests:**
   Almost all endpoints include assertions verifying status codes, payload shapes (checking `success: true`), and expected business logic. Running a collection or folder via the Postman Runner will execute these assertions systematically.
