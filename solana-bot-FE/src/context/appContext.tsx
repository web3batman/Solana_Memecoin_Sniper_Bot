import { ReactNode, createContext, useContext, useState } from "react";

// Define the shape of the context
export interface appContextProps {
  publicKey: string;
  setPublicKey: React.Dispatch<React.SetStateAction<string>>
  secretKey: string;
  setSecretKey: React.Dispatch<React.SetStateAction<string>>
  poolList: { poolId: string, poolState: string, buy: number, sell: number, buyTx: string, sellTx: string, name: string, symbol: string, image: string }[];
  setPoolList: React.Dispatch<React.SetStateAction<Array<{ poolId: string, poolState: string, buy: number, sell: number, buyTx: string, sellTx: string, name: string, symbol: string, image: string }>>>
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>
  wbalance: number;
  setWbalance: React.Dispatch<React.SetStateAction<number>>
  running: boolean
  setRunning: React.Dispatch<React.SetStateAction<boolean>>
  method: boolean
  setMethod: React.Dispatch<React.SetStateAction<boolean>>
  autoBuy: boolean
  setAutoBuy: React.Dispatch<React.SetStateAction<boolean>>
  connect: boolean
  setConnect: React.Dispatch<React.SetStateAction<boolean>>
  autoSell: boolean
  setAutoSell: React.Dispatch<React.SetStateAction<boolean>>
  price: number
  setPrice: React.Dispatch<React.SetStateAction<number>>
  jitoMode: boolean
  setJitoMode: React.Dispatch<React.SetStateAction<boolean>>
  flag: boolean
  setFlag: React.Dispatch<React.SetStateAction<boolean>>
  minSol: number
  setMinSol: React.Dispatch<React.SetStateAction<number>>
  maxSol: number
  setMaxSol: React.Dispatch<React.SetStateAction<number>>
  buyGasFee: number
  setBuyGasFee: React.Dispatch<React.SetStateAction<number>>
  sellGasFee: number
  setSellGasFee: React.Dispatch<React.SetStateAction<number>>
  showCount: number
  setShowCount: React.Dispatch<React.SetStateAction<number>>
  solAmount: number
  setSolAmount: React.Dispatch<React.SetStateAction<number>>
  jitoFee: number
  setJitoFee: React.Dispatch<React.SetStateAction<number>>
  profit: number
  setProfit: React.Dispatch<React.SetStateAction<number>>
  stopLoss: number
  setStopLoss: React.Dispatch<React.SetStateAction<number>>
  arbitrageAmt: number
  setArbitrageAmt: React.Dispatch<React.SetStateAction<number>>
  quoteToken: string;
  setQuoteToken: React.Dispatch<React.SetStateAction<string>>
  mintAddr: string;
  setMintAddr: React.Dispatch<React.SetStateAction<string>>
  poolId: string;
  setPoolId: React.Dispatch<React.SetStateAction<string>>
  baseVault: string;
  setBaseVault: React.Dispatch<React.SetStateAction<string>>
  quoteVault: string;
  setQuoteVault: React.Dispatch<React.SetStateAction<string>>
  baseToken: string;
  setBaseToken: React.Dispatch<React.SetStateAction<string>>
  arbitrage: boolean,
  setArbitrage: React.Dispatch<React.SetStateAction<boolean>>,
  arbitragePrivateKey: string,
  setArbitragePrivateKey: React.Dispatch<React.SetStateAction<string>>,
  arbitragePublicKey: string,
  setArbitragePublicKey: React.Dispatch<React.SetStateAction<string>>,
  arbitBalance: number,
  setArbitBalance: React.Dispatch<React.SetStateAction<number>>,
  arbitWBalance: number,
  setArbitWBalance: React.Dispatch<React.SetStateAction<number>>,
  delay: number,
  setDelay: React.Dispatch<React.SetStateAction<number>>,
  wallets: Array<any>,
  setWallets: React.Dispatch<React.SetStateAction<Array<any>>>,
}

