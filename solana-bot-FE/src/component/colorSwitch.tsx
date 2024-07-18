import { FC } from 'react'

interface Props {
    isSwitch: boolean
    handleSwitch: Function
}

export const ColorSwitch: FC<Props> = ({ isSwitch, handleSwitch }) => {
    return (
        <div className={isSwitch ? `border-bright shadow-[0_0_5px_5px_green] rounded-[50%] bg-green w-4 h-4 cursor-pointer` : `shadow-[0_0_5px_5px_red] border-bright  rounded-[50%] w-4 h-4 bg-warning cursor-pointer`} onClick={() => handleSwitch()}></div>

    )
}
