require("dotenv").config();

const {
  getRole,
  verify,
  ex,
  printAddress,
  deploySC,
  deploySCNoUp,
} = require("../utils");

var MINTER_ROLE = getRole("MINTER_ROLE");
var BURNER_ROLE = getRole("BURNER_ROLE");

async function deployMumbai() {
  var relayerAddress = "0xdA2Dbf2EC3E3E5Ec9622096fF72B489a017c087D";

  var nftContract = await deploySC("MiPrimerNftFksF", []);
  var implementation = await printAddress("MiPrimerNftFksF", nftContract.address);
  console.log("MiPrimerNftFksF Address: ", nftContract.address);

  // set up
  await ex(nftContract, "grantRole", [MINTER_ROLE, relayerAddress], "GR");

  await verify(implementation, "MiPrimerNftFksF", []);
}

async function deployGoerli() {
  // gnosis safe
  // Crear un gnosis safe en https://gnosis-safe.io/app/
  // Extraer el address del gnosis safe y pasarlo al contrato con un setter
  var gnosis = { address: "gor:0xD0818c40DfC3062d57DcD9648b69305fd4192aEB" };
  var usdcContract = await deploySCNoUp("USDCoin");
  verify(usdcContract.address, "USDC");
  console.log("USDC Address: ",usdcContract.address);
  
  miPrimerTokenFksF = await deploySC("MiPrimerTokenFksF",[]);
  var implementationmiPrimerTokenFksF = await printAddress("MiPrimerTokenFksF", miPrimerTokenFksF.address);
  verify(implementationmiPrimerTokenFksF, "MiPrimerTokenFksF");
  console.log("miPrimerTokenFksF Address: ",miPrimerTokenFksF.address);


  publicSale = await deploySC("PublicSale",[]);
  var implementationpublicSale = await printAddress("PublicSale", publicSale.address);
  verify(implementationpublicSale, "PublicSale");
  console.log("publicSale Address: ",publicSale.address);


  await ex(publicSale, "setMiPrimerTokenFksF", [miPrimerTokenFksF.address], "SPC3");
  await ex(publicSale, "setGnosisWallet", [gnosis.address], "SGW");
  await ex(publicSale, "setNumberFKSFs", [30], "SetUp Number FKSF NFTs"); 
}

// deployMumbai()
deployGoerli()
  //
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