// Create the User context
export const AppContext = createContext<appContextProps>({
  publicKey: "",
  setPublicKey: () => { },
  secretKey: "",
  setSecretKey: () => { },
  poolList: [],
  setPoolList: () => { },
  balance: 0,
  setBalance: () => { },
  wbalance: 0,
  setWbalance: () => { },
  running: false,
  setRunning: () => { },
  method: false,
  setMethod: () => { },
  autoBuy: false,
  setAutoBuy: () => { },
  connect: false,
  setConnect: () => { },
  autoSell: false,
  setAutoSell: () => { },
  price: 0,
  setPrice: () => { },
  jitoMode: false,
  setJitoMode: () => { },
  flag: false,
  setFlag: () => { },
  minSol: 0,
  setMinSol: () => { },
  maxSol: 0,
  setMaxSol: () => { },
  buyGasFee: 0,
  setBuyGasFee: () => { },
  sellGasFee: 0,
  setSellGasFee: () => { },
  showCount: 0,
  setShowCount: () => { },
  solAmount: 0,
  setSolAmount: () => { },
  jitoFee: 0,
  setJitoFee: () => { },
  profit: 0,
  setProfit: () => { },
  stopLoss: 0,
  setStopLoss: () => { },
  arbitrageAmt: 0,
  setArbitrageAmt: () => { },
  quoteToken: '',
  setQuoteToken: () => { },
  mintAddr: '',
  setMintAddr: () => { },
  poolId: '',
  setPoolId: () => { },
  baseVault: '',
  setBaseVault: () => { },
  quoteVault: '',
  setQuoteVault: () => { },
  baseToken: '',
  setBaseToken: () => { },
  arbitrage: false,
  setArbitrage: () => { },
  arbitragePrivateKey: '',
  setArbitragePrivateKey: () => { },
  arbitragePublicKey: '',
  setArbitragePublicKey: () => { },
  arbitBalance: 0,
  setArbitBalance: () => { },
  arbitWBalance: 0,
  setArbitWBalance: () => { },
  delay: 0,
  setDelay: () => { },
  wallets: [],
  setWallets: () => { },
});

// Create the User context provider component
export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [publicKey, setPublicKey] = useState<string>("");
  const [secretKey, setSecretKey] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [wbalance, setWbalance] = useState<number>(0);
  const [arbitrageAmt, setArbitrageAmt] = useState<number>(0);
  const [poolList, setPoolList] = useState<Array<{ poolId: string, poolState: string, buy: number, sell: number, buyTx: string, sellTx: string, name: string, symbol: string, image: string }>>([])
  const [running, setRunning] = useState<boolean>(false)
  const [method, setMethod] = useState<boolean>(false)
  const [connect, setConnect] = useState<boolean>(false)
  const [autoBuy, setAutoBuy] = useState<boolean>(false)
  const [autoSell, setAutoSell] = useState<boolean>(false)
  const [price, setPrice] = useState<number>(10)
  const [jitoMode, setJitoMode] = useState<boolean>(false)
  const [minSol, setMinSol] = useState<number>(1)
  const [maxSol, setMaxSol] = useState<number>(50)
  const [buyGasFee, setBuyGasFee] = useState<number>(2_000_000)
  const [sellGasFee, setSellGasFee] = useState<number>(4_000_000)
  const [showCount, setShowCount] = useState<number>(30)
  const [solAmount, setSolAmount] = useState<number>(0.01)
  const [jitoFee, setJitoFee] = useState<number>(0.01)
  const [profit, setProfit] = useState<number>(0.01)
  const [stopLoss, setStopLoss] = useState<number>(0.01)
  const [quoteToken, setQuoteToken] = useState<string>("");
  const [baseToken, setBaseToken] = useState<string>("So11111111111111111111111111111111111111112");
  const [arbitrage, setArbitrage] = useState<boolean>(false)
  const [arbitragePrivateKey, setArbitragePrivateKey] = useState<string>('')
  const [arbitragePublicKey, setArbitragePublicKey] = useState<string>('')
  const [arbitBalance, setArbitBalance] = useState<number>(0)
  const [arbitWBalance, setArbitWBalance] = useState<number>(0)
  const [delay, setDelay] = useState<number>(0)
  const [mintAddr, setMintAddr] = useState<string>("");
  const [poolId, setPoolId] = useState<string>("");
  const [baseVault, setBaseVault] = useState<string>("");
  const [quoteVault, setQuoteVault] = useState<string>("");
  const [wallets, setWallets] = useState<Array<any>>([])
  const [flag, setFlag] = useState<boolean>(false)


  return (
    <AppContext.Provider value={{ publicKey, setPublicKey, secretKey, setSecretKey, poolList, setPoolList, balance, setBalance, wbalance, setWbalance, running, setRunning, method, setMethod, connect, setConnect, autoSell, setAutoSell, price, setPrice, jitoMode, setJitoMode, autoBuy, setAutoBuy, minSol, setMinSol, maxSol, setMaxSol, solAmount, setSolAmount, buyGasFee, setBuyGasFee, sellGasFee, setSellGasFee, showCount, setShowCount, jitoFee, setJitoFee, profit, setProfit, stopLoss, setStopLoss, quoteToken, setQuoteToken, baseToken, setBaseToken, arbitrageAmt, setArbitrageAmt, arbitrage, setArbitrage, arbitragePrivateKey, setArbitragePrivateKey, arbitragePublicKey, setArbitragePublicKey, setArbitBalance, arbitBalance, setArbitWBalance, arbitWBalance, delay, setDelay, mintAddr, setMintAddr, wallets, setWallets, poolId, setPoolId, baseVault, setBaseVault, quoteVault, setQuoteVault, flag, setFlag }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);