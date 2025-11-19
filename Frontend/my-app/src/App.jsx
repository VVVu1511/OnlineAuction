import { useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Header from './Component/Header/Header'
import Category from './Component/Category/Category'
import TopProducts from './Component/TopProducts/TopProducts'
import ProductCard from './Component/ProductCard/ProductCard'
import Register from './Component/Register/Register'
import ProductInfor from './Component/ProductInfor/ProductInfor'

function App() {
  
  return (
    <Routes>
      <Route path = "/" element={
        <>
          <Header />
          
          <div className="row">
            <div className="col-2"></div>

            <div className="col-8">
              <Category />
              <TopProducts />
            </div>

            <div className="col-2"></div>
          </div>
          
        </>
    } />

    <Route 
      path='/productTest'
      element={
        <>
          <ProductCard />
        </>
      }
    />

    <Route
      path='/login'
      element={
        <>
          <Register />
        </>
      }
    />

    <Route 
      path='/productInfor'
      element={
        <>
          <ProductInfor />
        </>
      }
    ></Route>

    </Routes>
  )
}

export default App
