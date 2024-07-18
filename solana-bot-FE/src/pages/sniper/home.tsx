import { useEffect, useState } from "react";
import { useSocket } from "../../context/socketContext";
import { useApp } from "../../context/appContext";
import { buyTokens, registerArbitWallet, registerWallet, sellTokens } from "../../services/wallet";
import { DetailModal } from "../../features/modal";
import { ColorSwitch } from "../../component/colorSwitch";
import PoolInfo from "../../features/poolInfo";
import { PublicKey } from "@solana/web3.js";
import { connection } from "../../config/index";
import axios from "axios";


export default function Home() {
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [modal, setModal] = useState<string>('')
  const [privateKey, setPrivateKey] = useState<string>('')
  const [selected, setSelected] = useState<string>('-')
  const [tokenBalance, setTokenBalance] = useState<number>(0)
  const [tokenList, setTokenList] = useState<Array<{ mint: string, ata: string, balance: number }>>([])

  const { publicKey, poolList, setPoolList, setBalance, setWbalance, running, connect, autoSell, jitoMode, autoBuy, minSol, setMinSol, maxSol, setMaxSol, solAmount, setSolAmount, buyGasFee, setBuyGasFee, sellGasFee, setSellGasFee, jitoFee, setJitoFee, profit, setProfit, stopLoss, setStopLoss, quoteToken, setQuoteToken, baseToken, setBaseToken, arbitrageAmt, setArbitrageAmt, arbitrage, arbitragePrivateKey, setArbitragePrivateKey, arbitragePublicKey, delay, setDelay } = useApp()

  const { socket } = useSocket()

  useEffect(() => {
    (async () => {
      if (selected == '-') setTokenBalance(0)
      else {
        const bal = await connection.getTokenAccountBalance(new PublicKey(selected))
        setTokenBalance(bal.value.uiAmount ?? 0)
      }
    })()

  }, [selected])

  socket.on('pools', (data: { pools: any[], balance: number, wsolBalance: number }) => {
    const temp = data.pools.map((val) => {
      return { poolId: val.poolId, poolState: val.poolState, buy: val.buy, sell: val.sell, buyTx: val.buyTx, sellTx: val.sellTx, name: val.name, symbol: val.symbol, image: val.image }
    });
    setPoolList(temp);
    setBalance(data.balance)
    setWbalance(data.wsolBalance)
  })

  socket.on('tokens', async (data) => {
    const tokenArr = []
    console.log('tokens')
    for (let i = 0; i < data.length; i++) {
      const balance = await connection.getTokenAccountBalance(new PublicKey(data[i].pubkey))
      if (balance.value.uiAmount && balance.value.uiAmount > 0) {
        tokenArr.push({ mint: data[i].accountInfo.mint.toString(), ata: data[i].pubkey.toString(), balance: balance.value.uiAmount })
      }
    }
    setTokenList(tokenArr)
    console.log('token list done')
  })

  const handleAutoSell = () => {
    socket.emit('autoSell', !autoSell)
  }

  const handleSellSet = () => {
    if (!connect) return
    if (profit <= 0 || stopLoss <= 0 || sellGasFee <= 0) alert('Please set sell options correctly')
    else socket.emit('sell_option', { profit: profit, sellGas: sellGasFee, stop: stopLoss, delay: delay })
  }

  const handleBuySet = () => {
    if (!connect) return
    if (solAmount <= 0 || buyGasFee <= 0) alert('Please set buy options correctly')
    else socket.emit('buy_option', { amount: solAmount, buyGas: buyGasFee })
  }

  const handleAutoBuy = () => {
    socket.emit('autobuy', !autoBuy)
  }

  const handleSell = async (poolId: string) => {
    await sellTokens({ poolId })
  }

  const handleManualSell = async () => {
    if (selected == '-') return
    const info = tokenList.find(item => item.ata == selected)
    const res = (await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${info?.mint}`)).data.pairs

    console.log('res', res)
    const data = res.filter((item: any) => item.dexId == 'raydium')
    const pairAddress = data[0].pairAddress
    console.log('pairAddress', pairAddress)
    await sellTokens({ poolId: pairAddress, tokenMint: info?.mint })

  }

  const handleBuy = async (poolId: string) => {
    await buyTokens({ poolId })
  }

  const handleJitoMode = () => {
    socket.emit('jitoMode', !jitoMode)
  }

  const handleJitoFee = () => {
    socket.emit('jitoFee', jitoFee)
  }

  const handleFilter = () => {
    if (minSol <= 0 || maxSol <= 0 || maxSol <= minSol) alert('Please set buy options correctly')
    socket.emit('filter', { min: minSol, max: maxSol })
  }

  const handleTracking = async () => {
    socket.emit('running', !running)
  }

  const handleArbitrage = async () => {
    socket.emit('arbitrage', !arbitrage)
  }

  const handleArbitrageOption = async () => {
    if (arbitrageAmt == 0 || baseToken == quoteToken || !baseToken || !quoteToken) {
      alert('please set arbitrage option correctly')
    }
    socket.emit('arbitrage_option', { baseToken: baseToken, quoteToken: quoteToken, arbitrageAmount: arbitrageAmt })
  }

  const handleRegister = async () => {
    if (privateKey) {
      await registerWallet({ privateKey })
      setPrivateKey('')
    }
  }

  const handleRegisterArbitrage = async () => {
    if (arbitragePrivateKey) {
      await registerArbitWallet({ privateKey: arbitragePrivateKey })
      setArbitragePrivateKey('')
    }
  }

  const tokenArr = [
    { "Select": "" },
    { SOL: "So11111111111111111111111111111111111111112" },
    { USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB" },
    { USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" }
  ]

  return (
    <div className="flex flex-col bg-[#121212] pr-[20px] pl-[50px] h-[calc(100vh_-_165px)]">
      <div className="pt-2 text-[#E9E1D0]">
        Recent Pools List
      </div>
      <div className="flex shadow-[0_0_8px_0_#E9E1D0] m-[12px_10px_40px_0] rounded-[8px] h-[calc(100vh_-_220px)]">
        <div className="border-secondary border-r-secondary min-w-[550px] max-w-[550px] min-h-[100px] overflow-y-auto">
          {poolList.map((val, idx) =>
            <PoolInfo key={idx} val={val} setOpenModal={setOpenModal} setModal={setModal} handleBuy={handleBuy} handleSell={handleSell} />)}
        </div>
        <div className="text-bright flex flex-col gap-2 p-2 border-l border-l-secondary w-full h-full overflow-y-auto">
          <div className="shadow-[0px_0px_8px_5px_#E9E1D0_inset] p-2 rounded-lg">
            <div className="flex flex-col w-full">
              <div className="flex justify-between items-center p-2 border-b-2 w-full">Sniper Bot : {publicKey}
                <div className="flex items-center gap-5">
                  <button className={`text-bright  bg-secondary p-[5px_20px] rounded-[10px]  transition-colors cursor-pointer ${privateKey ? 'hover:text-primary active:text-warning' : ''}`} onClick={() => handleRegister()} >Register Private Key</button>
                  <input className="bg-bright rounded-md text-[25px] text-primary" type="password" value={privateKey} onChange={(e) => { setPrivateKey(e.target.value) }} />
                </div>
              </div>
              <div className="mb-1 w-full">
                <div className="text-bright flex items-center gap-3 p-[12px_0_0_12px] w-full">
                  <div className="flex justify-between items-center gap-3"><ColorSwitch isSwitch={running} handleSwitch={handleTracking} />Pool Tracking : </div>
                  <div className="flex items-center gap-3">Min Size (SOL)
                    <input type="number" className="bg-bright p-[3px_6px] rounded-md w-[100px] text-primary" value={minSol} onChange={e => setMinSol(Number(e.target.value))} />
                  </div>
                  <div className="flex items-center gap-3">Max Size (SOL)
                    <input type="number" className="bg-bright p-[3px_6px] rounded-md w-[100px] text-primary" value={maxSol} onChange={e => setMaxSol(Number(e.target.value))} />
                  </div>
                  <button className="text-bright bg-secondary hover:bg-secondary mx-2 p-[3px_10px] rounded-md hover:text-primary active:text-warning transition-colors" onClick={() => handleFilter()}>Set</button>
                </div>
                <div className="text-bright flex items-center gap-3 p-[12px_0_0_12px] w-full">
                  <div className="flex justify-between items-center gap-3"><ColorSwitch isSwitch={jitoMode} handleSwitch={handleJitoMode} /> Jito Mode : </div>
                  <div className="flex justify-between gap-3">
                    <div className="flex items-center gap-3">Jito Fee (SOL)
                      <input type="number" className="bg-bright p-[3px_6px] rounded-md w-[100px] text-primary" value={jitoFee} onChange={e => { console.log(e.target.value); setJitoFee(Number(e.target.value)) }} />
                      (0.001 ~ 0.002)
                    </div>
                    <button className="text-bright bg-secondary hover:bg-secondary mx-2 p-[3px_10px] rounded-md hover:text-primary active:text-warning transition-colors" onClick={() => handleJitoFee()}>Set</button>
                  </div>
                </div>
                <div className="text-bright flex items-center gap-3 p-[12px_0_0_12px] w-full">
                  <div className="flex justify-between items-center gap-3"><ColorSwitch isSwitch={autoBuy} handleSwitch={handleAutoBuy} />Auto Buy : </div>
                  <div className="flex items-center gap-3">Amount
                    <input type="number" className="bg-bright p-[3px_6px] rounded-md w-[100px] text-primary" value={solAmount} onChange={e => setSolAmount(Number(e.target.value))} />
                  </div>
                  <div className="flex items-center gap-3">Fee mLarmports
                    <input type="number" className="bg-bright p-[3px_6px] rounded-md w-[100px] text-primary" value={buyGasFee} onChange={e => setBuyGasFee(Number(e.target.value))} />
                  </div>
                  <button className="text-bright bg-secondary hover:bg-secondary mx-2 p-[3px_10px] rounded-md hover:text-primary active:text-warning transition-colors" onClick={() => handleBuySet()}>Set</button>
                </div>
                <div className="text-bright flex items-center gap-3 p-[12px_0_0_12px] w-full">
                  <div className="flex justify-between items-center gap-3"><ColorSwitch isSwitch={autoSell} handleSwitch={handleAutoSell} />Auto Sell : </div>
                  <div className="flex items-center gap-3">Profit
                    <input type="number" className="bg-bright p-[3px_6px] rounded-md w-[100px] text-primary" value={profit} onChange={e => setProfit(Number(e.target.value))} />
                  </div>
                  <div className="flex items-center gap-3">Stop Loss
                    <input type="number" className="bg-bright p-[3px_6px] rounded-md w-[100px] text-primary" value={stopLoss} onChange={e => setStopLoss(Number(e.target.value))} />
                  </div>
                  <div className="flex items-center gap-3">Delay
                    <input type="number" className="bg-bright p-[3px_6px] rounded-md w-[100px] text-primary" value={delay} onChange={e => setDelay(Number(e.target.value))} />
                  </div>
                  <div className="flex items-center gap-3">Fee mLarmports
                    <input type="number" className="bg-bright p-[3px_6px] rounded-md w-[100px] text-primary" value={sellGasFee} onChange={e => setSellGasFee(Number(e.target.value))} />
                  </div>
                  <button className="text-bright bg-secondary hover:bg-secondary mx-2 p-[3px_10px] rounded-md hover:text-primary active:text-warning transition-colors" onClick={() => handleSellSet()}>Set</button>
                </div>
                <div className="text-bright flex items-center gap-3 p-[12px_0_0_12px] w-full">
                  Token List : <select className="bg-bright p-[3px_6px] rounded-md w-[300px] text-primary" onChange={(e) => {
                    setSelected(e.target.value)
                  }} >
                    <option value='-'>-</option>
                    {
                      tokenList.map((item, idx) => {
                        return <option value={item.ata} key={idx}>{item.mint}</option>
                      })
                    }
                  </select>
                  Balance : {tokenBalance}
                  <button className={`text-bright  bg-secondary p-[5px_20px] rounded-[10px]  transition-colors cursor-pointer ${privateKey ? 'hover:text-primary active:text-warning' : ''}`} onClick={() => handleManualSell()} >Sell All Tokens</button>
                </div>
              </div>
            </div>
          </div>
          <div className="shadow-[0px_0px_8px_5px_#E9E1D0_inset] p-2 rounded-lg">
            <div className="flex flex-col w-full">
              <div className="flex justify-between items-center p-2 border-b-2 w-full">Arbitrage Bot : {arbitragePublicKey}
                <div className="flex items-center gap-5">
                  <button className={`text-bright  bg-secondary p-[5px_20px] rounded-[10px]  transition-colors cursor-pointer ${arbitragePrivateKey ? 'hover:text-primary active:text-warning' : ''}`} onClick={() => handleRegisterArbitrage()} >Register Private Key</button>
                  <input className="bg-bright rounded-md text-[25px] text-primary" type="password" value={arbitragePrivateKey} onChange={(e) => { setArbitragePrivateKey(e.target.value) }} />
                </div>
              </div>
              <div className="mt-1 mb-1 w-full">
                <div className="text-bright flex items-center gap-3 p-[12px_0_0_12px] w-full">
                  <div className="flex justify-between items-center gap-3"><ColorSwitch isSwitch={arbitrage} handleSwitch={handleArbitrage} /></div>
                  <div className="flex items-center gap-3">Base Token
                    <select className="bg-bright p-[3px_6px] rounded-md w-[100px] text-primary" onChange={(e) => { setBaseToken(e.target.value); setQuoteToken('') }} value={baseToken} >
                      {tokenArr.map((item, index) => {
                        const name = Object.keys(item)[0]
                        // @ts-ignore
                        const value = item[name]
                        return (
                          <option key={index} value={value}>{name}</option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">Quote Token
                    <select className="bg-bright p-[3px_6px] rounded-md w-[100px] text-primary" onChange={(e) => { setQuoteToken(e.target.value); }} value={quoteToken} >
                      {tokenArr.map((item, index) => {
                        const name = Object.keys(item)[0]
                        // @ts-ignore
                        const value = item[name]
                        return (
                          <option key={index} value={value} disabled={value == baseToken}>{name}</option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">Amount
                    <input type="number" className="bg-bright p-[3px_6px] rounded-md w-[100px] text-primary" onChange={(e) => setArbitrageAmt(Number(e.target.value))} value={arbitrageAmt} />
                  </div>
                  <button className="text-bright bg-secondary hover:bg-secondary mx-2 p-[3px_10px] rounded-md hover:text-primary active:text-warning transition-colors" onClick={() => handleArbitrageOption()}>Set</button>
                </div>
                <div className="text-bright flex items-center gap-3 p-[12px_0_0_12px] w-full">
                  <div className="flex justify-between items-center gap-3"><ColorSwitch isSwitch={arbitrage} handleSwitch={handleArbitrage} /></div>
                  <div className="flex items-center gap-3">Base Token
                    <select className="bg-bright p-[3px_6px] rounded-md w-[100px] text-primary" onChange={(e) => { setBaseToken(e.target.value); setQuoteToken('') }} value={baseToken} >
                      {tokenArr.map((item, index) => {
                        const name = Object.keys(item)[0]
                        // @ts-ignore
                        const value = item[name]
                        return (
                          <option key={index} value={value}>{name}</option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">Amount
                    <input type="number" className="bg-bright p-[3px_6px] rounded-md w-[100px] text-primary" onChange={(e) => setArbitrageAmt(Number(e.target.value))} value={arbitrageAmt} />
                  </div>
                  <button className="text-bright bg-secondary hover:bg-secondary mx-2 p-[3px_10px] rounded-md hover:text-primary active:text-warning transition-colors" onClick={() => handleArbitrageOption()}>Set</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {openModal && <DetailModal openModal={openModal} setOpenModal={setOpenModal} url={modal} />}
    </div >
  );
}
