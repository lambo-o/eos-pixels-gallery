import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Card} from "@/components/ui/card.tsx";
import {Link} from "react-router-dom";
import { Button } from "./ui/button";
import {LinkIcon} from "lucide-react";

type CollectionProps = { chain: any, collection: any, setCollections: any, collections: any }

export const Collection = ({
                               chain,
                               collection,
                               setCollections,
                               collections,
                           }: CollectionProps) => {

    const toggleClass = () => {
        setCollections(collections?.map((item: any) => {
            return item?.contract === collection?.contract ? {
                ...item,
                selected: !collection?.selected
            } : item
        }))
    }

    return <>
        <Card
            key={collection.contract}
            onClick={toggleClass}
            className="flex items-center space-x-2 p-3 cursor-pointer"
        >
            <Checkbox id="terms" checked={collection?.selected}/>
            <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                <div className={'ms-2 flex gap-2 flex-col'}>
                    <div className={"text-xl"}>
                        {chain === "eos" &&
                           <Button asChild className={'p-0 w-max'}>
                               <Link
                                   className={'p-1 h-min flex gap-2'}
                                   target="_blank"
                                   to={`https://explorer.evm.eosnetwork.com/token/${collection.contract.split("::")[0]}`}
                               >
                                   <div className={'font-bold'}>
                                       {collection.name}
                                   </div>
                                   [{collection.symbol}]
                                   <LinkIcon className={'w-4 h-4'}/>
                               </Link>
                           </Button>
                        }
                    </div>
                    <div>
                        NFTs count: {collection.count}
                    </div>
                </div>
            </label>
        </Card>
    </>
}

export default Collection
