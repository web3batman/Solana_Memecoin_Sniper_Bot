import { useSocket } from "../../context/socketContext";
import { useApp } from "../../context/appContext";
import NavBtn from "../../pages/mint/components/header/navBtn";

export const Header = () => {
  const { setPublicKey, setBalance, setWbalance, setRunning, setMethod, connect, setConnect, setAutoSell, setPrice, setJitoMode, setAutoBuy, setMinSol, setMaxSol, setSolAmount, setBuyGasFee, setSellGasFee, setJitoFee, setProfit, setStopLoss, setArbitrage, setArbitrageAmt, setBaseToken, setQuoteToken, setArbitragePublicKey, setArbitBalance, setArbitWBalance, setMintAddr, setWallets, setPoolId, setBaseVault, setQuoteVault } = useApp()
  const { socket } = useSocket()

  socket.on('process', async (data: any) => {
    setConnect(true)
    setRunning(data.running)
    setMethod(data.onceBuy)
    setPublicKey(data.pubKey)
    setAutoSell(data.autoSell)
    setAutoBuy(data.autoBuy)
    setPrice(data.price)
    setMinSol(data.minSize)
    setMaxSol(data.maxSize)
    setJitoMode(data.jitoMode)
    setSolAmount(data.amount)
    setBalance(data.balance)
    setWbalance(data.wsolBalance)
    setBuyGasFee(data.buyGas)
    setSellGasFee(data.sellGas)
    setProfit(data.profit)
    setStopLoss(data.stop)
    setJitoFee(data.jitoFee)
    setArbitrage(data.arbitrage)
    setArbitrageAmt(data.arbitrageAmount)
    setBaseToken(data.baseToken)
    setQuoteToken(data.quoteToken)
    setArbitragePublicKey(data.arbitPubKey)
    setArbitBalance(data.arbitBalance)
    setArbitWBalance(data.arbitWsolBalance)
  })

  socket.on('disconnect', async () => {
    setConnect(false)
    setRunning(false)
    setAutoSell(false)
    setAutoBuy(false)
    setRunning(false)
    setJitoMode(false)
    setArbitrage(false)
  })

  socket.on('minting', async (data) => {
    setMintAddr(data.tokenId)
    setWallets(data.wallets)
    setPoolId(data.poolId)
    setBaseVault(data.baseVault)
    setQuoteVault(data.quoteVault)
  })

  return (
    <div className="flex justify-between items-center bg-[#121212] w-[100%] h-[100%]">
      <div className="flex items-center gap-5 my-2 p-[8px_30px]">
        <div className={`shadow-[0_0_5px_5px_${connect ? 'green' : 'red'}] rounded-[50%] w-6 h-6`} style={{ backgroundColor: `${connect ? 'green' : 'red'}`, boxShadow: `${connect ? '0 0 5px 5px green' : '0 0 5px 5px red'}` }} />
        <div className="text-bright">Server Status</div>
      </div>
      <div className="flex items-center gap-5 px-5">
        <NavBtn name='Sniping Bot' link='/sniper' />
        <NavBtn name='Token Lanuchpad' link='/token/pools' />
      </div>
    </div >
  )
}
