import {Card} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Link} from "react-router-dom";
import Logo from '../assets/logo.png'
import {useMetaMask} from "@/store/MetaMaskContextProvider.tsx";
import {ethers} from "ethers";
import {CHAIN_ID, CONTRACT_ADDRESS, MORALIS_FETCH_HEADERS, MORALIS_URL, RPC} from "@/utils/constants.ts";
import {createRef, useEffect, useRef, useState} from "react";
import {Slider} from "@/components/ui/slider.tsx";
import {ModeToggle} from "@/components/ModeToggle.tsx";
import {CopyIcon, HomeIcon, ImageIcon, RefreshCwIcon, WalletIcon} from "lucide-react";
import {toast} from "@/components/ui/use-toast.ts";
import {generateColors} from "@/utils/functions.ts";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {useCopyToClipboard} from "@/hooks/useCopyToClipboard.ts";
import {Label} from "@/components/ui/label.tsx";
import {CONTRACT_ABI} from "@/utils/contractAbi.ts";

const Mint = () => {
    const {connectMetaMask, wallet, hasProvider} = useMetaMask()

    const canvasRef = createRef<HTMLCanvasElement>();
    const [isLoading, setIsLoading] = useState(false)

    const [balance, setBalance] = useState(0)
    const [colorRange, setColorRange] = useState([5])
    const [pixelSize, setPixelSize] = useState([15])
    const [wasGenerated, setWasGenerated] = useState(false)
    const hasGenerated = useRef(0)

    const [_, copy] = useCopyToClipboard()

    const getPixelBalance = async (address: string) => {
        const providerEthers = new ethers.providers.JsonRpcProvider(RPC);
        const contractPixel = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerEthers);
        const myBalance = await contractPixel.balanceOf(address);
        const bal = parseInt(myBalance._hex, 16);
        setBalance(bal)
        return bal
    }

    const generateCanvas = async () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                let y, x;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const colors = generateColors(colorRange[0]);

                for (y = 0; y <= canvas.height; y += pixelSize[0]) {
                    for (x = 0; x <= canvas.width; x += pixelSize[0]) {
                        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                        ctx.fillRect(x, y, pixelSize[0], pixelSize[0]);
                    }
                }

                setTimeout(() => {
                    const image: any = document.getElementById('chain-logo');

                    ctx.fillStyle = 'white';
                    ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, 2 * Math.PI, false);
                    ctx.fill();

                    if (image)
                        ctx.drawImage(image, canvas.width / 2 - 50, canvas.height / 2 - 50, 100, 100);
                    setWasGenerated(true);
                }, 100)

                setWasGenerated(true);
            }
        }
    };

    const uploadToIpfs = async () => {
        if (parseInt(wallet.chainId) !== CHAIN_ID) {
            getPixelBalance(wallet.accounts[0])
            return 'error';
        }

        const canvas = canvasRef.current;
        if (canvas) {
            try {
                const imageToData = canvas.toDataURL('image/png');
                let url = MORALIS_URL;
                let dataImage = [{path: 'img', content: imageToData}];
                let resImage = await fetch(url, {
                    method: 'POST',
                    headers: MORALIS_FETCH_HEADERS,
                    body: JSON.stringify(dataImage),
                });
                let retImage = (await resImage.json())[0].path;

                const metadataObj = {
                    image: retImage,
                };
                let dataMetadata = [{path: 'metadata', content: metadataObj}];
                let resMetadata = await fetch(url, {
                    method: 'POST',
                    headers: MORALIS_FETCH_HEADERS,
                    body: JSON.stringify(dataMetadata),
                });
                return (await resMetadata.json())[0].path;
            } catch (e) {
                console.log(e)
            }
        }
        return 'error';
    };

    const loadEvents = async () => {
        if (wallet.accounts.length > 0) {
            if (wasGenerated) {
                setIsLoading(true)
                try {
                    let linkIpfs = await uploadToIpfs();

                    if (linkIpfs == "error") {
                        console.log("Error");
                        return
                    }

                    const provider = new ethers.providers.Web3Provider(window.ethereum);

                    const contractPixel = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider.getSigner());
                    const encodedData = contractPixel.interface.encodeFunctionData('mint', [linkIpfs]);
                    const signer = provider.getSigner();
                    const from = await signer.getAddress();

                    const transactionParameters = {
                        to: CONTRACT_ADDRESS,
                        from: from,
                        data: encodedData,
                    };

                    const tx = await signer.sendTransaction(transactionParameters);
                    await tx.wait();

                    toast({
                        className: 'p-5 bg-amber-50 text-green-600 dark:bg-green-600 dark:text-white',
                        title: "Success!",
                        description: <>
                            Tx. hash: {' '}
                            <a target="_blank" href={`https://explorer.evm.eosnetwork.com/tx/${tx.hash}`}>
                                {tx.hash.substr(0, 10)}...{tx.hash.substr(-10)}
                            </a>
                        </>,
                    })

                    generateCanvas();
                    setIsLoading(false)
                } catch (error) {
                    toast({
                        className: 'p-5',
                        title: "Error!!",
                        description: '',
                    })
                    setIsLoading(false)
                    console.error(error);
                }
            }
        }
    }


    useEffect(() => {
        if ((wallet.accounts.length > 0) && parseInt(wallet.chainId) == CHAIN_ID) {
            if (canvasRef.current && hasGenerated.current == 0) {
                generateCanvas();
                hasGenerated.current = 1
            }
            getPixelBalance(wallet.accounts[0])
        }
    }, [wallet, canvasRef.current]);

    useEffect(() => {
        hasGenerated.current = 0
    }, []);

    return (
        <div className="container px-5 md:px-20 lg:px-60  mx-auto flex flex-col gap-5 my-5">
            <div className={'z-[1000] fixed top-5 left-5'}>
                <ModeToggle/>
            </div>
            <Card className={'p-5 relative'}>
                <Button asChild>
                    <Link className={'absolute top-12 left-1 md:top-5 md:left-5'} to={'/'}>
                        <div className={'flex align-middle justify-center'}>
                            <HomeIcon size={'15px'}/>
                        </div>
                        <div className={'ms-2 hidden md:block'}>Home</div>
                    </Link>
                </Button>
                <div>
                    <img id={'chain-logo'} className={'mx-auto w-[100px]'} src={Logo} alt={''}/>
                    <h3 className={'text-2xl font-bold text-center mt-3'}>
                        EOS Pixels - Mint page
                    </h3>
                </div>
            </Card>

            <Card className={'p-5 flex-wrap flex align-middle justify-between gap-2'}>
                {!wallet.accounts[0] && hasProvider &&
                    <Button className={'mt-2'} onClick={connectMetaMask}>
                        Connect Metamask
                        <WalletIcon className={'ms-2 w-4 h-4'}/>
                    </Button>
                }

                {!hasProvider &&
                    <Badge className={'w-max text-sm h-min my-auto'}>
                        MetaMask not available
                    </Badge>
                }
                {wallet.accounts.length > 0 &&
                    <div className={'flex flex-col align-middle justify-start'}>
                        <div className={'flex align-middle gap-2 my-auto'}>
                            <Badge className={'w-max text-sm h-min my-auto me-auto'}>
                                Wallet: {`${wallet.accounts[0]?.substr(0, 10)}...${wallet.accounts[0]?.substr(-10)}`}
                            </Badge>
                            <Button
                                className={'w-min h-min p-1 m-0'}
                                onClick={() => copy(wallet.accounts[0])} variant="outline"
                            >
                                <CopyIcon className="h-4 w-4"/>
                            </Button>
                        </div>
                        <div className="flex flex-col gap-5 justify-center me-auto align-middle">
                            {wallet.accounts.length > 0 && parseInt(wallet.chainId) === CHAIN_ID &&
                                <Badge variant={'secondary'} className={'w-max text-sm mx-auto mt-2'}>
                                    EOS Pixels balance: {balance} NFTs
                                </Badge>
                            }
                        </div>
                    </div>
                }
                <Button asChild className={'w-max'}>
                    <Link className="button" to="/gallery">
                        Go to gallery
                        <ImageIcon className={'ms-2 w-4 h-4'}/>
                    </Link>
                </Button>
            </Card>

            {!wallet.accounts[0] && hasProvider &&
                <Alert className={'bg-amber-50 text-yellow-600 dark:bg-amber-600 dark:text-white'}>
                    <AlertTitle>
                        Please connect Metamask wallet !
                    </AlertTitle>
                </Alert>
            }

            {wallet.accounts.length > 0 && hasProvider && parseInt(wallet.chainId) !== CHAIN_ID &&
                <Alert className={'bg-amber-50 text-yellow-600 dark:bg-amber-600 dark:text-white'}>
                    <AlertTitle>
                        Incorrect network !
                    </AlertTitle>
                    <AlertDescription>
                        Please switch to EOS EVM Mainnet!
                    </AlertDescription>
                </Alert>
            }

            {hasProvider && wallet.accounts.length > 0 && parseInt(wallet.chainId) === CHAIN_ID &&
                <Card className={'p-5'}>
                    <canvas className={'rounded-md mx-auto mb-5'} ref={canvasRef} height={500} width={500}/>

                    <div className={'w-[500px] mx-auto'}>
                        <Label htmlFor="">
                            Colors range [from 2 to 15]:
                        </Label>
                        <Slider
                            value={colorRange}
                            onValueChange={setColorRange}
                            className={'my-3'}
                            step={1}
                            max={15}
                            min={2}
                        />

                        <Label htmlFor="">
                            Pixel size [from 15 to 20]:
                        </Label>

                        <Slider
                            value={pixelSize}
                            onValueChange={setPixelSize}
                            max={30} min={15} step={1}
                            className={'my-3'}
                        />
                    </div>

                    <div className={'flex align-middle justify-center gap-5 mt-5 mx-auto'}>
                        <Button onClick={generateCanvas}>
                            Generate new Pixel Art
                        </Button>
                        <Button disabled={isLoading} onClick={loadEvents}>
                            {isLoading &&
                                <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin"/>
                            }
                            Mint this Pixel Art!
                        </Button>
                    </div>

                    <div id="resultMint"></div>
                </Card>
            }
        </div>
    );
};

export default Mint;