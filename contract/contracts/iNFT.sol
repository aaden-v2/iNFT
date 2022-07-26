// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract NFTAD1155 is ERC1155, Ownable, VRFConsumerBase{

    bytes32 public keyHash = 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;
    uint256 public fee = 0.0001 * 10**18; // 0.0001 LINK
    uint256 public randomResult;

    // Contract name
    string public name;
    string public uri;
    uint256 public PRICE = 1 * 10**17; // 0.1 MATIC
    uint256  awardID = 0;
    mapping(uint256 => address) private adOwners;
    mapping(address => uint256) private adOwnerBalance;
    mapping(address => uint256) public addressRandomHash;

    event Minted(address minter, address receiver, uint256 id, uint256 amount);


 // 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed, // VRF Coordinator
            // 0x326C977E6efc84E512bB9C30f76E30c160eD06FB // LINK Token
    constructor(string memory name_, string memory uri_)
        ERC1155(uri_)
        VRFConsumerBase(0x8C7382F9D8f56b33781fE506E897a4F1e2d17255,0x326C977E6efc84E512bB9C30f76E30c160eD06FB)
    {

    }

    function finalize() public onlyOwner {
        address payable addr = payable(address(owner()));
        selfdestruct(addr);
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    function refundIfOver(uint256 amount, uint256 price) private {
        require(msg.value >= (price * amount), "Need to send more Matic.");
        if (msg.value > (price * amount)) {
            payable(msg.sender).transfer(msg.value - (price * amount));
        }
    }

    function mint(
        address account,
        uint256 id,
        uint256 amount
    ) external payable {
        if (adOwners[id] == address(0)) {
            refundIfOver(PRICE, amount);
            adOwners[id] = msg.sender;
        } else {
            require(adOwners[id] == msg.sender, "Need to be AD Owner");
            refundIfOver(PRICE, amount);
        }
        adOwnerBalance[msg.sender] += PRICE * amount;
        _mint(account, id, amount, new bytes(0));
        emit Minted(msg.sender, account, id, amount);
    }

    function getRandomNumber() public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");
        return requestRandomness(keyHash, fee);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        randomResult = randomness;
    }

    function mintToMany(
        address[] calldata accounts,
        uint256 id,
        uint256 amount
    ) external payable returns (uint256 mintedQty) {
        if (adOwners[id] == address(0)) {
            refundIfOver(PRICE, amount * accounts.length);
            adOwners[id] = msg.sender;
        } else {
            require(adOwners[id] == msg.sender, "Need to be AD Owner");
            refundIfOver(PRICE, amount * accounts.length);
        }

        getRandomNumber();
        adOwnerBalance[msg.sender] += PRICE * amount * accounts.length;
        uint256 mintCost = gasleft();
        _mint(accounts[0], id, amount, new bytes(0));
        emit Minted(msg.sender, accounts[0], id, amount);
        mintedQty = 1;
        mintCost = mintCost - gasleft();

        for (uint256 i = 1; i < accounts.length; i++) {
            if (gasleft() < mintCost) {
                return mintedQty;
            }
            _mint(accounts[i], id, amount, new bytes(0));
            emit Minted(msg.sender, accounts[i], id, amount);
            mintedQty++;
        }
        return mintedQty;
    }

    function burn(uint256 id, uint256 amount, uint256 randomNum) external {
        require(
            balanceOf(msg.sender, id) >= amount,
            "Need to have enough NFT to burn"
        );
        require(randomNum == randomResult, "Wrong random number");
        _burn(msg.sender, id, amount);
        address adOwner = adOwners[id];
        uint256 payAmount = PRICE * amount;
        require(
            adOwnerBalance[adOwner] >= payAmount,
            "AdOwner have no enough balance to Pay"
        );
        adOwnerBalance[adOwner] -= payAmount;
        payable(msg.sender).transfer(payAmount);
    }

    function getBaseURI() public view returns (string memory) {
        return uri;
    }

    function getRandomResult()  public view returns (uint256) {
        return randomResult;
    }

    function setPrice(uint256 price) public onlyOwner {
        PRICE = price;
    }

    /**
     * @dev Function to set the URI for all NFT IDs
     */
    function setBaseURI(string calldata _uri) external onlyOwner {
        _setURI(_uri);
    }

    function getTotalBalance() public view returns (uint256) {
        uint256 balance = address(this).balance;
        return balance;
    }

    function getADOwner(uint256 id) public view returns (address) {
        address ADOwner = adOwners[id];
        return ADOwner;
    }

    function getADOwnerBalance(address adOwner) public view returns (uint256) {
        uint256 balance = adOwnerBalance[adOwner];
        return balance;
    }
}
