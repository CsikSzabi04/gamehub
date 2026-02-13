import React from 'react'
import { Link } from 'react-router-dom'
import { FaHome, FaGamepad } from 'react-icons/fa'

export default function Notfound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" data-aos="fade-up">
      <div className="text-center">
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" style={{WebkitTextStroke: '2px rgba(99, 102, 241, 0.3)'}}>
            404
          </h1>
          <FaGamepad className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl text-indigo-400 opacity-50" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8 text-lg">
          Oops! The page you're looking for seems to have wandered off into the gaming void.
        </p>
        <Link to="/" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-indigo-500/25">
          <FaHome className="mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
