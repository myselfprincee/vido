import Link from 'next/link'
import React, { FC } from 'react'

const Navbar: FC = () => {
    return (
        <nav className='flex justify-between py-4 px-8'>
            <p>VIDO</p>

            <ul className='flex *:px-6'>
                <li>Features</li>
                <li>Pricing</li>
                <li>How to use</li>
            </ul>

            <button className='bg-blue-400 px-4 rounded-full cursor-pointer'>
                <Link href={"/start"}>Start</Link>
            </button>
        </nav>
    )
}

export default Navbar