import {ethers} from "ethers";
import {Buffer} from "buffer";
import {RPC, WHITELISTED_COLLECTIONS} from "@/utils/constants.ts";
import {sleep, withTimeout} from "@/utils/functions.ts";
import {NFT_CONTRACT_ABI} from "@/utils/nftContractAbi.ts";

window.Buffer = window.Buffer || Buffer;

const MAX_CAPACITY = 40
const PROVIDER = new ethers.providers.JsonRpcProvider(RPC);

export const eosFetchCollections = async (setCollections: any, setCollectionsSearchFinished: any, inputAddress: any) => {
    try {
        const collectionsData: any = []
        const balanceOfPromises: any = [];
        for (let i = 0; i < WHITELISTED_COLLECTIONS.length; i++) {
            const {contract: contractAddress} = WHITELISTED_COLLECTIONS[i]
            const contractInstance = new ethers.Contract(contractAddress, NFT_CONTRACT_ABI, PROVIDER);
            balanceOfPromises.push(
                contractInstance.balanceOf(inputAddress)
            );
        }

        let tempBalance: any = await Promise.allSettled(balanceOfPromises);
        for (let i = 0; i < tempBalance.length; i++) {
            try {
                const {contract: contractAddress, name, symbol} = WHITELISTED_COLLECTIONS[i]
                if (tempBalance[i].status === "fulfilled") {
                    let nftCount = tempBalance[i].value.toString();
                    if (nftCount >= 1) {
                        collectionsData.push({
                            "selected": false,
                            "contract": contractAddress,
                            "name": name,
                            "symbol": symbol,
                            "count": nftCount,
                            "tokensData": {}
                        })
                    }
                }
            } catch (err) {
                console.log(err)
            }
        }
        setCollections(collectionsData)
    } catch (err) {
        console.log(err)
    }
    setCollectionsSearchFinished(true)
    return
}

