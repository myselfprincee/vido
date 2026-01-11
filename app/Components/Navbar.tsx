"use client";

import Link from 'next/link'
import React, { FC } from 'react'
import { useSession, signOut } from '@/app/lib/auth-client'

const Navbar: FC = () => {
    const { data: session, isPending } = useSession();

    return (
        <nav className='flex justify-between items-center py-4 px-8 bg-slate-950 text-white border-b border-slate-800'>
            <Link href="/" className='text-xl font-bold font-mono tracking-tighter'>VIDO</Link>

            <ul className='hidden md:flex items-center space-x-8 text-slate-400 text-sm'>
                <li className='hover:text-white transition cursor-pointer'>Features</li>
                <li className='hover:text-white transition cursor-pointer'>Pricing</li>
                <li className='hover:text-white transition cursor-pointer'>How to use</li>
            </ul>

            <div className='flex items-center gap-4'>
                {isPending ? (
                    <div className="w-20 h-8 bg-slate-800 animate-pulse rounded-full"></div>
                ) : session ? (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-300">Hi, {session.user.name.split(' ')[0]}</span>
                        <button
                            onClick={() => signOut()}
                            className='bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer'
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className='text-sm font-medium hover:text-blue-400 transition'
                        >
                            Login
                        </Link>
                        <Link
                            href="/signup"
                            className='bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded-full text-sm font-medium transition cursor-pointer shadow-lg shadow-blue-500/20'
                        >
                            Join Free
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar