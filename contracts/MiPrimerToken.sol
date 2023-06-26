// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MiPrimerTokenFksF is Initializable, ERC20Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
/*     constructor() {
        _disableInitializers();
    } */

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function initialize() initializer public {
        __ERC20_init("MiPrimerTokenFksF", "FKSFPC3T");
        __Ownable_init();
        __UUPSUpgradeable_init();

        _mint(msg.sender, 100000 * 10 ** decimals());
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}
}
