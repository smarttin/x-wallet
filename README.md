# x-wallet

wallet system

# link to api docs

https://documenter.getpostman.com/view/6064687/TVzYeZ2b

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
cp .env.example.env
```

## Running Locally

```bash
yarn dev
```

## Docker

```bash
# run container
cd x-wallet
docker-compose up
```

```bash
# import data
docker exec -it <containerId> sh
yarn data:import
# delete data
yarn data:delete
```

## technologies used and description

nodejs
expressjs
mongoose
mongodb
jsonwwebtoken
