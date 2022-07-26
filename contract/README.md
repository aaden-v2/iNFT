
## INSTALL

`npm i --include=dev`

## test

compile

`npx hardhat compile`

run local

`npx hardhat node`
`npx hardhat run --network localhost scripts/deploy_nftad.js`

`npx hardhat run --network mumbai scripts/deploy_nftad.js`

## verify

`npx hardhat verify --network mumbai --constructor-args scripts/nftad_args.js <address>`
