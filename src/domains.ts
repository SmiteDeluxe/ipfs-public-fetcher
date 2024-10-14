const fallbackGateways = [
	'https://flk-ipfs.xyz',
	'https://ipfs.cyou',
	'https://dlunar.net',
	'https://storry.tv',
	'https://ipfs.io',
	'https://dweb.link',
	'https://gateway.pinata.cloud',
	'https://hardbin.com',
	'https://ipfs.runfission.com',
	'https://ipfs.eth.aragon.network',
	'https://nftstorage.link',
	'https://4everland.io',
	'https://w3s.link',
  ]

export default async (): Promise<string[]> => {
	try {
	  // GitHub raw URL for the gateways.json file
	  const response = await fetch(
		'https://raw.githubusercontent.com/ipfs/public-gateway-checker/main/gateways.json'
	  );
  
	  if (!response.ok) {
		throw new Error(`Error fetching gateways: ${response.statusText}`);
	  }
  
	  const gateways: string[] = await response.json();
  
	  return gateways;
	} catch (error) {
	  console.error('Error fetching gateways:', error);
	  return fallbackGateways;
	}
  };