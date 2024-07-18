import axios from 'axios'
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
interface Props {
    openModal: boolean,
    setOpenModal: Dispatch<SetStateAction<boolean>>
    url: string
}
export const DetailModal: React.FC<Props> = ({ setOpenModal, url }) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [pairInfo, setPairInfo] = useState<any>({})

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getInfo()
    }, [])

    const getInfo = async () => {
        try {
            const res = (await axios.get(url)).data.pair
            if (!('pairAddress' in res)) setOpenModal(false)
            setPairInfo(res)
            setLoading(true)
        } catch (e) {
            setOpenModal(false)
        }
    }

    return (
        <div className='top-0 left-0 fixed flex justify-center items-center backdrop-blur-md w-[100vw] h-[100vh]' onClick={(e) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) setOpenModal(false)
        }}>
            {loading ? <div className='bg-bright flex flex-col border-4 border-secondary p-3 rounded-md hover:cursor-none' ref={modalRef}>
                <div>- Pair Address: {pairInfo.pairAddress}</div>
                <div>- Base Token
                    <div className='pl-3'>
                        Address: {pairInfo.baseToken.address}<br />
                        Name: {pairInfo.baseToken.name}<br />
                        Symbol: {pairInfo.baseToken.symbol}<br />
                    </div>
                </div>
                <div>- Quote Token
                    <div className='pl-3'>
                        Address: {pairInfo.quoteToken.address}<br />
                        Name: {pairInfo.quoteToken.name}<br />
                        Symbol: {pairInfo.quoteToken.symbol}<br />
                    </div>
                </div>
                <div>
                    - Price: {pairInfo.priceNative} SOL / {pairInfo.priceUsd} USD
                </div>
                <div>
                    <div className='flex justify-between'>
                        <div>- Transaction Count (buy / sell) </div>
                        <div>Volume </div>
                        <div>Price Change</div>
                    </div>
                    <div className='pl-3'>
                        <div className='flex justify-between'>
                            <div> 5 min</div>
                            <div>{pairInfo.txns.m5.buys} / {pairInfo.txns.m5.sells}</div>
                            <div>{pairInfo.volume.m5}</div>
                            <div>{pairInfo.priceChange.m5} %</div>
                        </div>
                        <div className='flex justify-between'>
                            <div>1 hour</div>
                            <div>{pairInfo.txns.h1.buys} / {pairInfo.txns.h1.sells}</div>
                            <div>{pairInfo.volume.h1}</div>
                            <div>{pairInfo.priceChange.h1} %</div>
                        </div>
                        <div className='flex justify-between'>
                            <div>6 hour</div>
                            <div>{pairInfo.txns.h6.buys} / {pairInfo.txns.h6.sells}</div>
                            <div>{pairInfo.volume.h6}</div>
                            <div>{pairInfo.priceChange.h6} %</div>
                        </div>
                        <div className='flex justify-between'>
                            <div>24 hour</div>
                            <div>{pairInfo.txns.h24.buys} / {pairInfo.txns.h24.sells}</div>
                            <div>{pairInfo.volume.h24}</div>
                            <div>{pairInfo.priceChange.h24} %</div>
                        </div>
                    </div>
                </div>
                <div>
                    - Liquidity
                    <div className='pl-3'>
                        USD: {pairInfo.liquidity.usd} <br />
                        Base Token: {pairInfo.liquidity.base}<br />
                        Quote Token: {pairInfo.liquidity.quote}<br />
                    </div>
                </div>
                <div>
                    - Pool created at: {new Date(Number(pairInfo.pairCreatedAt)).toString()}
                </div>
            </div> : <></>}
        </div>
    )
}

