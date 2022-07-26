const { ethers, waffle } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("NFTAD", function () {
  let myContract;
  let owner,addr1,addr2;
  console.log("test start");
  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
  });

  describe("YourContract",  function () {
    it("Should deploy YourContract", async function () {
      const YourContract = await ethers.getContractFactory("NFTAD1155");

      myContract = await YourContract.deploy("NFTAD", "https://nftads.info/api/tokens/{id}");
    });

    describe("mint()", function () {
      it("Should be able to mint a new nft", async function () {
        const options = {
            value: ethers.utils.parseEther("0.2"),
            gasLimit: 1000000
        };
        const mintTx = await myContract.mint(addr1.address, 1, 2, options);
        await mintTx.wait();
        expect(await myContract.balanceOf(addr1.address, 1)).to.equal(2);
      });
      it("Should have 0.2 balance", async function () {
        expect(await myContract.getADOwnerBalance(owner.address)).to.equal(ethers.utils.parseEther("0.2"));
      });
      it("Should burn success", async function () {
        const burnTx = await myContract.connect(addr1).burn(1, 2);
        await burnTx.wait();
        expect(await myContract.balanceOf(addr1.address, 1)).to.equal(0);
        expect(await myContract.getADOwnerBalance(owner.address)).to.equal(0);
        const balance = await waffle.provider.getBalance(addr1.address);
        console.log(balance);
        // close to https://ethereum-waffle.readthedocs.io/en/latest/matchers.html
        const resultValue = ethers.utils.parseEther("10000.2");
        expect(balance).to.closeTo(resultValue, ethers.utils.parseEther("0.1"));
      });
    });

    describe("mintToMany()", function () {
      it("Should be able to mint a new nft", async function () {
        const options = {
            value: ethers.utils.parseEther("0.3"),
            gasLimit: 1000000
        };
        const mintTx = await myContract.mintToMany([owner.address, addr1.address, addr2.address], 1, 1, options);
        await mintTx.wait();
        expect(await myContract.balanceOf(owner.address, 1)).to.equal(1);
        expect(await myContract.balanceOf(addr1.address, 1)).to.equal(1);
        expect(await myContract.balanceOf(addr2.address, 1)).to.equal(1);
      });
      it("Should have 0.3 balance", async function () {
        expect(await myContract.getADOwnerBalance(owner.address)).to.equal(ethers.utils.parseEther("0.3"));
      });
      it("address owner Should burn success", async function () {
        const burnTx = await myContract.connect(owner).burn(1, 1);
        await burnTx.wait();
        expect(await myContract.balanceOf(owner.address, 1)).to.equal(0);
        const adBalance =  await myContract.getADOwnerBalance(owner.address);
        console.log("adBalance: ", adBalance)
        expect(adBalance).to.equal(ethers.utils.parseEther("0.2"));
        const balance = await waffle.provider.getBalance(owner.address);
        // mint -0.2 minttomany -0.3 + burn 0.1
        const resultValue = ethers.utils.parseEther("9999.6");
        expect(balance).to.closeTo(resultValue, ethers.utils.parseEther("0.1"));
      });
      it("address1 Should burn success", async function () {
        const burnTx = await myContract.connect(addr1).burn(1, 1);
        await burnTx.wait();
        expect(await myContract.balanceOf(addr1.address, 1)).to.equal(0);
        const adBalance =  await myContract.getADOwnerBalance(owner.address);
        console.log("adBalance: ", adBalance)
        expect(adBalance).to.equal(ethers.utils.parseEther("0.1"));
        const balance = await waffle.provider.getBalance(addr1.address);
        // address balance is 10000.2 after last burn
        const resultValue = ethers.utils.parseEther("10000.3");
        expect(balance).to.closeTo(resultValue, ethers.utils.parseEther("0.1"));
      });
      it("address2 Should burn success", async function () {
        const burnTx = await myContract.connect(addr2).burn(1, 1);
        await burnTx.wait();
        expect(await myContract.balanceOf(addr2.address, 1)).to.equal(0);
        const adBalance =  await myContract.getADOwnerBalance(owner.address);
        console.log("adBalance: ", adBalance)
        expect(await myContract.getADOwnerBalance(owner.address)).to.equal(0);
        const balance = await waffle.provider.getBalance(addr2.address);
        const resultValue = ethers.utils.parseEther("10000.1");
        expect(balance).to.closeTo(resultValue, ethers.utils.parseEther("0.1"));
      });
    });

  });
});