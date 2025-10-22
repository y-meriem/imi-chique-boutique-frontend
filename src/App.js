import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import AddProduct from './Pages/Products/AddProduct';
import UpdateProduct from './Pages/Products/UpdateProduct';
import AllProducts from './Pages/Products/ProductsList';
import ProductDetail from './Pages/Products/ProductDetail';

import './index.css';

import CategoryList from './Pages/Category/CategoryList';
import AddCategory from './Pages/Category/AddCategory';
import UpdateCategory from './Pages/Category/UpdateCategory';


import Orders from './Pages/Orders/Orders';
import Statistics from './Pages/Orders/Statistics';


import AdminDelivery from './Pages/Livraison/AdminDelivery';


import Home from './Pages/Home';
import Checkout from './Pages/Checkout';

import PromoManagement from './Pages/CodePromo/PromoManagement';


import Register from './Pages/Users/Register';
import Login from './Pages/Users/Login';
import UserManagement from './Pages/Users/UserManagement';
import ResetPassword from './Pages/Users/ResetPassword';
import UserProfile from './Pages/Users/MyProfile';


import Favorites from './Pages/Favorites/Favorites';
import AvisManagement from './Pages/Avis/AvisManagement';
import MyAvis from './Pages/Avis/MyAvis';
import MesCommandes from './Pages/Orders/MyOrders';


function App() {
  return (
   <Router basename="/imi-chique-boutique-frontend">
     
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<ProtectedRoute  element={<Orders />} requiredRole="admin" />}  />
          <Route path="/statistics" element={<ProtectedRoute  element={<Statistics />} requiredRole="admin" />} />
          
          <Route path="/mes-commandes" element={<ProtectedRoute element={<MesCommandes />} />} />
          <Route path="/my-avis" element={<ProtectedRoute element={<MyAvis />} />} />

          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/profile" element={<ProtectedRoute element={<UserProfile />} />}/>


          <Route path="/user-management" element={<ProtectedRoute element={<UserManagement />} requiredRole="admin" />} />
          
          <Route path="/promo-management" element={<ProtectedRoute element={<PromoManagement />} requiredRole="admin" />} />
          <Route path="/livraisons"  element={<ProtectedRoute element={<AdminDelivery />} requiredRole="admin" />}/>
          <Route path="/avis-management" element={<ProtectedRoute element={<AvisManagement />} requiredRole="admin" />} />



          <Route path="/products/add" element={<ProtectedRoute element={<AddProduct />} requiredRole="admin" />} />
          <Route path="/products/edit/:id" element={<ProtectedRoute element={<UpdateProduct />} requiredRole="admin" />} />          
          <Route path="/products" element={<ProtectedRoute element={<AllProducts />} requiredRole="admin" />} />
            
             <Route path="/products/:id" element={<ProductDetail />} />

          <Route path="/categories"  element={<ProtectedRoute element={<CategoryList />} requiredRole="admin" />} />
          <Route path="/categories/add"  element={<ProtectedRoute element={<AddCategory />} requiredRole="admin" />} />
          <Route path="/categories/update/:id"  element={<ProtectedRoute element={<UpdateCategory />} requiredRole="admin" />} />



          <Route path="/favorites" element={<Favorites />} />


        </Routes>
      </div>
    </Router>
  );
}

export default App;
