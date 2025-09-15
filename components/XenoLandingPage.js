import React, { useState, useEffect } from 'react';
import { Store, TrendingUp, Users, BarChart3, ArrowRight, Zap } from 'lucide-react';

// Meteors Component
const Meteors = ({ number }) => {
  const meteors = new Array(number || 20).fill(true);
  
  return (
    <>
      {meteors.map((el, idx) => (
        <span
          key={idx}
          className="animate-meteor-effect absolute h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]"
          style={{
            top: 0,
            left: Math.floor(Math.random() * (400 - -400) + -400) + "px",
            animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
            animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
          }}
        >
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-[1px] w-[50px] -translate-y-1/2 -translate-x-1/2 rotate-90 bg-gradient-to-r from-slate-400 to-transparent" />
        </span>
      ))}
    </>
  );
};

// API Client for fetching tenants
class XenoAPI {
  constructor(baseURL) {
    this.baseURL = baseURL || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : '');
  }

  async getAllTenants() {
    // Check if we're on client side and backend is available
    if (typeof window === 'undefined') {
      return { data: [] };
    }
    
    try {
      const response = await fetch(`${this.baseURL}/api/tenants`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching tenants:', error);
      return { data: [] };
    }
  }
}

const XenoLandingPage = ({ onTenantSelect }) => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState(null);

  const apiBase = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : '';
  const api = new XenoAPI(apiBase);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await api.getAllTenants();
        setTenants(response.data || []);
        
        // Fallback tenant if none exist
        if (!response.data || response.data.length === 0) {
          setTenants([{
            id: 'a81106b0-256d-478e-a528-e049103b404d',
            storeName: 'FDE Xeno Demo Store',
            shopDomain: 'fde-xeno.myshopify.com',
            metadata: {
              description: 'Demo store with 44 orders and ₹70,727 revenue'
            }
          }]);
        }
      } catch (error) {
        console.error('Failed to fetch tenants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const handleTenantSelection = (tenant) => {
    setSelectedTenant(tenant);
    setTimeout(() => {
      onTenantSelect(tenant);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-white">Loading Shopify Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-lg mb-6">
              <Zap className="w-4 h-4 text-purple-400 mr-2" />
              <span className="text-purple-300 text-sm font-medium">Shopify Analytics</span>
            </div>
            
            <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-6">
              Multi-Tenant Analytics
            </h1>
            
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Enterprise-grade Shopify analytics platform with complete tenant isolation. 
              Select a store below to explore real-time business intelligence.
            </p>
          </div>

          {/* Tenant Selection Cards */}
          <div className="flex justify-center mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="relative group cursor-pointer"
                  onClick={() => handleTenantSelection(tenant)}
                >
                  <div className="absolute inset-0 h-full w-full scale-[0.80] transform rounded-2xl bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-3xl group-hover:scale-[0.85] transition-transform duration-300" />
                  
                  <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-lg p-6 shadow-2xl group-hover:border-purple-500/50 transition-all duration-300">
                    
                    {/* Store Icon */}
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate-600/50 bg-slate-700/50">
                      <Store className="h-5 w-5 text-purple-400" />
                    </div>
                    
                    {/* Store Info */}
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">
                        {tenant.storeName}
                      </h3>
                      
                      <p className="text-slate-400 text-sm mb-4">
                        {tenant.shopDomain}
                      </p>
                      
                      {tenant.metadata?.description && (
                        <p className="text-slate-300 text-sm">
                          {tenant.metadata.description}
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-3 gap-2 mb-6 pt-4 border-t border-slate-700/50">
                      <div className="text-center">
                        <Users className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                        <span className="text-xs text-slate-400">Customers</span>
                      </div>
                      <div className="text-center">
                        <BarChart3 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                        <span className="text-xs text-slate-400">Orders</span>
                      </div>
                      <div className="text-center">
                        <TrendingUp className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                        <span className="text-xs text-slate-400">Analytics</span>
                      </div>
                    </div>
                    
                    {/* Access Button */}
                    <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-600/50 bg-slate-700/30 px-4 py-3 text-slate-300 hover:bg-slate-600/40 hover:border-purple-500/50 hover:text-white transition-all duration-200 group-hover:bg-purple-600/20">
                      <span className="font-medium">View Analytics</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    {/* Meteor effect */}
                    <Meteors number={15} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="text-center">
            <div className="inline-flex items-center gap-8 px-8 py-4 rounded-2xl bg-slate-800/20 backdrop-blur-lg border border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-slate-300 text-sm">Real-time Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-slate-300 text-sm">Multi-tenant Architecture</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-slate-300 text-sm">Enterprise Security</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Selection Animation Overlay */}
      {selectedTenant && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-xl font-semibold text-white">Connecting to {selectedTenant.storeName}...</p>
            <p className="text-slate-400 mt-2">Loading analytics dashboard</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default XenoLandingPage;