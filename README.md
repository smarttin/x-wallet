# x-wallet

wallet system

# link to api docs

https://documenter.getpostman.com/view/6064687/TW6up91S

## Requirements

Node.js, yarn/npm, Docker

## Getting Started

Clone the repo:

```bash
git clone "https://github.com/smarttin/x-wallet.git"
cd x-wallet
```

Install dependencies:

```bash
yarn
```

Set environment variables:

```bash
cp .env.example
```

## Running Locally

```bash
yarn dev
# import data
yarn data:import
# delete data
yarn data:delete
```

## Docker

```bash
# run container
cd x-wallet
docker-compose up
```

```bash
data found at src/data/data.js
docker exec -it <containerId> sh
# import data
yarn data:import
# delete data
yarn data:delete
```

## technologies used and description

```
# Node.js
asynchronous, event-driven, JavaScript runtime used for web server.
```

```
# Express.js
Node.js framework for web development was used for the REST APIs.
```

```
# Mongoose
Object Data Modeling (ODM) library for MongoDB and Node. js
used to manage relationships between data, provides schema validation
and model data.
```

```
# Mongodb
schema-less NoSQL document database used as database
```

```
# Jsonwwebtoken
used to create access tokens for authentication.
```

```
# Postman
API client used to create, share, test and document APIs.
```

```
# Git & Github
git version control system for tracking changes
github code hosting platform for version control and collaboration
```
