import React from 'react'
import { Link } from 'react-router-dom'

interface Props {
    name: string,
    link: string
}

const NavBtn: React.FC<Props> = ({ name, link }) => {
    return (
        <Link to={`${link}`} className={`text-bright  bg-secondary p-[5px_20px] rounded-[10px]  transition-colors cursor-pointer `} onClick={() => { }} >{name}</Link>
    )
}

export default NavBtn