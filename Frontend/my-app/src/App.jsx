import { useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Header from './Component/Header/Header'
import Category from './Component/Category/Category'
import TopProducts from './Component/TopProducts/TopProducts'
import ProductCard from './Component/ProductCard/ProductCard'
import Register from './Component/Register/Register'
import ProductInfor from './Component/ProductInfor/ProductInfor'
import Footer from './Component/Footer/Footer'
import Login from './Component/Login/Login'

function App() {
  
  return (
    <Routes>
      <Route path = "/" element={
        <>
          <div className='position-fixed w-100 z-3'>
            <Header />
          </div>
          
          <div className="row" style={{paddingTop: '100px'}}>
            <div className="col-2 bg-secondary-subtle"></div>

            <div className="col-8 mb-5 pt-4">
              <Category />
              <TopProducts />
            </div>

            <div className="col-2 bg-secondary-subtle"></div>
          </div>
          
          <Footer />
        </>
    } />

    <Route
      path="/register"
      element={
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '100vh', minWidth: '100vh' }}
        >
          <Register />
        </div>
      }
    />


    <Route
      path="/login"
      element={
          <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '100vh', minWidth: '100vh' }}
        >
          <Login />
        </div>    
      }
    />
        
    

    <Route 
      path='/productInfor'
      element={
        <>
          <Header />
          
          <div className="row">
            <div className="col-2 bg-secondary-subtle"></div>

            <div className="col-8">
              <ProductInfor />
            </div>

            <div className="col-2 bg-secondary-subtle"></div>
          </div>

          <Footer />
        </>
      }
    ></Route>

    </Routes>
  )
}

export default App
