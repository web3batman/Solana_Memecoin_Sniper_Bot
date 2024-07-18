import { connection } from "../../../../config/index";
import { useApp } from "../../../../context/appContext";
import Wallet from "../../../../pages/mint/components/trading/wallet";
import { removeLiquidity, swaptokens } from "../../../../services/wallet";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { ClapSpinner } from "react-spinners-kit";


const Trading = () => {
  const [mainToken, setMainToken] = useState<number>(0)
  const [sol, setSol] = useState<number>(0)
  const [baseAmt, setBaseAmt] = useState<number>(0)
  const [quoteAmt, setQuoteAmt] = useState<number>(0)
  const [sellTokenAmt, setSellTokenAmt] = useState<number>(0)
  const [mySellLoading, setMySellLoading] = useState<boolean>(false)
  const [removeLoading, setRemoveLoading] = useState<boolean>(false)
  const { wallets, mintAddr, publicKey, baseVault, quoteVault, flag, setFlag } = useApp()

  useEffect(() => {
    init()
  }, [flag, mintAddr, publicKey, wallets])

  const handleSellToekns = async () => {
    setMySellLoading(true)
    await swaptokens({ idx: -1, buyToken: 'quote', amountSide: 'send', amount: sellTokenAmt, slippage: 10 })
    setMySellLoading(false)
    setFlag(!flag)
  }

  const handleRemoveLiquidity = async () => {
    setRemoveLoading(true)
    await removeLiquidity()
    setRemoveLoading(false)
    setFlag(!flag)
  }

  const handleSetMax = async () => {
    setSellTokenAmt(mainToken)
  }

  const init = async () => {
    try {
      if (publicKey) {
        const sol = await connection.getBalance(new PublicKey(publicKey))
        setSol(sol / LAMPORTS_PER_SOL)
      }

      if (mintAddr && publicKey) {
        const ata = getAssociatedTokenAddressSync(new PublicKey(mintAddr), new PublicKey(publicKey))
        const balance = await connection.getTokenAccountBalance(new PublicKey(ata))
        setMainToken(Number(balance.value.uiAmount!))
      }

      if (baseVault) {
        const base = await connection.getTokenAccountBalance(new PublicKey(baseVault))
        setBaseAmt(Number(base.value.uiAmount!))
      }

      if (quoteVault) {
        const quote = await connection.getBalance(new PublicKey(quoteVault))
        setQuoteAmt(quote / LAMPORTS_PER_SOL)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex flex-col bg-[#121212] pr-[20px] pb-3 pl-[50px] h-[calc(100vh_-_165px)] text-[20px]">
      <div className="pt-2 text-[#E9E1D0]">
      </div>
      <div className="grid grid-cols-12 shadow-[0_0_8px_0_#E9E1D0] m-[12px_10px_40px_0] rounded-md" >
        <div className="text-bright border-secondary col-span-12 p-2 border-r-secondary h-[calc(100vh_-_220px)] min-h-[100px] overflow-y-auto">
          <div className="rounded-md h-full">
            <div className="flex flex-col w-full h-full">
              <div className="flex justify-between items-center pb-2 border-b-2 w-full">Trading Panel
              </div>
              <div className="flex flex-col gap-1">
                <div className="" >
                  <div className="pb-1">
                    My wallet:{publicKey}
                  </div>
                  <div className="flex gap-3">
                    <div className="inline text-bright">Token amount: {mainToken.toFixed(3)}</div>
                    <div className="inline text-bright">Sol amount: {sol.toFixed(3)}</div>:
                    <div className="flex items-center">
                      <input type="number" className="bg-bright px-2 rounded-md text-primary" value={sellTokenAmt} onChange={e => setSellTokenAmt(Number(e.target.value))} />
                      <div className="flex justify-center items-center gap-5 bg-sol mx-5 px-2 rounded-md cursor-pointer" onClick={() => handleSellToekns()}>Sell tokens<ClapSpinner loading={mySellLoading} /></div>
                      <div className="flex justify-center items-center gap-5 bg-warning px-2 rounded-md cursor-pointer" onClick={() => handleSetMax()}>Max</div>
                      <div className="flex justify-center items-center gap-5 bg-green mx-5 px-2 rounded-md cursor-pointer" onClick={() => handleRemoveLiquidity()}>Remove All Liquidity<ClapSpinner loading={removeLoading} /></div>
                    </div>
                  </div>
                </div>
                <div className="">Pool Status:
                  <div className="inline text-bright mx-5 px-2">Token Vault: {baseAmt.toFixed(3)}</div>
                  <div className="inline text-bright mx-5 px-2">Sol Vault: {quoteAmt.toFixed(3)}</div>
                </div>
              </div>
              {
                wallets && wallets.length && wallets.map((val, idx) =>
                  <Wallet num={idx} info={val} ></Wallet>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Trading