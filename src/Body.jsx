import React from 'react'
import { Link } from 'react-router-dom'
import './body.css'


export default function Notfound() {
  return (
    <div>
          <header className="p-4 bg-gray-800 flex justify-between items-center flex-wrap">
      <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-white cursor-pointer" onClick={() => Refresh()}>Game Data Hub
          </h1>
          <div className="navbar flex flex-wrap justify-center space-x-4">
              <button className="nav-button text-white px-4 py-2 rounded-lg" id="stores-button">
                  Stores
                  <div className="dropdown hidden absolute bg-white text-black mt-2 rounded-lg shadow-lg"
                      id="stores-dropdown">
  
                  </div>
              </button>
              <button className="nav-button text-white px-4 py-2 rounded-lg stores-button" id="toggle-wishlist">
                  Favourites
              </button>
              <button className="nav-button text-white px-4 py-2 rounded-lg"><span id="email"></span></button>
              <Link to="/login"><button className="nav-button text-white px-4 py-2 rounded-lg">Profile</button></Link>
              
          </div>
      </div>

      <div className="flex-wrap items-center space-x-4 mt-4 sm:mt-0 w-full sm:w-auto">
          <input id="search-input" className="p-2 mb-4 rounded-lg text-black w-full sm:w-64" type="text"
              placeholder="Search games..."/>
          <div id="slider-container" className="flex items-center space-x-2">
              <label for="price-slider" className="text-white">Max Price ($):</label>
              <input type="range" id="price-slider" min="0" max="100" value="30" step="1" className="w-full sm:w-auto"/>
              <span id="slider-value" className="text-white">30</span>$
          </div>
      </div>
  </header>



  <div className="main-content">
      <div className="container mx-auto p-4">


          <div id="wishlist-modal"
              className="wishlist-modal hidden fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="wishlist-content bg-gray-900 p-6 rounded-lg max-w-md w-full">
                  <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold">Your Wishlist</h2>
                      <button id="close-wishlist" className="text-red-500 font-bold text-xl">&times;</button>
                  </div>
                  <div id="wishlist" className="mt-4 max-h-60 overflow-y-auto">
           
                  </div>
              </div>
          </div>
          <div id="game-results" className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        
          </div>

          <section id="center-main" className="mb-4">
              <h2 className="text-2xl font-semibold mb-4">C</h2>
              <div id="center-carousel" className="carousel-container overflow-hidden">
                  <div className="carousel flex space-x-2">
                      
                  </div>
              </div>
          </section>


          <section id="featured-games" className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Featured Games</h2>
              <div id="games-grid-prices" className="">
                 
              </div>
              <div id="games-grid" className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
             
              </div>

          </section>

        
          <section id="multiplayer-games" className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Multiplayer Games</h2>
              <div id="multiplayer-carousel" className="carousel-container overflow-hidden">
                  <div className="carousel flex space-x-4">
                     
                  </div>
              </div>
          </section>

  
          <section id="ps5-games" className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">PlayStation 5 Games</h2>
              <div id="ps5-carousel" className="carousel-container overflow-hidden">
                  <div className="carousel flex space-x-4">
            
                  </div>
              </div>
          </section>

  
          <section id="action-games" className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Action Games</h2>
              <div id="action-carousel" className="carousel-container overflow-hidden">
                  <div className="carousel flex space-x-4">
                     
                  </div>
              </div>
          </section>

          <div className="api-section container mx-auto p-4">
              <section id="stores-section" className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Game Stores: </h2>
                  <div id="stores-grid"
                      className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    
                  </div>
              </section>

              <section id="game-search-section" className="mb-8"> </section>
          </div>
      </div>
  </div>
    </div>
  )
}