export const eosFetchNfts = async (collectionsData: any, nftSelecteCount: any, setLoadingText: any, address: any, setNfts: any, setNftSearchFinished: any) => {
    try {
        let tokensFound = 0;
        let totalNftsFetched = 0

        for (let i = 0; i < collectionsData.length; i++) {
            if (tokensFound >= MAX_CAPACITY) {
                break
            }
            const {contract, count, symbol} = collectionsData[i];
            const contractInstance = new ethers.Contract(contract, NFT_CONTRACT_ABI, PROVIDER);

            let tokensIndexes = [];
            for (let j = 0; j < count; j++) {
                try {
                    if (tokensFound < MAX_CAPACITY) {
                        tokensIndexes.push(j);
                        tokensFound++
                    }
                } catch (err) {
                    console.log("error tokenOfOwnerByIndex")
                }
            }

            do {
                let success = 0
                const promisesIds = []
                for (let j = 0; j < tokensIndexes.length; j++) {
                    try {
                        promisesIds.push(
                            contractInstance.tokenOfOwnerByIndex(address, tokensIndexes[j])
                        );
                    } catch (err) {
                        console.log("error tokenOfOwnerByIndex")
                    }
                }
                let tempTokensIndexes: any = []
                let idArray: any = await Promise.allSettled(promisesIds);
                for (let j = 0; j < idArray.length; j++) {
                    try {
                        if (idArray[j].status === "rejected") {
                            tempTokensIndexes.push(tokensIndexes[j])
                        }
                        if (idArray[j].status === "fulfilled") {
                            success++
                            totalNftsFetched++
                            const tokenId = idArray[j].value.toString()

                            let uri = null;
                            collectionsData[i].tokensData[tokenId] = {
                                "uri": uri,
                                "image": contract.toLowerCase() === "0xf78005a66a8d05a66fcbf72ade3b5ea33d01ffa1" ? `https://hbd.infura-ipfs.io/ipfs/Qme5mxM5tSG2AwfCYTHi4gYT9rtDNy3HpKucA9VaR8a3rg/${tokenId}.png` : null,
                                "name": `${symbol} #${tokenId}`,
                            }
                        }
                    } catch (err) {
                        console.log(err)
                    }
                }
                setLoadingText(`Fetching NFTs data: ${totalNftsFetched} / ${nftSelecteCount}`)
                tokensIndexes = tempTokensIndexes
                if (tokensIndexes.length === 0) break
                await sleep(5 * 1000)
            } while (tokensIndexes.length)
        }

        for (let i = 0; i < collectionsData.length; i++) {
            const {contract} = collectionsData[i];
            const contractInstance = new ethers.Contract(contract, NFT_CONTRACT_ABI, PROVIDER);
            const tokensIds = Object.keys(collectionsData[i].tokensData)
            const promisesUriArray = [];


            if (contract.toLowerCase() !== "0xf78005a66a8d05a66fcbf72ade3b5ea33d01ffa1") {
                for (let j = 0; j < tokensIds.length; j++) {
                    try {
                        promisesUriArray.push(
                            contractInstance.tokenURI(tokensIds[j])
                        );
                    } catch (err) {
                        console.log("error tokenURI")
                    }
                }
            }

            let uriArray: any = await Promise.allSettled(promisesUriArray);
            for (let j = 0; j < uriArray.length; j++) {
                try {
                    if (uriArray[j].status === "fulfilled") {
                        const uri = (uriArray[j].value.includes("data:application/json;base64") ? "" : /* CORS */ "") + uriArray[j].value
                            .replace("ipfs://", "https://hbd.infura-ipfs.io/ipfs/")
                            .replace("https://ipfs.io/ipfs/", "https://hbd.infura-ipfs.io/ipfs/")
                        collectionsData[i].tokensData[tokensIds[j]].uri = uri
                    }
                } catch (err) {
                    console.log(err)
                }
            }

        }

        const nftArray: any = []
        for (let i = 0; i < collectionsData.length; i++) {
            const tokensIds = Object.keys(collectionsData[i].tokensData)
            const tokensUris = []

            if (collectionsData[i].contract.toLowerCase() === "0xf78005a66a8d05a66fcbf72ade3b5ea33d01ffa1") {
                for (let j = 0; j < tokensIds.length; j++) {
                    nftArray.push({
                        name: collectionsData[i].tokensData[tokensIds[j]].name,
                        image: collectionsData[i].tokensData[tokensIds[j]].image,
                        contract: collectionsData[i].contract,
                        id: tokensIds[j]
                    })
                }
            } else {
                const promisesUriMetadataArray = [];
                for (let j = 0; j < tokensIds.length; j++) {
                    tokensUris.push(collectionsData[i]?.tokensData[tokensIds[j]]?.uri)
                    promisesUriMetadataArray.push(
                        withTimeout(10000, fetch(collectionsData[i]?.tokensData[tokensIds[j]]?.uri))
                    )
                }

                let uriMetadataArray: any = await Promise.allSettled(promisesUriMetadataArray);
                for (let j = 0; j < uriMetadataArray.length; j++) {
                    try {
                        if (uriMetadataArray[j].status === "fulfilled") {
                            const result = await uriMetadataArray[j].value.json()
                            const data = result

                            if (data?.name && data?.name.substring(0, 1) !== "#") {
                                collectionsData[i].tokensData[tokensIds[j]].name = data.name
                            }
                            if (data?.image) {
                                const image = (data.image.includes("data:image") ? "" : /* CORS */ "") + data.image
                                    .replace("ipfs://", "https://hbd.infura-ipfs.io/ipfs/")
                                    .replace("https://ipfs.io/ipfs/", "https://hbd.infura-ipfs.io/ipfs/")
                                    .replace("https://ipfs.moralis.io:2053/ipfs/", "https://nftstorage.link/ipfs/")
                                collectionsData[i].tokensData[tokensIds[j]].image = image
                            }
                            nftArray.push({
                                name: collectionsData[i].tokensData[tokensIds[j]].name,
                                image: collectionsData[i].tokensData[tokensIds[j]].image,
                                contract: collectionsData[i].contract,
                                id: tokensIds[j]
                            })
                        }
                    } catch (err) {
                        console.log(err)
                    }
                }
            }
        }
        setNfts(nftArray.slice(0, 40))
    } catch (err) {
        console.log(err)
    }
    setNftSearchFinished(true)
    return
}