'use client';

import React from 'react';
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  emoji: string;
  category: string;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [signupForm, setSignupForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [activeTab, setActiveTab] = useState('login');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    emoji: '📱',
    category: 'electronics',
    description: '',
  });
  const [authError, setAuthError] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load data from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('marketplace_auth');
    const savedProducts = localStorage.getItem('marketplace_products');
    const savedCart = localStorage.getItem('marketplace_cart');

    if (savedAuth) {
      setAuthenticated(true);
      setUsername(savedAuth);
    }

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save products to localStorage
  useEffect(() => {
    if (authenticated) {
      localStorage.setItem('marketplace_products', JSON.stringify(products));
    }
  }, [products, authenticated]);

  // Save cart to localStorage
  useEffect(() => {
    if (authenticated) {
      localStorage.setItem('marketplace_cart', JSON.stringify(cart));
    }
  }, [cart, authenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');

    // Simulate login
    setTimeout(() => {
      if (loginForm.username && loginForm.password) {
        setAuthenticated(true);
        setUsername(loginForm.username);
        localStorage.setItem('marketplace_auth', loginForm.username);
        setLoginForm({ username: '', password: '' });
      } else {
        setAuthError('Please fill in all fields');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');

    if (signupForm.password !== signupForm.confirm) {
      setAuthError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Simulate signup
    setTimeout(() => {
      if (signupForm.username && signupForm.email && signupForm.password) {
        setAuthenticated(true);
        setUsername(signupForm.username);
        localStorage.setItem('marketplace_auth', signupForm.username);
        setSignupForm({ username: '', email: '', password: '', confirm: '' });
      } else {
        setAuthError('Please fill in all fields');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setUsername('');
    localStorage.removeItem('marketplace_auth');
    localStorage.removeItem('marketplace_products');
    localStorage.removeItem('marketplace_cart');
    setProducts([]);
    setCart([]);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      alert('Please fill in all fields');
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      emoji: newProduct.emoji,
      category: newProduct.category,
      description: newProduct.description,
    };

    if (editingProduct) {
      setProducts(products.map(p => (p.id === editingProduct.id ? { ...product, id: p.id } : p)));
      setEditingProduct(null);
    } else {
      setProducts([...products, product]);
    }

    setNewProduct({ name: '', price: '', emoji: '📱', category: 'electronics', description: '' });
    setShowModal(false);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleAddToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(id);
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      emoji: product.emoji,
      category: product.category,
      description: product.description,
    });
    setShowModal(true);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(`Order placed successfully with ${paymentMethod === 'credit-card' ? 'Credit Card' : paymentMethod === 'debit-card' ? 'Debit Card' : paymentMethod === 'paypal' ? 'PayPal' : 'Apple Pay'}! Total: $${totalPrice.toFixed(2)}`);
    setShowSuccessNotification(true);
    setCart([]);
    setShowCheckout(false);
    setShowCart(false);
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setShowSuccessNotification(false);
    }, 5000);
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const userInitial = username.charAt(0).toUpperCase();

  // Auth Screen
  if (!authenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 gradient-bg h-screen w-screen">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="card-gradient glow-effect rounded-2xl w-full max-w-md p-8 relative z-10 auth-form-enter">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏪</div>
            <h1 className="text-3xl font-bold text-white mb-2">Open Marketplace</h1>
            <p className="text-white/60">Join our collaborative platform</p>
          </div>

          <div className="toggle-tab">
            <button
              onClick={() => { setActiveTab('login'); setAuthError(''); }}
              className={`transition-all px-4 py-2 rounded-lg ${activeTab === 'login' ? 'active' : ''}`}
            >
              Login
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setAuthError(''); }}
              className={`transition-all px-4 py-2 rounded-lg ${activeTab === 'signup' ? 'active' : ''}`}
            >
              Sign Up
            </button>
          </div>

          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="login-username" className="block text-white/80 text-sm font-medium mb-2">
                  Username or Email
                </label>
                <input
                  type="text"
                  id="login-username"
                  className="input-field w-full px-4 py-3 rounded-xl text-white placeholder-white/40"
                  placeholder="Enter your username or email"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-white/80 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="login-password"
                  className="input-field w-full px-4 py-3 rounded-xl text-white placeholder-white/40"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <button
                type="submit"
                id="login-btn"
                className="btn-primary w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                <span>{isLoading ? 'Logging in...' : 'Login'}</span>
                {isLoading && <div className="loading-spinner"></div>}
              </button>
            </form>
          )}

          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label htmlFor="signup-username" className="block text-white/80 text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="signup-username"
                  className="input-field w-full px-4 py-3 rounded-xl text-white placeholder-white/40"
                  placeholder="Choose a username"
                  value={signupForm.username}
                  onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="signup-email" className="block text-white/80 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="signup-email"
                  className="input-field w-full px-4 py-3 rounded-xl text-white placeholder-white/40"
                  placeholder="Enter your email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-white/80 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="signup-password"
                  className="input-field w-full px-4 py-3 rounded-xl text-white placeholder-white/40"
                  placeholder="Create a password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="signup-confirm" className="block text-white/80 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="signup-confirm"
                  className="input-field w-full px-4 py-3 rounded-xl text-white placeholder-white/40"
                  placeholder="Confirm your password"
                  value={signupForm.confirm}
                  onChange={(e) => setSignupForm({ ...signupForm, confirm: e.target.value })}
                  required
                />
              </div>
              <button
                type="submit"
                id="signup-btn"
                className="btn-primary w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                <span>{isLoading ? 'Creating...' : 'Create Account'}</span>
                {isLoading && <div className="loading-spinner"></div>}
              </button>
            </form>
          )}

          {authError && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {authError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Product Modal
  if (showModal) {
    return (
      <div className="gradient-bg fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="modal-overlay absolute inset-0" onClick={() => setShowModal(false)}></div>
        <div className="relative max-w-lg w-full my-auto">
          <div className="card-gradient glow-effect rounded-2xl w-full p-4 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setShowModal(false); setEditingProduct(null); }}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleAddProduct} className="space-y-5">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Product Icon</label>
                <div className="flex flex-wrap gap-2">
                  {['📱', '💻', '👕', '👗', '👟', '🍔', '🍕', '☕', '💎'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewProduct({ ...newProduct, emoji })}
                      className={`emoji-option w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                        newProduct.emoji === emoji
                          ? 'bg-purple-500 border-purple-400'
                          : 'bg-white/5 border border-white/10 hover:border-purple-500'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Product Name</label>
                <input
                  type="text"
                  className="input-field w-full px-4 py-3 rounded-xl text-white placeholder-white/40"
                  placeholder="Enter product name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field w-full px-4 py-3 rounded-xl text-white placeholder-white/40"
                  placeholder="Enter price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Category</label>
                <select
                  className="input-field w-full px-4 py-3 rounded-xl text-white"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  <option value="electronics">🔌 Electronics</option>
                  <option value="clothing">👕 Clothing</option>
                  <option value="food">🍔 Food</option>
                  <option value="shoes">👟 Shoes</option>
                  <option value="accessories">💎 Accessories</option>
                  <option value="other">📦 Other</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
                <textarea
                  className="input-field w-full px-4 py-3 rounded-xl text-white placeholder-white/40 h-20"
                  placeholder="Enter product description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={!newProduct.name || !newProduct.price}
                className="btn-primary w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Checkout Modal
  if (showCheckout) {
    return (
      <div className="gradient-bg fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="modal-overlay absolute inset-0" onClick={() => setShowCheckout(false)}></div>
        <div className="relative max-w-lg w-full">
          <div className="card-gradient glow-effect rounded-2xl w-full p-6 sm:p-8 relative">
            <button
              onClick={() => setShowCheckout(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">Checkout</h2>

            <form onSubmit={handleCheckout} className="space-y-5">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">Order Summary</h3>
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-white/70 text-sm mb-2">
                    <span>{item.name} x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 mt-3 pt-3 flex justify-between text-white font-bold">
                  <span>Total:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">Payment Method</label>
                <div className="space-y-2">
                  {['credit-card', 'debit-card', 'paypal', 'apple-pay'].map(method => (
                    <label key={method} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-white payment-method-btn flex-1 px-4 py-2 rounded-lg border border-white/20 bg-white/5">
                        {method === 'credit-card' && '💳 Credit Card'}
                        {method === 'debit-card' && '💳 Debit Card'}
                        {method === 'paypal' && '🅿️ PayPal'}
                        {method === 'apple-pay' && '🍎 Apple Pay'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  className="input-field w-full px-4 py-3 rounded-xl text-white placeholder-white/40"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="input-field w-full px-4 py-3 rounded-xl text-white placeholder-white/40"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Address</label>
                <input
                  type="text"
                  className="input-field w-full px-4 py-3 rounded-xl text-white placeholder-white/40"
                  placeholder="Enter your address"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-buy w-full py-3 rounded-xl text-white font-semibold"
              >
                Complete Purchase
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main Marketplace View
  return (
    <div className="gradient-bg min-h-screen w-full">
      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed top-2 left-2 right-2 sm:top-6 sm:right-6 sm:left-auto z-50 notification-enter">
          <div className="card-gradient glow-effect rounded-2xl p-4 sm:p-6 max-w-md border border-green-500/50 bg-green-500/10 success-glow">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-3xl sm:text-4xl flex-shrink-0">✓</div>
              <div className="min-w-0">
                <h3 className="text-white font-bold text-base sm:text-lg">Payment Successful!</h3>
                <p className="text-green-300 text-xs sm:text-sm mt-1 break-words">{successMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="gradient-bg min-h-screen w-full">
      {/* Header */}
      <header className="relative z-10 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-white/10 sticky top-0 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 id="site-title" className="text-2xl sm:text-4xl font-bold text-white tracking-tight">Open Marketplace</h1>
            <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
              <p id="tagline" className="text-purple-300 text-xs sm:text-base">Discover, share &amp; collaborate on amazing products</p>
            </div>
          </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-white font-semibold">Welcome back,</p>
                  <p className="text-purple-300 text-sm">@{username}</p>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowCart(!showCart)}
                    className="relative w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {cartCount > 0 && (
                      <div className="cart-badge">
                        {cartCount}
                      </div>
                    )}
                  </button>
                </div>

                <div className="user-avatar">{userInitial}</div>

                <button
                  onClick={handleLogout}
                  className="btn-secondary px-4 py-2 rounded-xl text-white font-medium text-sm"
                >
                  Logout
                </button>
              </div>
            </div>

          {/* Category Filters */}
          <div className="mt-4 sm:mt-6 flex flex-wrap gap-1 sm:gap-2 overflow-x-auto pb-2 -mx-3 sm:-mx-0 px-3 sm:px-0">
              {[
                { value: 'all', label: 'All Items' },
                { value: 'electronics', label: '🔌 Electronics' },
                { value: 'clothing', label: '👕 Clothing' },
                { value: 'food', label: '🍔 Food' },
                { value: 'shoes', label: '👟 Shoes' },
                { value: 'accessories', label: '💎 Accessories' },
                { value: 'other', label: '📦 Other' },
              ].map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`category-btn px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition-all whitespace-nowrap ${
                    selectedCategory === cat.value
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 border-transparent text-white'
                      : 'text-white/70 border-white/20 hover:border-white/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-6 flex flex-wrap gap-4 sm:gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/60 text-sm">{products.length} products</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm">Open Source</span>
                <span className="text-purple-400">✓</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm">Collaborative</span>
                <span className="text-purple-400">✓</span>
              </div>
            </div>
          </div>
        </header>

        {/* Add Product Button */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => { setShowModal(true); setEditingProduct(null); setNewProduct({ name: '', price: '', emoji: '📱', category: 'electronics', description: '' }); }}
              className="btn-primary px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="relative z-10 px-4 sm:px-6 lg:px-8 pb-32">
          <div className="max-w-7xl mx-auto">
            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <div key={product.id} className="card-gradient glow-effect rounded-2xl p-6 product-card hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{product.name}</h3>
                    <div className="flex gap-2 delete-btn">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-white/60 hover:text-purple-400 transition-colors p-1"
                        title="Edit product"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2zm-1 9a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-white/60 hover:text-red-400 transition-colors p-1"
                        title="Delete product"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                    <div className="emoji-display text-center mb-4">{product.emoji}</div>
                    <p className="text-white/80 text-sm mb-4 h-10 overflow-hidden">{product.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="price-tag px-3 py-1 rounded-full text-white font-bold text-lg">${product.price.toFixed(2)}</span>
                      <span className="category-pill px-3 py-1 rounded-full text-white text-xs font-medium">{product.category}</span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className="btn-buy w-full py-3 rounded-xl text-white font-semibold transition-all hover:shadow-lg"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="empty-state">
                  <div className="text-8xl mb-6">🛒</div>
                  <h3 className="text-2xl font-semibold text-white mb-2">No products yet</h3>
                  <p className="text-white/60 mb-8 max-w-md mx-auto">Start building the marketplace by adding your first product.</p>
                  <button
                    onClick={() => { setShowModal(true); setEditingProduct(null); }}
                    className="btn-primary px-8 py-3 rounded-xl text-white font-semibold inline-flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Your First Product
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

      {/* Cart Sidebar */}
      {showCart && (
        <>
          <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setShowCart(false)}></div>
          <div className="fixed right-0 top-0 z-40 h-screen w-full sm:w-96 card-gradient border-l border-white/10 overflow-y-auto flex flex-col -webkit-overflow-scrolling:touch">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Shopping Cart</h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {cart.length > 0 ? (
                  <>
                    <div className="space-y-4 mb-6">
                      {cart.map(item => (
                        <div key={item.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{item.emoji}</span>
                              <div>
                                <p className="text-white font-semibold text-sm">{item.name}</p>
                                <p className="text-white/60 text-xs">${item.price.toFixed(2)}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className="btn-secondary px-3 py-1 rounded-lg text-white text-sm font-semibold"
                            >
                              −
                            </button>
                            <span className="text-white font-bold">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="btn-secondary px-3 py-1 rounded-lg text-white text-sm font-semibold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white/80">Subtotal:</span>
                        <span className="text-white font-bold">${totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-white/80">Shipping:</span>
                        <span className="text-green-400 font-semibold">Free</span>
                      </div>
                      <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                        <span className="text-white font-bold">Total:</span>
                        <span className="text-2xl font-bold text-purple-400">${totalPrice.toFixed(2)}</span>
                      </div>

                      <button
                        onClick={() => setShowCheckout(true)}
                        className="btn-buy w-full py-3 rounded-xl text-white font-semibold mb-2"
                      >
                        Proceed to Checkout
                      </button>

                      <button
                        onClick={() => setShowCart(false)}
                        className="btn-secondary w-full py-3 rounded-xl text-white font-semibold"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🛍️</div>
                    <p className="text-white/60">Your cart is empty</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-white/60 text-sm">© 2026 Open Marketplace. All rights reserved.</p>
              <p className="text-white/80 text-sm font-semibold flex items-center justify-center sm:justify-end gap-2">
                <span>✨ Powered by</span>
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">Kishore Tech</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
