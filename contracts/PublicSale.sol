// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract PublicSale is
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // Mi Primer Token
    // Crear su setter
    IERC20Upgradeable miPrimerTokenFksF;

    // 17 de Junio del 2023 GMT
    uint256 constant startDate = 1686960000;

    // Maximo price NFT
    uint256 constant MAX_PRICE_NFT = 50000 * 10 ** 18;

    // Gnosis Safe
    // Crear su setter
    address gnosisSafeWallet;

    event DeliverNft(address winnerAccount, uint256 nftId);

    uint256 public numberFKSFs;
    uint256[] availableFKSFs;
    uint256 public numberAvailableFKSFs;
    mapping(uint256 => bool) public soldFKSFs;
    mapping(uint256 => uint256) positionAvailableArrayFKSF;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

    function purchaseNftById(uint256 _id) external {
        require(_id<30, "NFT: Token id out of range");
        uint256 priceNft = _getPriceById(_id);
        require(!soldFKSFs[_id], "Public Sale: id not available");
        require(miPrimerTokenFksF.allowance(msg.sender, address(this)) >=priceNft, "Public Sale: Not enough allowance");
        require(miPrimerTokenFksF.balanceOf(msg.sender) >=priceNft, "Public Sale: Not enough token balance");
        
        soldFKSFs[_id] = true;
        numberAvailableFKSFs--;
        _deleteAvailableId(_id);

        // fees
        uint256 feeGnosis = priceNft * 10 / 100;
        
        miPrimerTokenFksF.transferFrom(msg.sender, gnosisSafeWallet, feeGnosis);
        miPrimerTokenFksF.transferFrom(msg.sender, address(this), priceNft - feeGnosis);

        // EMITIR EVENTO para que lo escuche OPEN ZEPPELIN DEFENDER
        emit DeliverNft(msg.sender, _id);
    }

    function setNumberFKSFs(uint256 _numNFTs) public onlyRole(DEFAULT_ADMIN_ROLE){
        //Se considera que la cantidad es el limite superior y que los ids de los NFTs son consecutivos
        numberAvailableFKSFs = _numNFTs;
        for(uint i=0; i<_numNFTs; i++){
            availableFKSFs.push(i);
            positionAvailableArrayFKSF[i] = i;
        }
    }

    function depositEthForARandomNft() public payable {
        require(msg.value >= 0.01 ether, "Not enough ether");
        require(numberAvailableFKSFs>0, "Not available FKSF NFTs");
        uint256 nftId = _getRandomNftId();

        soldFKSFs[nftId] = true;
        numberAvailableFKSFs--;
        _deleteAvailableId(nftId);

        // Enviar ether a Gnosis Safe
        (bool success, bytes memory error) = payable(gnosisSafeWallet).call{
            value: 0.01 ether
        }("");

        require(success);

        if (msg.value > 0.01 ether) {
            payable(msg.sender).transfer(msg.value - 0.01 ether);
        }

        // EMITIR EVENTO para que lo escuche OPEN ZEPPELIN DEFENDER
        emit DeliverNft(msg.sender, nftId);
    }
    
    function getAvailableFKSFs() public view returns(uint256[] memory) {
        return availableFKSFs;
    }

    function setMiPrimerTokenFksF(address miPrimerTokenFksFAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        miPrimerTokenFksF = IERC20Upgradeable(miPrimerTokenFksFAddress);
    }

    function setGnosisWallet(address gnosisAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        gnosisSafeWallet = gnosisAddress;
    }

    // PENDING
    // Crear el metodo receive
    receive() external payable {
        depositEthForARandomNft();
    }

    ////////////////////////////////////////////////////////////////////////
    /////////                    Helper Methods                    /////////
    ////////////////////////////////////////////////////////////////////////

    // Devuelve un id random de NFT de una lista de ids disponibles
    function _getRandomNftId() internal view returns (uint256) {
        uint256 indexRandomAvailable = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % numberAvailableFKSFs;
        return availableFKSFs[indexRandomAvailable];
    }

    // Según el id del NFT, devuelve el precio. Existen 3 grupos de precios
    function _getPriceById(uint256 _id) internal view returns (uint256) {
        uint256 priceGroupOne = 500 * 10 ** 18;
        uint256 priceGroupTwo = _id * 1000 * 10 ** 18;
        uint256 priceGroupThree = 10000 * 10 ** 18 + (((block.timestamp - startDate) / 1 hours) * 1000 * 10 ** 18);
        if (_id < 11) {
            return priceGroupOne;
        } else if (_id > 10 && _id < 21) {
            return priceGroupTwo;
        } else {
            return priceGroupThree < MAX_PRICE_NFT ? priceGroupThree : MAX_PRICE_NFT;
        }
    }

    //Elimina un id de los NFTs disponibles
    function _deleteAvailableId(uint256 _id) internal {
        uint256 indexToDelete = positionAvailableArrayFKSF[_id];
        uint256 indexLastElement = availableFKSFs.length-1;
        positionAvailableArrayFKSF[availableFKSFs[indexLastElement]] = indexToDelete;
        availableFKSFs[indexToDelete] = availableFKSFs[indexLastElement];
        availableFKSFs.pop();
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {}
}
