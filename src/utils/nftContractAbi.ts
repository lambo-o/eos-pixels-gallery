export const NFT_CONTRACT_ABI = [
    {
        "outputs": [{"type": "uint256"}],
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "stateMutability": "view",
        "type": "function"
    },
    {
        "outputs": [{"type": "string"}],
        "inputs": [{"name": "_tokenId", "type": "uint256"}],
        "name": "tokenURI",
        "stateMutability": "view",
        "type": "function"
    },
    {
        "outputs": [{"name": "_tokenId", "type": "uint256"}],
        "inputs": [{"name": "_owner", "type": "address"}, {"name": "_index", "type": "uint256"}],
        "name": "tokenOfOwnerByIndex",
        "stateMutability": "view",
        "type": "function"
    },
];