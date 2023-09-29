import {useEffect, useState} from "react";
import eosPixel from '@/assets/collections/6.png';
import {Card} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Link} from "react-router-dom";
import {ModeToggle} from "@/components/ModeToggle.tsx";
import {Alert, AlertDescription, AlertTitle} from "./ui/alert.tsx";
import {SquareIcon} from "lucide-react";
import PomeloLogo from '../assets/pomelo.svg'
import {Badge} from "@/components/ui/badge.tsx";

const Roadmap = [
    'Find & add new NFT collections from EOS EVM;',
    'Increase the capacity of the 3D gallery;',
    'Add multiplayer feature;',
    'Ability to save the state of the gallery and share the link;',
    'Add background music;',
    'Improve UI/UX design;',
    'and other features;',
]

const imgExtensions = ["png", "png", "gif", "png", "png", "png", "gif", "png", "png"]

export const Home = () => {
    const [imageIndex, setImageIndex] = useState(1)
    const [currentImg, setCurrentImg] = useState(null)

    useEffect(() => {
        const a = setInterval(async () => {
            setImageIndex(prev => prev % 9 + 1)
        }, 1000)
        return () => clearInterval(a)
    }, [])

    useEffect(() => {
        const importImg = async () => {
            const img = await import(`../assets/collections/${imageIndex}.${imgExtensions[imageIndex - 1]}`)
            setCurrentImg(img.default)
        }
        if (imageIndex && imgExtensions && imageIndex) importImg()
    }, [imageIndex, imgExtensions, imageIndex]);

    return <>
        <div className="container px-5 md:px-20 lg:px-60  mx-auto flex flex-col gap-5 my-5">
            <div className={'z-[1000] fixed top-5 left-5'}>
                <ModeToggle/>
            </div>
            <Card className={'p-5 '}>
                <div className={'flex justify-center align-middle gap-5 flex-col-reverse md:flex-row'}>
                    <div className={'flex flex-col align-middle justify-center'}>
                        <h1 className={'text-3xl font-bold md:text-left text-center sm:text-center sm:mb-3'}>
                            EOS EVM Gallery 🎨
                        </h1>

                        <Alert variant="default" className={'shadow-md'}>
                            <AlertDescription className={'text-center md:text-left'}>
                                A 3D in-browser gallery that allows users to look at their
                                NFTs on <b>EOS EVM</b> in a new, interactive and entertaining way.
                            </AlertDescription>
                        </Alert>

                        <Button className={'mt-5 w-max mx-auto md:ms-0'}>
                            <Link to="/gallery">
                                Go to gallery
                            </Link>
                        </Button>
                    </div>

                    {currentImg &&
                        <img className={'h-[250px] object-contain rounded-sm'} src={currentImg} alt={''}></img>
                    }
                </div>
            </Card>

            <Card className={'p-5 '}>
                <div className={'flex justify-center align-middle gap-5 flex-col md:flex-row'}>
                    {currentImg &&
                        <img className={'h-[250px] object-contain rounded-sm'} src={eosPixel} alt={''}></img>
                    }
                    <div className={'flex flex-col align-middle justify-center'}>
                        <h1 className={'text-3xl font-bold md:text-right text-center sm:text-center sm:mb-3'}>
                            EOS Pixels
                        </h1>
                        <Alert variant="default" className={'shadow-md'}>
                            <AlertTitle className={'text-center md:text-right'}>Attention !</AlertTitle>
                            <AlertDescription className={'text-center md:text-left'}>
                                Since there are very few collections on the EOS EVM Mainnet, we created a
                                fun NFT collection without utility to show the functionality of the
                                gallery. You can mint for free (you need to pay only the transaction fee).
                            </AlertDescription>
                        </Alert>

                        <Button className={'mt-5 w-max mx-auto md:me-0'}>
                            <Link className={'w-max mx-auto'} to="/mint">
                                Mint free EOS Pixel
                            </Link>
                        </Button>
                    </div>
                </div>
            </Card>

            <Card className={'flex  flex-col align-middle justify-center p-5 gap-3'}>
                <center>
                    <h5 className={'text-2xl font-bold text-center mt-3'}>Project created for</h5>
                    <Badge className={'text-md font-medium text-center mt-2'}>"Pomelo Grants Season 7"</Badge>
                    <div className={'mt-3 flex justify-between'}>
                        <Link className={'w-auto mx-auto'} to="https://pomelo.io/grants" target="_blank">
                            <img className={'mx-auto'} src={PomeloLogo} alt={''}/>
                        </Link>
                    </div>
                </center>
            </Card>

            <Card className={'flex flex-col align-middle justify-center p-2 gap-3'}>
                <h3 className={'text-3xl font-bold text-center mt-3 '}>Future plans:</h3>

                <div className={'flex flex-col gap-2'}>
                    {Roadmap.map(item =>
                        <Alert className={'p-1'}>
                            <AlertDescription className={'shadow-sm p-2 flex align-middle gap-2 text-md'}>
                                <div>
                                    <SquareIcon className={'w-3'}/>
                                </div>
                                <div className={'text-md'}>
                                    {item}
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </Card>
        </div>
    </>
}

export default Home
