import {useEffect, useMemo, useRef, useState} from "react";
import {initCanvasScene, showNft} from "./game/Objects.ts";
import {eosFetchCollections, eosFetchNfts} from "./game/Query.ts";
import CollectionSelectItem from "./Collection.tsx";
import eosLogo from "../assets/logo.png";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Dialog, DialogContent} from "@/components/ui/dialog.tsx";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import Loader from "@/components/Loader/Loader.tsx";
import {Card} from "@/components/ui/card.tsx";
import {useCopyToClipboard} from "@/hooks/useCopyToClipboard.ts";
import {CopyIcon, HomeIcon, LinkIcon} from "lucide-react";
import {Link} from "react-router-dom";
import {Separator} from "@radix-ui/react-select";
import {CollectionType} from "@/types/types.ts";
import {ModeToggle} from "@/components/ModeToggle.tsx";
import {Badge} from "./ui/badge.tsx";

const validRegEx = /^0x([A-Fa-f0-9]{40})$/;

const Gallery = () => {
    const canvasRef = useRef(null);
    const [nftSearchFinished, setNftSearchFinished] = useState<boolean>(false)
    const [nfts, setNfts] = useState<any[]>([])
    const [collectionsSearchFinished, setCollectionsSearchFinished] = useState<boolean>(false)
    const [collections, setCollections] = useState<CollectionType[]>([])
    const [gameActive, setGameActive] = useState(false)
    const [inputAddress, setInputAddress] = useState<string>('')
    const [inputAddressError, setInputAddressError] = useState<string>('')
    const [address, setAddress] = useState<string>('')
    const [loading, setLoading] = useState<any>(0)
    const [loadingText, setLoadingText] = useState<string>('')
    const [_, copy] = useCopyToClipboard()
    const [isOpenNftModal, setIsOpenNftModal] = useState(false)
    const [selectedNft, setSelectedNft] = useState<any | null>(null)
    // @ts-ignore
    const [isIntersected, setIsIntersected] = useState(false)

    let engine: any = null
    let scene: any = null

    const handlerDisconnect = () => window.location.reload();

    const totalSelected: {
        selectedCollections: CollectionType[],
        totalNfts: number
    } = useMemo(() => {
        let sum: number = 0;
        const selectedCollections = collections?.filter(collection => {
            if (collection?.selected) sum += parseInt(collection?.count)
            return collection?.selected === true
        })
        return {
            selectedCollections: selectedCollections,
            totalNfts: sum
        }
    }, [collections])

    const handlerSearchByAddress = (e: any) => {
        e.preventDefault();
        if (!inputAddress.trim()) {
            setInputAddressError('Please insert a EOS EVM wallet address!')
        } else if (!validRegEx.test(inputAddress.trim())) {
            setInputAddressError('Invalid EOS EVM address')
        } else {
            let address = inputAddress.trim()
            setAddress(address)
            setLoading(true)
            setLoadingText("Searching collections...")
            eosFetchCollections(setCollections, setCollectionsSearchFinished, address).then(() => {
                setLoading(false)
                setLoadingText("")
            })
        }
    }

    useEffect(() => {
        initCanvasScene(engine, scene, canvasRef, setGameActive, setIsOpenNftModal, setSelectedNft, setIsIntersected)
    }, []);

    useEffect(() => {
        showNft(scene, nfts)
    }, [nfts]);

    return (
        <div className={'h-[100vh] overflow-hidden relative'}>
            <Dialog open={isOpenNftModal && selectedNft}>
                <DialogContent onClose={() => setIsOpenNftModal(false)}>
                    {selectedNft &&
                        <>
                            <img className={'mt-4'} src={selectedNft?.image}/>
                            <Badge variant={'secondary'} className={'text-xl w-max mx-auto'}>
                                {selectedNft?.name}
                            </Badge>
                            <div className={'flex justify-between'}>
                                <Button asChild className={'w-max '}>
                                    <Link
                                        className={'p-1 h-min flex gap-2'}
                                        target="_blank"
                                        to={`https://explorer.evm.eosnetwork.com/token/${selectedNft.contract}/instance/${selectedNft.id}/token-transfers`}
                                    >
                                        <div className={'font-bold'}>
                                            View last transfers
                                        </div>
                                        <LinkIcon className={'w-4 h-4'}/>
                                    </Link>
                                </Button>

                                <Button variant={'secondary'} onClick={() => setIsOpenNftModal(false)}
                                        className={'w-max'}>
                                    Close
                                </Button>
                            </div>
                        </>
                    }
                </DialogContent>
            </Dialog>
            <Dialog open={!gameActive}>
                <DialogContent withClose={false}>
                    <div className={'flex flex-col gap-2 absolute top-5 left-5'}>
                        <Button asChild>
                            <Link to={'/'}>
                                <div className={'flex align-middle justify-center'}>
                                    <HomeIcon size={'15px'} className={'me-2'}/>
                                </div>
                                <div>Home</div>
                            </Link>
                        </Button>
                        <ModeToggle/>
                    </div>
                    <div className="flex align-middle justify-center flex-col">
                        <img
                            className={'rounded-[50%] w-[50px] mb-[10px] mx-auto'}
                            src={eosLogo}
                            alt={''}
                        />
                        <h4 className={'font-bold text-center'}>
                            EOS Gallery
                        </h4>
                    </div>
                    <hr/>

                    {!collectionsSearchFinished && !loading && <>
                        <div className={'flex justify-between align-middle gap-2'}>
                            <Input
                                type="text"
                                id="fname"
                                placeholder='EOS EVM address [mainnet]'
                                onChange={(e: any) => {
                                    setInputAddressError('');
                                    setInputAddress(e.target.value)
                                }}
                            />
                            <Button
                                disabled={loading}
                                style={{marginLeft: '5px'}}
                                className={"button"}
                                onClick={handlerSearchByAddress}
                            >
                                Search
                            </Button>
                        </div>

                        {inputAddressError &&
                            <Alert variant={'destructive'} className={'bg-red-50 mt-3'}>
                                <AlertTitle>
                                    {inputAddressError}
                                </AlertTitle>
                            </Alert>
                        }
                    </>
                    }

                    {loading === true &&
                        <div className={'flex flex-col align-middle justify-center w-[100%]'}>
                            <div className={'flex align-middle justify-center w-[100%]'}>
                                <Loader/>
                            </div>
                            <div className={'text-center'}>
                                {loadingText}
                            </div>
                        </div>
                    }

                    {!loading && collectionsSearchFinished && !nftSearchFinished
                        && <div>
                            {collections.length === 0
                                ? <Alert className={'font-bold mb-2'}>
                                    <AlertDescription>
                                        No collections found
                                    </AlertDescription>
                                </Alert>
                                : <>
                                    <h1 className={'font-bold text-2xl text-center'}>
                                        Collections found: {collections.length}
                                    </h1>

                                    <div className={'text-center text-md'}>
                                        <p>Click and select the collections you want to see.</p>
                                    </div>

                                    <div className={"collection-container"}>
                                        {collections.map((collection, index) =>
                                            <CollectionSelectItem
                                                chain="eos"
                                                key={index} collections={collections}
                                                setCollections={setCollections}
                                                collection={collection}
                                            />
                                        )}
                                    </div>

                                    <Separator className={'my-3'}/>

                                    <div className='flex justify-between flex-col gap-3 w-100'>
                                        <Card className={'p-3 flex justify-between'}>
                                            <div className={'font-bold'}>Collections selected:</div>
                                            {totalSelected.selectedCollections.length}
                                        </Card>

                                        <Card className={'p-3 flex justify-between'}>
                                            <div className={'font-bold'}>NFTs selected:</div>
                                            {totalSelected.totalNfts}
                                        </Card>
                                    </div>

                                    {totalSelected.totalNfts > 40 &&
                                        <Alert variant={'destructive'} className={'bg-red-50 mt-3'}>
                                            <AlertTitle>Attention !</AlertTitle>
                                            <AlertDescription>
                                                At the moment, the capacity of the gallery is only 40 NFTs.
                                            </AlertDescription>
                                        </Alert>
                                    }
                                </>
                            }

                            <div className={'flex justify-center align-middle'}>
                                <Button
                                    className={"mt-2 w-max mx-auto"}
                                    onClick={() => {
                                        setLoading(true)
                                        setLoadingText(`Fetching NFTs data: 0 / ${totalSelected.totalNfts}`)
                                        eosFetchNfts(totalSelected.selectedCollections, totalSelected.totalNfts, setLoadingText, address, setNfts, setNftSearchFinished).then(() => {
                                            setGameActive(true)
                                            setLoading(false)
                                        })
                                    }}
                                >
                                    {collections.length ? "Fetch NFTs data" : "Join gallery"}
                                </Button>
                            </div>
                        </div>
                    }

                    {nftSearchFinished
                        && <div className={'flex justify-between'}>
                            <Button onClick={() => setGameActive(true)}>
                                Resume
                            </Button>
                            <Button
                                className={"w-max ms-[75px]"}
                                onClick={handlerDisconnect}
                            >
                                Try new address
                            </Button>
                        </div>
                    }
                </DialogContent>
            </Dialog>

            {gameActive &&
                <Card className="absolute bottom-2 right-2 w-[270px] p-1 flex flex-col gap-1">
                    <Alert className={'p-1 px-2'}>
                        <AlertDescription className={'font-bold'}>
                            <div className={'flex align-middle justify-between gap-2'}>
                                <div className={'my-auto'}>
                                </div>

                            </div>
                        </AlertDescription>

                        <AlertDescription>
                            <div className={'inline-block font-bold me-2'}>Wallet:{' '}</div>
                            <div className={'inline-block'}>
                                {`${address.slice(0, 10)}...${address.slice(-10)}`}
                            </div>
                            <Button
                                className={'w-min h-min p-1 m-0 '}
                                onClick={() => copy(address)} variant="outline"
                            >
                                <CopyIcon className="h-4 w-4"/>
                            </Button>
                        </AlertDescription>

                    </Alert>
                    <Alert className={'p-1 px-2'}>
                        <AlertDescription>
                            <div className={'inline-block font-bold me-2'}>Selected NFT collections:{' '}</div>
                            <div className={'inline-block'}>
                                {totalSelected.selectedCollections.length}
                            </div>
                        </AlertDescription>
                    </Alert>
                    <Alert className={'p-1 px-2'}>
                        <AlertDescription>
                            <div className={'inline-block font-bold me-2'}>NFTs:{' '}</div>
                            <div className={'inline-block'}>
                                {totalSelected.totalNfts} / 40 [max]
                            </div>
                        </AlertDescription>
                    </Alert>
                </Card>
            }
            <canvas ref={canvasRef}/>
        </div>
    );
};

export default Gallery;
