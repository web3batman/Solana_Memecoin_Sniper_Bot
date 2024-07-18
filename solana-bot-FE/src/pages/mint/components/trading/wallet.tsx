import { connection } from '../../../../config/index'
import { useApp } from '../../../../context/appContext'
import { useSocket } from '../../../../context/socketContext'
import { autoBuy, autoSell, refundSol, setOption, swaptokens } from '../../../../services/wallet'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import React, { useEffect, useState } from 'react'
import { ClapSpinner } from 'react-spinners-kit'
import PasteIcon from './paste.png'
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';

export interface IWalletInfo {
  buy1: number
  buy2: number
  buyTime: number
  buying: boolean
  sell1: number
  sell2: number
  sellTime: number
  selling: boolean
  slippage: number
  pubkey: string
}

interface Props {
  num: number,
  info: IWalletInfo,
}

const Wallet: React.FC<Props> = ({ num, info }) => {
  const [solBalance, setSolBalance] = useState<number>(0)
  const [tknBalance, setTknBalance] = useState<number>(0)
  const [buySol, setBuySol] = useState<number>(0.01)
  const [sellPercentage, setSellPercentage] = useState<number>(50)
  const [walletInfo, setWalletInfo] = useState<IWalletInfo>({ buy1: 0, buy2: 0, buyTime: 0, buying: false, sell1: 0, sell2: 0, sellTime: 0, selling: false, slippage: 0, pubkey: '0' })
  const [buyLoading, setBuyLoading] = useState<boolean>(false)
  const [sellLoading, setSellLoading] = useState<boolean>(false)
  const [refundLoading, setRefundLoading] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const { poolId, flag, setFlag } = useApp()

  const { socket } = useSocket()

  socket.on(`autobuying${num}`, async () => {
    console.log('autobuying')
    setFlag(!flag)
  })

  socket.on(`autoselling${num}`, async () => {
    console.log('autoselling')
    setFlag(!flag)
  })

  const { mintAddr } = useApp()

  const main = async () => {
    setWalletInfo(info)
    const solAmt = (await connection.getBalance(new PublicKey(info.pubkey))) / LAMPORTS_PER_SOL
    setSolBalance(solAmt)
    const ata = await getAssociatedTokenAddress(new PublicKey(mintAddr), new PublicKey(info.pubkey))
    const bal = await connection.getTokenAccountBalance(ata)
    setTknBalance(bal.value.uiAmount ? bal.value.uiAmount : 0)
  }

  useEffect(() => {
    console.log('init walletInfo', walletInfo)
    main()
  }, [mintAddr])

  useEffect(() => {
    (async () => {
      const solAmt = (await connection.getBalance(new PublicKey(info.pubkey))) / LAMPORTS_PER_SOL
      setSolBalance(solAmt)
      const ata = await getAssociatedTokenAddress(new PublicKey(mintAddr), new PublicKey(info.pubkey))
      const bal = await connection.getTokenAccountBalance(ata)
      setTknBalance(bal.value.uiAmount ? bal.value.uiAmount : 0)
    })()
  }, [flag])

  const handleStartBuying = async () => {
    setWalletInfo({ ...walletInfo, buying: true })
    await autoBuy({ idx: num, option: { ...walletInfo, buying: true } })
  }

  const handleStopBuying = async () => {
    setWalletInfo({ ...walletInfo, buying: false })
    await autoBuy({ idx: num, option: { ...walletInfo, buying: false } })
  }

  const handleStartSelling = async () => {
    setWalletInfo({ ...walletInfo, selling: true })
    await autoSell({ idx: num, option: { ...walletInfo, selling: true } })
  }

  const handleStopSelling = async () => {
    setWalletInfo({ ...walletInfo, selling: false })
    await autoSell({ idx: num, option: { ...walletInfo, selling: false } })
  }

  const handleSell = async () => {
    setSellLoading(true)
    const ata = await getAssociatedTokenAddress(new PublicKey(mintAddr), new PublicKey(info.pubkey))
    const bal = await connection.getTokenAccountBalance(ata)
    await swaptokens({ idx: num, buyToken: 'quote', amountSide: 'send', amount: Math.floor(sellPercentage * Number(bal.value.amount) / 100 / Math.pow(10, bal.value.decimals)), slippage: 10 })
    setSellLoading(false)
    setFlag(!flag)
  }

  const handleBuy = async () => {
    setBuyLoading(true)
    await swaptokens({ idx: num, buyToken: 'base', amountSide: 'send', amount: buySol, slippage: 10 })
    setBuyLoading(false)
    setFlag(!flag)
  }

  const handleRefund = async () => {
    setIsModalOpen(false)
    setRefundLoading(true)
    await refundSol({ idx: num })
    setRefundLoading(false)
    setFlag(!flag)
  }

  const handleSetTradingOption = async () => {
    await setOption({ idx: num, option: walletInfo })
  }

  return (
    <div className='border-secondary grid grid-cols-12 m-[4px_8px_0] border rounded-md text-[20px]'>
      <div className='flex flex-col justify-between border-secondary col-span-6 m-1 px-2 border-r'>
        <div>wallet {num + 1}</div>
        <div>
          Address: {walletInfo?.pubkey}
        </div>
        <div className='flex items-center gap-2'>
          Sol Balance: <input className="bg-bright px-2 rounded-md w-[200px] text-primary" type="number" value={solBalance} readOnly />
          Token Balance: <input className="bg-bright px-2 rounded-md w-[200px] text-primary" type="number" value={tknBalance} readOnly />
        </div>
      </div>
      <div className='flex flex-col justify-between gap-1 border-secondary col-span-4 m-1 border-r'>
        <div className='flex items-center gap-1'>
          Buy:
          <input className="bg-bright px-2 rounded-md w-[80px] text-primary" type="number" value={walletInfo?.buy1} onChange={e => { setWalletInfo((walletInfo) => ({ ...walletInfo, buy1: Number(e.target.value) })) }} />~
          <input className="bg-bright px-2 rounded-md w-[80px] text-primary" type="number" value={walletInfo?.buy2} onChange={e => setWalletInfo((walletInfo) => ({ ...walletInfo, buy2: Number(e.target.value) }))} />SOL
          <input className={` ml-5 px-2 rounded-md w-[80px]  text-primary ${walletInfo.buying ? 'bg-secondary' : 'bg-bright'}`} disabled={walletInfo.buying} type="number" value={walletInfo?.buyTime} onChange={e => setWalletInfo((walletInfo) => ({ ...walletInfo, buyTime: Number(e.target.value) }))} />sec
        </div>
        <div className='flex items-center gap-1'>
          Sell:
          <input className="bg-bright px-2 rounded-md w-[80px] text-primary" type="number" value={walletInfo?.sell1} onChange={e => setWalletInfo((walletInfo) => ({ ...walletInfo, sell1: Number(e.target.value) }))} />~
          <input className="bg-bright px-2 rounded-md w-[80px] text-primary" type="number" value={walletInfo?.sell2} onChange={e => setWalletInfo((walletInfo) => ({ ...walletInfo, sell2: Number(e.target.value) }))} />SOL
          <input className={`bg-bright ml-5 px-2 rounded-md w-[80px]  text-primary ${walletInfo.selling ? 'bg-secondary' : 'bg-bright'}`} disabled={walletInfo.selling} type="number" value={walletInfo?.sellTime} onChange={e => setWalletInfo((walletInfo) => ({ ...walletInfo, sellTime: Number(e.target.value) }))} />sec
        </div>
        <div className='flex items-center gap-2'>
          {poolId ? !walletInfo.buying ?
            <button className="bg-green px-2 rounded-md" onClick={() => handleStartBuying()}>Start Auto Buying</button> :
            <button className="bg-warning px-2 rounded-md" onClick={() => handleStopBuying()}>Stop Auto Buying</button> : <></>}
          <img src={PasteIcon} className='bg-bright p-1 rounded-md w-[30px] cursor-pointer' onClick={handleSetTradingOption} />
          {poolId ? !walletInfo.selling ?
            <button className="bg-green px-2 rounded-md" onClick={() => handleStartSelling()}>Start Auto Selling</button> :
            <button className="bg-warning px-2 rounded-md" onClick={() => handleStopSelling()}>Stop Auto Selling</button> : <></>}
        </div>
      </div>
      <div className='flex flex-col justify-center gap-1 col-span-2 ml-1'>
        {poolId && <div className='flex items-center gap-1'>
          <input className="bg-bright px-2 rounded-md w-[80px] text-primary" type="number" value={buySol} onChange={e => setBuySol(Number(e.target.value))} />SOL
          <button className="flex justify-center items-center gap-3 bg-green px-3 rounded-md h-full" onClick={() => handleBuy()}>Buy<ClapSpinner size={20} loading={buyLoading} /></button>
        </div>}
        {poolId && <div className='flex items-center gap-1'>
          <input className="bg-bright px-2 rounded-md w-[80px] text-primary" type="number" value={sellPercentage} onChange={e => setSellPercentage(Number(e.target.value))} />%
          <button className="flex justify-center items-center gap-3 bg-warning px-3 rounded-md h-full" onClick={() => handleSell()}>Sell<ClapSpinner size={20} loading={sellLoading} /></button>
        </div>}
        <div className='flex items-center gap-1'>
          <button className="flex justify-center items-center gap-3 bg-sol px-3 rounded-md h-full" onClick={() => setIsModalOpen(true)}>Refund Sol<ClapSpinner size={20} loading={refundLoading} /></button>
        </div>
      </div>
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} center>
        <div className='p-5'>
          <div>
            Do you want to refund all sol to your main wallet?
          </div>
          <div className='flex justify-around gap-5 mt-5'>
            <button className="text-bright flex justify-center items-center gap-3 bg-sol p-3 rounded-md h-full" onClick={() => handleRefund()}>Refund Sol</button>
            <button className="text-bright flex justify-center items-center gap-3 bg-warning p-3 rounded-md h-full" onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Wallet