import { pinataAPIKey, pinataPublicURL } from "../../../../config/index";
import { createMarket, sendAllTokens, tokenLaunch, tokenMint } from "../../../../services/wallet";
import { PublicKey } from "@solana/web3.js";
import { useRef, useState } from "react";
import { ClapSpinner } from "react-spinners-kit";
import CheckMark from './check-mark.jpg'

export default function Mint() {
  const [name, setName] = useState<string>('name')
  const [symbol, setSymbol] = useState<string>('symbol')
  const [metaDataURL, setMetaDataURL] = useState<string>('')
  const [supply, setSupply] = useState<number | undefined>(1000000000)
  const [decimal, setDecimal] = useState<number | undefined>(9)
  const [tokenAmt, setTokenAmt] = useState<number | undefined>(500000000)
  const [solAmt, setSolAmt] = useState<number | undefined>(4)
  // const [launchTime, setLaunchTime] = useState<number>(0)
  const [counts, setCounts] = useState<number | undefined>(5)
  const [minPercent, setMinPercent] = useState<number | undefined>(10)
  const [maxPercent, setMaxPercent] = useState<number | undefined>(20)
  const [swapCounts, setSwapCounts] = useState<number | undefined>(2)
  const [solPerWallet, setSolPerWallet] = useState<number | undefined>(1)
  const [tokenPerWallet, setTokenPerWallet] = useState<number | undefined>(100000000)
  const [airdropwallet, setAirdropwallet] = useState<string>('')
  const [wallets, setWallets] = useState<Array<string>>([])
  const [airdropAmt, setAirdropAmt] = useState<number>(1000000)
  const [mintLoading, setMintLoading] = useState<boolean>(false)
  const [marketLoading, setMarketLoading] = useState<boolean>(false)
  const [sendLoading, setSendLoading] = useState<boolean>(false)
  const [launchLoading, setLaunchLoading] = useState<boolean>(false)
  const [uploadLoading, setUploadLoading] = useState<boolean>(false)
  const [isBurned, setIsBurned] = useState<boolean>(false)
  const [isFreeze, setIsFreeze] = useState<boolean>(false)

  const metaImg = useRef(null);

  const handleTokenMint = async () => {
    if (!name || !symbol || !supply || !decimal) return
    setMintLoading(true)
    console.log('metaDataURL', metaDataURL)
    const uploadedJsonUrl = await uploadJsonToPinata({
      name,
      symbol,
      image: metaDataURL
    })
    await tokenMint({ name, symbol, metaURI: pinataPublicURL + uploadedJsonUrl, supply, decimal })
    setMintLoading(false)
  }

  const handleCreateMarket = async () => {
    setMarketLoading(true)
    await createMarket()
    setMarketLoading(false)
  }

  const handleTokenLaunch = async () => {
    if (!tokenAmt || !solAmt || swapCounts == undefined || minPercent == undefined || maxPercent == undefined) return
    setLaunchLoading(true)
    await tokenLaunch({ tokenAmt, solAmt, swapCounts, minPercent, maxPercent, isBurned, isFreeze })
    setLaunchLoading(false)
  }

  const handleAddWallets = async () => {
    try {
      new PublicKey(airdropwallet)
      if (wallets.includes(airdropwallet)) return
      setWallets(wallets => [...wallets, airdropwallet])
      console.log(wallets)
    } catch (e) {

    }
  }

  const removeAirdrop = async (item: string) => {
    try {
      new PublicKey(item)
      setWallets(wallets => wallets.filter(val => val != item))
      console.log(wallets)
    } catch (e) {

    }
  }

  const handleSendAllTokens = async () => {
    try {
      if (tokenAmt == undefined || solAmt == undefined || counts == undefined || solPerWallet == undefined || tokenPerWallet == undefined) return
      setSendLoading(true)
      await sendAllTokens({ counts, solPerWallet, tokenPerWallet, wallets, airdropAmt })
      setSendLoading(false)
    } catch (e) {

    }
  }

  const handleSetMetaData = async (e: any) => {
    setUploadLoading(true)
    const data = e.target.files ? e.target.files[0] : null
    const imgData = new FormData();
    imgData.append("file", data);

    const imgRes = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pinataAPIKey}`,
        },
        body: imgData,
      }
    );

    const imgJsonData = await imgRes.json()

    setMetaDataURL(pinataPublicURL + imgJsonData.IpfsHash)
    setUploadLoading(false)
    console.log(pinataPublicURL + imgJsonData.IpfsHash)
  }

  const uploadJsonToPinata = async (jsonData: any) => {
    try {
      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            // Replace YOUR_PINATA_JWT with your actual JWT token
            Authorization: `Bearer ${pinataAPIKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pinataContent: jsonData,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Uploaded JSON hash:", data.IpfsHash);
      return data.IpfsHash;
    } catch (error) {
      console.error("Error uploading JSON to Pinata:", error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col bg-[#121212] pr-[20px] pl-[50px] h-[calc(100vh_-_165px)]">
      <div className="pt-2 text-[#E9E1D0]">
      </div>
      <div className="grid grid-cols-12 shadow-[0_0_8px_0_#E9E1D0] m-[12px_10px_40px_0] rounded-[8px] h-[calc(100vh_-_220px)]">
        <div className="text-bright border-secondary col-span-4 p-2 border-r-secondary h-full min-h-[100px] overflow-y-auto">
          <div className="shadow-[0px_0px_8px_5px_#E9E1D0_inset] p-2 rounded-lg">
            <div className="flex flex-col w-full h-full">
              <div className="flex justify-between items-center p-2 border-b-2 w-full">Token Mint Panel
              </div>
              <div className="flex items-center gap-3 p-3">
                Name :
                <input className="bg-bright px-2 rounded-md text-[25px] text-primary" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Token Name" />
              </div>
              <div className="flex items-center gap-3 p-3">
                Symbol :
                <input className="bg-bright px-2 rounded-md text-[25px] text-primary" type="text" value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="Token Symbol" />
              </div>
              <div className="flex items-center gap-3 p-3">
                Meta Data :
                <input className="bg-bright px-2 rounded-md text-[25px] text-primary" type="file" accept="image/*" name="myImage" ref={metaImg} onChange={e => {
                  handleSetMetaData(e)
                }} placeholder="Meta Data" /> <ClapSpinner loading={uploadLoading} />
              </div>
              <div className="flex items-center gap-3 p-3">
                Supply :
                <input className="bg-bright px-2 rounded-md text-[25px] text-primary" type="number" value={supply} onChange={e => setSupply(Number(e.target.value))} placeholder="Total Supply" />
              </div>
              <div className="flex items-center gap-3 p-3">
                Decimal :
                <input className="bg-bright px-2 rounded-md text-[25px] text-primary" type="number" value={decimal} onChange={e => setDecimal(Number(e.target.value))} placeholder="Token Decimal" />
              </div>
              <div className="flex justify-center gap-5 bg-sol m-2 p-2 rounded-lg cursor-pointer" onClick={() => handleTokenMint()}>Token Mint<ClapSpinner loading={mintLoading} />
              </div>
              <div className="flex justify-center gap-5 bg-sol m-2 p-2 rounded-lg cursor-pointer" onClick={() => handleCreateMarket()}>Create Market<ClapSpinner loading={marketLoading} />
              </div>
            </div>
          </div>
        </div>
        <div className="text-bright border-secondary grid col-span-8 p-2 border-r-secondary min-h-[100px] overflow-y-auto">
          <div className="h-full">
            <div className="grid grid-cols-12 shadow-[0px_0px_8px_5px_#E9E1D0_inset] p-2 rounded-lg w-full h-full">
              <div className="flex flex-col col-span-6 border-r-2 w-full">
                <div className="flex justify-between items-center p-2 border-b-2 w-full">Wallet Panel
                </div>
                <div className="flex items-center gap-3 p-3">
                  Wallet Counts :
                  <input className="bg-bright px-2 rounded-md text-[25px] text-primary" type="number" value={counts} onChange={e => setCounts(Number(e.target.value))} placeholder="Wallet counts" />
                </div>
                <div className="flex items-center gap-3 p-3">
                  Sol Amount :
                  <input className="bg-bright px-2 rounded-md text-[25px] text-primary" type="number" value={solPerWallet} onChange={e => setSolPerWallet(Number(e.target.value))} placeholder="Sol amount per wallet" />
                </div>
                <div className="flex items-center gap-3 p-3">
                  Token Amount :
                  <input className="bg-bright px-2 rounded-md text-[25px] text-primary" type="number" value={tokenPerWallet} onChange={e => setTokenPerWallet(Number(e.target.value))} placeholder="Token amount per wallet" />
                </div>
                <div className="flex items-center gap-3 p-3 border-t-2">
                  <input className="bg-bright px-2 rounded-md text-[25px] text-primary" type="text" value={airdropwallet} onChange={e => setAirdropwallet(e.target.value)} placeholder="Airdrop wallets" />
                  <button className="col-span-12 bg-green m-auto px-2 rounded-lg w-full text-[25px]" onClick={() => handleAddWallets()}>Add</button>
                </div>
                <div className="flex items-center gap-3 p-3">
                  Airdrop Amount: <input className="bg-bright px-2 rounded-md text-[25px] text-primary" type="number" value={airdropAmt} onChange={e => setAirdropAmt(Number(e.target.value))} placeholder="Airdrop amount" />
                </div>
                <div className="">
                  {wallets.map((item, idx) =>
                    <div className="flex border-1 my-1 ml-5 border-bright" key={idx}>
                      <div>{item}</div>
                      {item && <div className="inline bg-warning ml-2 rounded-md w-[30px] h-[30px] text-center cursor-pointer" onClick={() => removeAirdrop(item)}>X</div>}
                    </div>)}
                </div>
                <div className="flex justify-center gap-5 bg-green m-2 p-2 rounded-lg cursor-pointer" onClick={() => handleSendAllTokens()}>Send All<ClapSpinner loading={sendLoading} /></div>
              </div>
              <div className="flex flex-col col-span-6 w-full">
                <div className="flex justify-between items-center p-2 border-b-2 w-full">Token Launch Panel
                </div>
                <div className="flex items-center gap-3 p-3">
                  Token Amount :
                  <input className="bg-bright px-2 rounded-md text-[25px] text-primary" type="number" value={tokenAmt} onChange={e => setTokenAmt(Number(e.target.value))} placeholder="Token amount" />
                </div>
                <div className="flex items-center gap-3 p-3">
                  Sol Amount :
                  <input className="bg-bright px-2 rounded-md text-[25px] text-primary" type="number" value={solAmt} onChange={e => setSolAmt(Number(e.target.value))} placeholder="Sol amount" />
                </div>
                <div className="flex items-center gap-3 p-3">
                  Wallet Counts to swap tokens:
                  <input className="bg-bright px-2 rounded-md text-[25px] text-primary" type="number" value={swapCounts} onChange={e => setSwapCounts(Number(e.target.value))} placeholder="Token amount per wallet" />
                </div>
                <div className="flex items-center gap-3 p-3">
                  Sol Percentage Range:
                  <input className="bg-bright px-2 rounded-md w-[100px] text-[25px] text-primary" type="number" value={minPercent} onChange={e => setMinPercent(Number(e.target.value))} placeholder="Minimum percentage" />~
                  <input className="bg-bright px-2 rounded-md w-[100px] text-[25px] text-primary" type="number" value={maxPercent} onChange={e => setMaxPercent(Number(e.target.value))} placeholder="Maximum percentage" />
                </div>
                <div className="flex items-center gap-3 p-3">
                  Burn LP Token:
                  <div onClick={() => setIsBurned(!isBurned)} className="cursor-pointer select-none">
                    {isBurned ? <img src={CheckMark} className='rounded-sm w-5 h-5' /> : <div className='bg-[white] rounded-sm w-5 h-5'></div>}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3">
                  Token account freeze:
                  <div onClick={() => setIsFreeze(!isFreeze)} className="cursor-pointer select-none">
                    {isFreeze ? <img src={CheckMark} className='rounded-sm w-5 h-5' /> : <div className='bg-[white] rounded-sm w-5 h-5'></div>}
                  </div>
                </div>
                <div className="flex justify-center gap-5 bg-warning m-2 p-2 rounded-lg cursor-pointer" onClick={() => handleTokenLaunch()}>Launch<ClapSpinner loading={launchLoading} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
