import React, { useState, useEffect, useRef } from 'react';
import { MOCK_CATALOG_ITEMS, MOCK_REQUESTS, MOCK_INCIDENTS } from '../constants';
import { CatalogItem, ServiceRequest, Incident } from '../types';
import { Card, Badge, Button } from './Shared';
import { Search, ShoppingCart, Star, Truck, Package, Clock, Filter, X, CheckCircle2, History, MessageCircle, Send, Bot, User, PlusCircle } from 'lucide-react';
import { createSupportChatSession, sendChatMessage } from '../services/geminiService';
import { Chat } from '@google/genai';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const ServicePortalModule = () => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'requests'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CatalogItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [requests, setRequests] = useState<ServiceRequest[]>(MOCK_REQUESTS);
  const [justification, setJustification] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi there! I\'m your IT Support Assistant. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [incidentForm, setIncidentForm] = useState({ title: '', description: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Hardware', 'Software', 'Access', 'Service'];

  useEffect(() => {
    const initChat = async () => {
      const session = createSupportChatSession();
      setChatSession(session);
    };
    initChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, showIncidentForm]);

  const filteredItems = MOCK_CATALOG_ITEMS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: CatalogItem) => {
    setCart([...cart, item]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const submitRequest = () => {
    if (cart.length === 0) return;

    const newRequest: ServiceRequest = {
      id: `REQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      items: [...cart],
      status: 'Submitted',
      created: new Date().toISOString(),
      totalCost: cart.reduce((sum, item) => sum + item.price, 0),
      justification: justification
    };

    setRequests([newRequest, ...requests]);
    setCart([]);
    setJustification('');
    setIsCartOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !chatSession) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsChatLoading(true);

    const response = await sendChatMessage(chatSession, userMsg);
    
    setChatMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsChatLoading(false);
  };

  const handleCreateIncident = () => {
    if (!incidentForm.title || !incidentForm.description) return;

    const newIncident: Incident = {
      id: `INC${Math.floor(Math.random() * 1000000)}`,
      title: incidentForm.title,
      description: incidentForm.description,
      priority: 'Medium',
      status: 'New',
      assignee: '',
      created: new Date().toISOString(),
      serviceId: '',
      relatedCiIds: []
    };

    MOCK_INCIDENTS.push(newIncident); // Push to mock data so it persists if module reloads
    
    setChatMessages(prev => [...prev, { 
      role: 'model', 
      text: `I've created incident #${newIncident.id} for you. A support agent will review it shortly.` 
    }]);
    
    setShowIncidentForm(false);
    setIncidentForm({ title: '', description: '' });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-current' : 'text-slate-300'}`} />
        ))}
        <span className="text-xs text-slate-500 ml-1">{rating}</span>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col relative">
      {/* Top Navigation Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-xl mb-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-bold tracking-tight">Service Portal</h2>
          <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'catalog' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Catalog
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'requests' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              My Requests
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search for laptops, software, access..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-slate-900">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="absolute top-20 right-0 z-50 animate-bounce">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6" />
            <div>
              <h4 className="font-bold">Request Submitted!</h4>
              <p className="text-sm opacity-90">Your manager has been notified for approval.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex gap-6">
        {activeTab === 'catalog' ? (
          <>
            {/* Sidebar Filters */}
            <div className="w-64 flex-shrink-0 overflow-y-auto pr-2">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Categories
                </h3>
                <div className="space-y-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                <p className="text-sm opacity-90 mb-4">Can't find what you're looking for? Open a general ticket.</p>
                <Button 
                  variant="secondary" 
                  className="w-full bg-white text-indigo-700 hover:bg-indigo-50 border-none"
                  onClick={() => setIsChatOpen(true)}
                >
                  Contact Support
                </Button>
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
                {filteredItems.map(item => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
                    <div className="h-48 overflow-hidden relative bg-slate-100">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.price === 0 && (
                        <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                          FREE
                        </span>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="neutral">{item.category}</Badge>
                        {renderStars(item.rating)}
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">{item.description}</p>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                        <Truck className="w-4 h-4" />
                        <span>{item.deliveryTime}</span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-xl font-bold text-slate-900">
                          {item.price > 0 ? `$${item.price}` : 'Free'}
                        </span>
                        <Button onClick={() => addToCart(item)} className="bg-orange-500 hover:bg-orange-600 text-white border-none">
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* My Requests View */
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-6">
              {requests.map(req => (
                <Card key={req.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-slate-900">Request #{req.id}</h3>
                          <Badge variant={
                            req.status === 'Completed' ? 'success' : 
                            req.status === 'Fulfillment' ? 'default' : 
                            'warning'
                          }>
                            {req.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(req.created).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><History className="w-4 h-4" /> Total: ${req.totalCost}</span>
                        </div>
                      </div>
                      {req.status === 'Submitted' && (
                        <Button variant="outline" className="text-red-600 hover:bg-red-50 border-red-200">Cancel Request</Button>
                      )}
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Items Requested</h4>
                      <div className="space-y-3">
                        {req.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded border border-slate-200">
                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                            <div className="flex-1">
                              <div className="font-medium text-slate-900">{item.name}</div>
                              <div className="text-xs text-slate-500">{item.category}</div>
                            </div>
                            <div className="font-medium text-slate-900">
                              {item.price > 0 ? `$${item.price}` : 'Free'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {req.justification && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Justification</h4>
                        <p className="text-sm text-slate-700 italic">"{req.justification}"</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Progress Bar Mockup */}
                  <div className="bg-slate-100 px-6 py-3 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
                      <span className={req.status !== 'Submitted' ? 'text-blue-600' : ''}>Submitted</span>
                      <span className={req.status === 'Approval' || req.status === 'Fulfillment' || req.status === 'Completed' ? 'text-blue-600' : ''}>Manager Approval</span>
                      <span className={req.status === 'Fulfillment' || req.status === 'Completed' ? 'text-blue-600' : ''}>Fulfillment</span>
                      <span className={req.status === 'Completed' ? 'text-green-600' : ''}>Delivered</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${req.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ 
                          width: req.status === 'Submitted' ? '25%' : 
                                 req.status === 'Approval' ? '50%' : 
                                 req.status === 'Fulfillment' ? '75%' : '100%' 
                        }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Shopping Cart Slide-over */}
      {isCartOpen && (
        <div className="absolute inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Your Cart ({cart.length})
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-200 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Your cart is empty.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsCartOpen(false)}>Start Shopping</Button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-md object-cover bg-slate-100" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900 line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-slate-500">{item.category}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{item.price > 0 ? `$${item.price}` : 'Free'}</span>
                        <button onClick={() => removeFromCart(idx)} className="text-xs text-red-500 hover:underline">Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Justification</label>
                  <textarea 
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Why do you need these items?"
                  />
                </div>
                <div className="flex justify-between items-center mb-4 text-lg font-bold text-slate-900">
                  <span>Total</span>
                  <span>${cart.reduce((sum, item) => sum + item.price, 0)}</span>
                </div>
                <Button onClick={submitRequest} className="w-full py-3 text-lg bg-orange-500 hover:bg-orange-600 border-none">
                  Submit Request
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Support Chat Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105 z-40"
      >
        {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
      </button>

      {/* AI Support Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 z-40 overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          {/* Chat Header */}
          <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-sm">OneITSM AI Support</h3>
                <p className="text-xs text-blue-100">Always here to help</p>
              </div>
            </div>
            {!showIncidentForm && (
              <button 
                onClick={() => setShowIncidentForm(true)}
                className="text-xs bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded flex items-center gap-1 transition-colors"
              >
                <PlusCircle className="w-3 h-3" /> Create Ticket
              </button>
            )}
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
            {showIncidentForm ? (
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-900">Create Incident Ticket</h4>
                  <button onClick={() => setShowIncidentForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Issue Title</label>
                    <input 
                      type="text" 
                      value={incidentForm.title}
                      onChange={e => setIncidentForm({...incidentForm, title: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief summary..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                    <textarea 
                      rows={4}
                      value={incidentForm.description}
                      onChange={e => setIncidentForm({...incidentForm, description: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the issue in detail..."
                    />
                  </div>
                  <Button onClick={handleCreateIncident} className="w-full mt-2">Submit Ticket</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Chat Input */}
          {!showIncidentForm && (
            <div className="p-3 bg-white border-t border-slate-200">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your question..."
                  className="flex-1 px-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 rounded-full text-sm focus:ring-0 transition-all"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ServicePortalModule;
