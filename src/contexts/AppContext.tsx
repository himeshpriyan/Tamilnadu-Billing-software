import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  mockProducts, 
  mockCustomers, 
  mockBills, 
  mockExpenses, 
  mockStaff,
  mockSuppliers,
  mockPurchases,
  defaultBusinessProfile,
  translations,
  Product,
  Customer,
  Bill,
  Expense,
  Staff,
  Supplier,
  Purchase,
  BusinessProfile,
  BillItem
} from '@/data/mockData';
import {
  CustomizationSettings,
  defaultCustomizationSettings,
} from '@/data/customizationDefaults';

type Language = 'en' | 'ta';
type Theme = 'light' | 'dark';

export interface CartItem extends BillItem {
  productId: string;
}

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  currentUser: Staff | null;
  login: (emailOrMobile: string, password?: string) => boolean;
  demoLogin: (role?: 'owner' | 'manager' | 'cashier' | 'accountant') => void;
  logout: () => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Business Profile
  businessProfile: BusinessProfile;
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => void;

  // Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Customers
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;

  // Bills
  bills: Bill[];
  addBill: (bill: Bill) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartGst: { cgst: number; sgst: number };

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Expense) => void;

  // Staff
  staff: Staff[];
  addStaff: (member: Omit<Staff, 'id' | 'salesCount' | 'totalSales'>) => void;
  updateStaff: (id: string, updates: Partial<Staff>) => void;
  toggleStaffStatus: (id: string) => void;

  // Suppliers & Purchases
  suppliers: Supplier[];
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  purchases: Purchase[];
  addPurchase: (purchase: Purchase) => void;

  // UI State
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  billDiscount: number;
  setBillDiscount: (discount: number) => void;

  // Customization
  customization: CustomizationSettings;
  updateCustomization: <K extends keyof CustomizationSettings>(
    section: K,
    updates: Partial<CustomizationSettings[K]>
  ) => void;
  resetCustomization: (section?: keyof CustomizationSettings) => void;

  // Reset demo mock data
  resetToMockData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Auth State - initialized with stored or default active session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => getStored('tn_billing_auth', true));
  const [currentUser, setCurrentUser] = useState<Staff | null>(() => getStored('tn_billing_user', mockStaff[0]));

  // Language & Theme
  const [language, setLanguage] = useState<Language>(() => getStored('tn_billing_lang', 'en'));
  const [theme, setTheme] = useState<Theme>(() => getStored('tn_billing_theme', 'light'));

  // Data State with localStorage persistence and fallback to comprehensive mock data
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => 
    getStored('tn_billing_business', defaultBusinessProfile)
  );
  const [products, setProducts] = useState<Product[]>(() => 
    getStored('tn_billing_products', mockProducts)
  );
  const [customers, setCustomers] = useState<Customer[]>(() => 
    getStored('tn_billing_customers', mockCustomers)
  );
  const [bills, setBills] = useState<Bill[]>(() => 
    getStored('tn_billing_bills', mockBills)
  );
  const [expenses, setExpenses] = useState<Expense[]>(() => 
    getStored('tn_billing_expenses', mockExpenses)
  );
  const [staff, setStaff] = useState<Staff[]>(() => 
    getStored('tn_billing_staff', mockStaff)
  );
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => 
    getStored('tn_billing_suppliers', mockSuppliers)
  );
  const [purchases, setPurchases] = useState<Purchase[]>(() => 
    getStored('tn_billing_purchases', mockPurchases)
  );

  // Cart State (session transient)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [billDiscount, setBillDiscount] = useState(0);

  // Customization State
  const [customization, setCustomization] = useState<CustomizationSettings>(() => 
    getStored('tn_billing_customization', defaultCustomizationSettings)
  );

  // Persist states to localStorage
  useEffect(() => { setStored('tn_billing_auth', isAuthenticated); }, [isAuthenticated]);
  useEffect(() => { setStored('tn_billing_user', currentUser); }, [currentUser]);
  useEffect(() => { setStored('tn_billing_lang', language); }, [language]);
  useEffect(() => { setStored('tn_billing_theme', theme); }, [theme]);
  useEffect(() => { setStored('tn_billing_business', businessProfile); }, [businessProfile]);
  useEffect(() => { setStored('tn_billing_products', products); }, [products]);
  useEffect(() => { setStored('tn_billing_customers', customers); }, [customers]);
  useEffect(() => { setStored('tn_billing_bills', bills); }, [bills]);
  useEffect(() => { setStored('tn_billing_expenses', expenses); }, [expenses]);
  useEffect(() => { setStored('tn_billing_staff', staff); }, [staff]);
  useEffect(() => { setStored('tn_billing_suppliers', suppliers); }, [suppliers]);
  useEffect(() => { setStored('tn_billing_purchases', purchases); }, [purchases]);
  useEffect(() => { setStored('tn_billing_customization', customization); }, [customization]);

  // Auth Functions
  const login = useCallback((emailOrMobile: string, _password?: string) => {
    const user = staff.find(s => s.email.toLowerCase() === emailOrMobile.toLowerCase() || s.mobile === emailOrMobile) || staff[0];
    setCurrentUser(user);
    setIsAuthenticated(true);
    return true;
  }, [staff]);

  const demoLogin = useCallback((role: 'owner' | 'manager' | 'cashier' | 'accountant' = 'owner') => {
    const user = staff.find(s => s.role === role) || staff[0];
    setCurrentUser(user);
    setIsAuthenticated(true);
  }, [staff]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCart([]);
    setSelectedCustomer(null);
  }, []);

  // Translation Function
  const t = useCallback((key: string) => {
    return translations[language][key as keyof typeof translations['en']] || key;
  }, [language]);

  // Theme Effect
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Apply appearance customization
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px',
    };
    root.style.setProperty('--base-font-size', fontSizeMap[customization.appearance.fontSize]);
    
    // Apply border radius
    const borderRadiusMap = {
      none: '0px',
      small: '4px',
      medium: '8px',
      large: '16px',
    };
    root.style.setProperty('--custom-radius', borderRadiusMap[customization.appearance.borderRadius]);
    
    // Apply compact mode
    if (customization.appearance.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
    
    // Apply animations toggle
    if (!customization.appearance.showAnimations) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
  }, [customization.appearance]);

  // Business Profile
  const updateBusinessProfile = useCallback((profile: Partial<BusinessProfile>) => {
    setBusinessProfile(prev => ({ ...prev, ...profile }));
  }, []);

  // Product Functions
  const addProduct = useCallback((product: Product) => {
    setProducts(prev => [product, ...prev]);
  }, []);

  const updateProduct = useCallback((id: string, product: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...product } : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // Customer Functions
  const addCustomer = useCallback((customer: Customer) => {
    setCustomers(prev => [customer, ...prev]);
  }, []);

  const updateCustomer = useCallback((id: string, customer: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customer } : c));
  }, []);

  // Bill Functions
  const addBill = useCallback((bill: Bill) => {
    setBills(prev => [bill, ...prev]);
    // Automatically reduce product inventory for sold items
    setProducts(prev => prev.map(p => {
      const soldItem = bill.items.find(item => item.productId === p.id);
      if (soldItem) {
        return { ...p, stock: Math.max(0, p.stock - soldItem.quantity) };
      }
      return p;
    }));
  }, []);

  // Cart Functions
  const addToCart = useCallback((product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                total: (item.quantity + quantity) * product.price * (1 + product.gstPercent / 100)
              }
            : item
        );
      }
      const gstAmount = product.price * quantity * (product.gstPercent / 100);
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          quantity,
          price: product.price,
          gstPercent: product.gstPercent,
          discount: 0,
          total: product.price * quantity + gstAmount
        }
      ];
    });
  }, []);

  const updateCartItem = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.productId !== productId));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.productId === productId
            ? {
                ...item,
                quantity,
                total: quantity * item.price * (1 + item.gstPercent / 100) - item.discount
              }
            : item
        )
      );
    }
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setBillDiscount(0);
  }, []);

  // Cart Calculations
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0) - billDiscount;
  const cartGst = cart.reduce(
    (acc, item) => {
      const itemGst = (item.price * item.quantity * item.gstPercent) / 100;
      return {
        cgst: acc.cgst + itemGst / 2,
        sgst: acc.sgst + itemGst / 2,
      };
    },
    { cgst: 0, sgst: 0 }
  );

  // Expense Functions
  const addExpense = useCallback((expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
  }, []);

  // Staff Functions
  const addStaff = useCallback((member: Omit<Staff, 'id' | 'salesCount' | 'totalSales'>) => {
    const newStaff: Staff = {
      ...member,
      id: `S00${Date.now().toString().slice(-4)}`,
      salesCount: 0,
      totalSales: 0,
    };
    setStaff(prev => [...prev, newStaff]);
  }, []);

  const updateStaff = useCallback((id: string, updates: Partial<Staff>) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const toggleStaffStatus = useCallback((id: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  }, []);

  // Supplier & Purchase Functions
  const addSupplier = useCallback((supplier: Supplier) => {
    setSuppliers(prev => [...prev, supplier]);
  }, []);

  const updateSupplier = useCallback((id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const addPurchase = useCallback((purchase: Purchase) => {
    setPurchases(prev => [purchase, ...prev]);
  }, []);

  // Customization Functions
  const updateCustomization = useCallback(<K extends keyof CustomizationSettings>(
    section: K,
    updates: Partial<CustomizationSettings[K]>
  ) => {
    setCustomization(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  }, []);

  const resetCustomization = useCallback((section?: keyof CustomizationSettings) => {
    if (section) {
      setCustomization(prev => ({
        ...prev,
        [section]: defaultCustomizationSettings[section]
      }));
    } else {
      setCustomization(defaultCustomizationSettings);
    }
  }, []);

  // Reset all data back to original pristine mock state
  const resetToMockData = useCallback(() => {
    localStorage.removeItem('tn_billing_products');
    localStorage.removeItem('tn_billing_customers');
    localStorage.removeItem('tn_billing_bills');
    localStorage.removeItem('tn_billing_expenses');
    localStorage.removeItem('tn_billing_staff');
    localStorage.removeItem('tn_billing_suppliers');
    localStorage.removeItem('tn_billing_purchases');
    localStorage.removeItem('tn_billing_business');
    localStorage.removeItem('tn_billing_customization');

    setProducts(mockProducts);
    setCustomers(mockCustomers);
    setBills(mockBills);
    setExpenses(mockExpenses);
    setStaff(mockStaff);
    setSuppliers(mockSuppliers);
    setPurchases(mockPurchases);
    setBusinessProfile(defaultBusinessProfile);
    setCustomization(defaultCustomizationSettings);
  }, []);

  const value: AppContextType = {
    isAuthenticated,
    currentUser,
    login,
    demoLogin,
    logout,
    language,
    setLanguage,
    t,
    theme,
    setTheme,
    businessProfile,
    updateBusinessProfile,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    customers,
    addCustomer,
    updateCustomer,
    bills,
    addBill,
    cart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    cartTotal,
    cartGst,
    expenses,
    addExpense,
    staff,
    addStaff,
    updateStaff,
    toggleStaffStatus,
    suppliers,
    addSupplier,
    updateSupplier,
    purchases,
    addPurchase,
    selectedCustomer,
    setSelectedCustomer,
    billDiscount,
    setBillDiscount,
    customization,
    updateCustomization,
    resetCustomization,
    resetToMockData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
