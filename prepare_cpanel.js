const fs = require('fs');
const path = require('path');

function buildCpanelDeployment() {
  const standaloneDir = path.join(__dirname, '.next', 'standalone');
  const deployDir = path.join(__dirname, 'cpanel_deploy');

  if (!fs.existsSync(standaloneDir)) {
    console.error("Error: .next/standalone not found. Please run 'npm run build' first.");
    process.exit(1);
  }

  console.log("Preparing deployment folder...");
  
  // Create output dir
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
  }

  // 1. Copy standalone folder to the root of deployDir
  fs.cpSync(standaloneDir, deployDir, { recursive: true });
  
  // 2. Copy the public folder to deployDir/public
  fs.cpSync(path.join(__dirname, 'public'), path.join(deployDir, 'public'), { recursive: true });
  
  // 3. Copy the .next/static folder to deployDir/.next/static
  fs.cpSync(path.join(__dirname, '.next', 'static'), path.join(deployDir, '.next', 'static'), { recursive: true });
  
  // 4. Copy .env
  if (fs.existsSync(path.join(__dirname, '.env'))) {
    fs.copyFileSync(path.join(__dirname, '.env'), path.join(deployDir, '.env'));
  }

  console.log("\n==================================================");
  console.log("SUCCESS! Your GoDaddy deployment folder is ready.");
  console.log("Everything you need is inside the 'cpanel_deploy' folder.");
  console.log("Just zip the contents of 'cpanel_deploy' and upload it to GoDaddy!");
  console.log("==================================================");
}

buildCpanelDeployment();
