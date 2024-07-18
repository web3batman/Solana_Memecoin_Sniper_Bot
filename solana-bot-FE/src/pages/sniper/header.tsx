import { useSocket } from "../../context/socketContext";
import { useApp } from "../../context/appContext";
import { unwrapSol } from "../../services/wallet";

export const Header = () => {
  const { publicKey, setPublicKey, balance, setBalance, wbalance, setWbalance, setRunning, setMethod, setConnect, setAutoSell, setPrice, setJitoMode, setAutoBuy, setMinSol, setMaxSol, setSolAmount, setBuyGasFee, setSellGasFee, setJitoFee, setProfit, setStopLoss, setArbitrage, setArbitrageAmt, setBaseToken, setQuoteToken, setArbitragePublicKey, arbitragePublicKey, setArbitBalance, arbitBalance, setArbitWBalance, arbitWBalance } = useApp()
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

  return (
    <div className="flex flex-col items-start bg-[#121212] mb-1 w-[100%] h-[100%]">
      <div className="bg-bright flex flex-row justify-between items-center mb-1 px-5 py-1 w-full text-[20px]">
        <div className="px-2 rounded-md select-none">Sniper Bot : Public Key</div>
        <div>{publicKey}</div>
        <div className="px-2 rounded-md select-none">SOL Balance</div>
        <div>{balance} SOL</div>
        <div className="px-2 rounded-md select-none">WSOL Balance</div>
        <div>{wbalance} SOL</div>
        <button className={`text-bright  bg-secondary p-[5px_20px] rounded-[10px]  transition-colors cursor-pointer `} onClick={async () => await unwrapSol()}>Convert WSOL to SOL</button>
      </div>

      <div className="bg-bright flex flex-row justify-between mb-1 px-5 py-1 w-full text-[20px]">
        <div className="px-2 rounded-md select-none">Arbitrage Bot : Public Key</div>
        <div>{arbitragePublicKey}</div>
        <div className="px-2 rounded-md select-none">SOL Balance</div>
        <div>{arbitBalance} SOL</div>
        <div className="px-2 rounded-md select-none">WSOL Balance</div>
        <div>{arbitWBalance} SOL</div>
      </div>
    </div >
  )
}
