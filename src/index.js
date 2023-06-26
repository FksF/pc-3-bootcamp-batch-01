import { BigNumber, Contract, ethers, providers, utils } from "ethers";

var usdcTknAbi = require("../artifacts/contracts/USDCoin.sol/USDCoin.json").abi;
var miPrimerTknAbi = require("../artifacts/contracts/MiPrimerToken.sol/MiPrimerTokenFksF.json").abi;
var publicSaleAbi = require("../artifacts/contracts/PublicSale.sol/PublicSale.json").abi;
var nftTknAbi = require("../artifacts/contracts/NFT.sol/MiPrimerNftFksF.json").abi;

window.ethers = ethers;

var provider, signer, account;
var usdcTkContract, miPrTokenContract, nftTknContract, pubSContract;

// REQUIRED
// Conectar con metamask
function initSCsGoerli() {
  provider = new providers.Web3Provider(window.ethereum);

  var usdcAddress = "0x58fAf8E376AE31B98fc758ec0BD4A28d9fe4Dd25";
  var miPrTknAdd = "0xC70a1D00e5015Ea67369c763BFE7587dbD98b094";
  var pubSContractAdd = "0xF530Ee99444BCbcC2a351A290Bb0526A38eBCb63";

  usdcTkContract = new Contract(usdcAddress, usdcTknAbi, signer); // = Contract...
  miPrTokenContract = new Contract(miPrTknAdd, miPrimerTknAbi, signer); // = Contract...
  pubSContract = new Contract(pubSContractAdd, publicSaleAbi, signer); // = Contract...
}

// OPTIONAL
// No require conexion con Metamask
// Usar JSON-RPC
// Se pueden escuchar eventos de los contratos usando el provider con RPC
function initSCsMumbai() {
  console.log("Mumbai init")
  const jsonRpcUrl = "https://polygon-mumbai.g.alchemy.com/v2/XEDgFJlEvUvyKgHxE81juMRSgY_QjH-L";
  const providerMumbai = new ethers.providers.JsonRpcProvider(jsonRpcUrl);

  var nftTknAddress = "0x2775Dd53D58fE3306A76518ce1289BEa5cE1ABb4";
  nftTknContract = new Contract(nftTknAddress, nftTknAbi, providerMumbai);
}

async function chargeLastNFTsMinted() {
  // await nftTknContract.connect(account).safeMint(account,1);
  var nftTransferList = document.getElementById("nftList");
  nftTransferList.innerHTML = '';

  var filterFrom = nftTknContract.filters.Transfer(ethers.constants.AddressZero, null);

  var pastEvents = await nftTknContract.queryFilter(filterFrom, -500);

  pastEvents.forEach((event) => {
    var child = document.createElement("li");
    child.innerText = `Transfer from ${event.args[0]} to ${event.args[1]} tokenId ${event.args[2]}`;
    nftTransferList.appendChild(child);
  });
  console.log("Eventos cargados")
}
function setUpListeners() {
  // Connect to Metamask
  var bttn = document.getElementById("connect");
  bttn.addEventListener("click", async function () {
    if (window.ethereum) {
      [account] = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Billetera metamask", account);

      provider = new providers.Web3Provider(window.ethereum);
      signer = provider.getSigner(account);
      window.signer = signer;
      initSCsGoerli();
      initSCsMumbai();
      setUpEventsContracts();
      await chargeLastNFTsMinted();
    }
  });

  var bttn = document.getElementById("usdcUpdate");
  bttn.addEventListener("click", async function () {
    var usdcBalance = document.getElementById("usdcBalance");
    try {
      var tx = await usdcTkContract
        .connect(signer)
        .balanceOf(account);
      usdcBalance.innerHTML = tx.toString();

    } catch (error) {
      console.log(error);
    }
  });

  var bttn = document.getElementById("miPrimerTknUpdate");
  bttn.addEventListener("click", async function () {
    var miPrimerTknBalance = document.getElementById("miPrimerTknBalance");
    try {
      var tx = await miPrTokenContract
        .connect(signer)
        .balanceOf(account);
        miPrimerTknBalance.innerHTML = tx.toString();

    } catch (error) {
      console.log(error);
    }
  });

  var bttn = document.getElementById("approveButton");
  bttn.addEventListener("click", async function () {
    var approveAmount = document.getElementById("approveInput");
    var approveError = document.getElementById("approveError");
    approveError.innerHTML = "";
    try {
      var tx = await miPrTokenContract
        .connect(signer)
        .approve(pubSContract.address, approveAmount.value);

    } catch (error) {
      console.log(error.reason);
      approveError.innerHTML = error.reason;
    }
  });

  var bttn = document.getElementById("purchaseButton");
  bttn.addEventListener("click", async function () {
    var purchaseId = document.getElementById("purchaseInput");
    var purchaseError = document.getElementById("purchaseError");
    purchaseError.innerHTML = "";
    try {
      var tx = await pubSContract
        .connect(signer)
        .purchaseNftById(purchaseId.value);

    } catch (error) {
      console.log(error.reason);
      purchaseError.innerHTML = error.reason;
    }
  });

  var bttn = document.getElementById("purchaseEthButton");
  bttn.addEventListener("click", async function () {
    var purchaseEthError = document.getElementById("purchaseEthError");
    purchaseEthError.innerHTML = "";
    try {

      var tx = await pubSContract
        .connect(signer)
        .depositEthForARandomNft({
          value: utils.parseEther("0.01")
        });

    } catch (error) {
      console.log(error);
      purchaseEthError.innerHTML = error.reason;
    }
  });

  var bttn = document.getElementById("sendEtherButton");
  bttn.addEventListener("click", async function () {
    
    var sendEtherError = document.getElementById("sendEtherError");
    sendEtherError.innerHTML = "";
    try {

      var tx = await signer.sendTransaction({
        to: pubSContract.address,
        value: utils.parseEther("0.01"),
      });

    } catch (error) {
      console.log(error);
      sendEtherError.innerHTML = error.reason;
    }
  });

  var bttn = document.getElementById("seeAvailableNFTsButton");
  bttn.addEventListener("click", async function () {
    
    var list = document.getElementById("availableNFTsList");
    list.innerHTML = "";
    try {

      var res = await pubSContract
        .connect(account)
        .getAvailableNFTs();

      var idsList = "";
      res.forEach((idNFT, ix) => {
        idsList+=idNFT.toString() + ", ";
      });
      list.innerHTML = idsList.slice(0, -2);

    } catch (error) {
      console.log(error);
    }
  });
}

function setUpEventsContracts() {
  // nftTknContract.on

  nftTknContract.on("Transfer", (adrressZer0,ownerNFT, idNFT) => {
    var nftTransferList = document.getElementById("nftList");
    var child = document.createElement("li");
    child.innerText = `Transfer from ${adrressZer0} to ${ownerNFT} tokenId ${idNFT}`;
    nftTransferList.appendChild(child);
  });
}

async function setUp() {
  await setUpListeners();
}

setUp()
  .then()
  .catch((e) => console.log(e));
