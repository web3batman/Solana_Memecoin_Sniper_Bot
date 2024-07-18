import React from 'react'

interface Props {
    key: number,
    val: { poolId: string, poolState: string, buy: number, sell: number, buyTx: string, sellTx: string, name: string, symbol: string, image: string },
    setOpenModal: (value: React.SetStateAction<boolean>) => void,
    setModal: (value: React.SetStateAction<string>) => void,
    handleBuy: (poolId: string) => Promise<void>,
    handleSell: (poolId: string) => Promise<void>
}

const PoolInfo: React.FC<Props> = ({ key, val, setOpenModal, setModal, handleBuy, handleSell }) => {

    return (
        <div key={key} className="p-[8px_8px_0_8px]">
            <span className="inline-block bg-bright rounded-md w-[100%] transition-all">
                <div className="flex flex-col gap-1">
                    <a href={`https://solscan.io/account/${val.poolState}`} className="flex justify-between hover:bg-secondary px-2 rounded-md text-primary transition-colors" target="_blank"><div>Name: {val.name}</div><div> Symbol: {val.symbol}</div>
                        {/* <div className='flex items-center gap-2'>Image: <a href={val.image} target='_blank'><img src={val.image} className='inline w-[20px] h-[20px]' /></a></div> */}
                    </a>
                    <div className="text-bright flex items-center gap-2 pr-2 pb-1">
                        <button className="bg-secondary ml-2 px-1 rounded-[4px] text-[black] transition-all" onClick={() => {
                            setOpenModal(true)
                            setModal(`https://api.dexscreener.com/latest/dex/pairs/solana/${val.poolId}`)
                        }}>Detail</button>
                        <div className="bg-sol px-1 rounded-[4px] text-center cursor-pointer" onClick={() => handleBuy(val.poolId)}>Buy</div>
                        <div className="bg-warning px-1 rounded-[4px] text-center cursor-pointer" onClick={() => handleSell(val.poolId)}>Sell</div>
                        {/* {(val.buy == 2 && (val.sell == 0 || val.sell == 3)) && <div className="bg-warning px-1 rounded-[4px] text-center cursor-pointer" onClick={() => handleSell(val.poolId)}>Sell</div>} */}
                        <div className="bg-primary w-1 h-6"></div>
                        {val.buy != 0 ? val.buy == 1 ? <div className="bg-sol px-1 rounded-[4px] text-center">Buying...</div> : val.buy == 2 ? <div className="bg-green px-1 rounded-[4px] text-center">Bought</div> : <div className="bg-warning px-1 rounded-[4px] text-center">Bought Failed</div> : <></>}
                        {val.sell != 0 ? val.sell == 1 ? <div className="bg-sol px-1 rounded-[4px] text-center">Selling...</div> : val.sell == 2 ? <div className="bg-green px-1 rounded-[4px] text-center">Sold</div> : <div className="bg-warning px-1 rounded-[4px] text-center">Sold Failed</div> : <></>}
                    </div>
                </div>
            </span>
        </div>
    )
}

export default PoolInfo