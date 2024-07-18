import { useApp } from '../../../../context/appContext'
import NavBtn from '../../components/header/navBtn'

const Header = () => {
  const { mintAddr, poolId } = useApp()
  return (
    <div className='bg-bright flex items-center gap-5 px-5 py-1 pb-1'>
      <NavBtn name='Pools' link='/token/pools' />
      <NavBtn name='Trading' link='/token/trading' />
      <div className='flex justify-between gap-5'>
        <div className='flex'>
          Token Id: <div className='text-bright bg-secondary ml-2 px-2 rounded-lg'>{mintAddr}</div>
        </div>
        <div className='flex'>
          {poolId && <>Pool Id: <div className='text-bright bg-secondary ml-2 px-2 rounded-lg'>{poolId}</div></>}
        </div>
      </div>
    </div>
  )
}

export default Header