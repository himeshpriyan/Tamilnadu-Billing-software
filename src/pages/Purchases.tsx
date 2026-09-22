import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ShoppingCart,
  Building2,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Package,
  Calendar,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { paymentModes } from '@/data/mockData';
import { AppLayout } from '@/components/layout/AppLayout';
import { toast } from 'sonner';

export default function Purchases() {
  const { language, suppliers, addSupplier, purchases, addPurchase } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('purchases');

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact: '',
    mobile: '',
    email: '',
    address: '',
    gstin: '',
  });

  const [purchaseForm, setPurchaseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    invoiceNo: '',
    supplierId: '',
    items: [{ name: '', qty: 1, rate: 0, gst: 5 }],
    paymentMode: 'Cash',
    paidAmount: 0,
  });

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => 
      p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [purchases, searchQuery]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contact.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [suppliers, searchQuery]);

  const stats = useMemo(() => ({
    totalPurchases: purchases.reduce((sum, p) => sum + p.total, 0),
    totalPaid: purchases.reduce((sum, p) => sum + p.paid, 0),
    totalBalance: purchases.reduce((sum, p) => sum + p.balance, 0),
    suppliersCount: suppliers.length,
  }), [purchases, suppliers]);

  const handleAddSupplier = () => {
    if (!supplierForm.name || !supplierForm.mobile) {
      toast.error(language === 'ta' ? 'தேவையான புலங்களை நிரப்பவும்' : 'Please fill required fields');
      return;
    }
    const newSupplier = {
      id: `SUP${Date.now().toString().slice(-4)}`,
      name: supplierForm.name,
      contact: supplierForm.contact || supplierForm.name,
      mobile: supplierForm.mobile,
      email: supplierForm.email,
      address: supplierForm.address,
      gstin: supplierForm.gstin || '33AABCU9603R1ZM',
      totalPurchases: 0,
      balance: 0,
    };
    addSupplier(newSupplier);
    toast.success(language === 'ta' ? 'விநியோகஸ்தர் சேர்க்கப்பட்டார்' : 'Supplier added');
    setShowSupplierDialog(false);
    setSupplierForm({ name: '', contact: '', mobile: '', email: '', address: '', gstin: '' });
  };

  const handleAddPurchase = () => {
    if (!purchaseForm.supplierId || !purchaseForm.invoiceNo) {
      toast.error(language === 'ta' ? 'தேவையான புலங்களை நிரப்பவும்' : 'Please fill required fields');
      return;
    }
    const supplier = suppliers.find(s => s.id === purchaseForm.supplierId);
    const subtotal = purchaseForm.items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
    const gst = purchaseForm.items.reduce((sum, item) => sum + (item.qty * item.rate * (item.gst / 100)), 0);
    const total = subtotal + gst;
    const paid = Number(purchaseForm.paidAmount) || 0;
    const balance = Math.max(0, total - paid);
    const status = balance === 0 ? 'paid' : (paid > 0 ? 'partial' : 'pending');

    const newPurchase = {
      id: `PUR${Date.now().toString().slice(-4)}`,
      date: purchaseForm.date,
      invoiceNo: purchaseForm.invoiceNo,
      supplierId: purchaseForm.supplierId,
      supplierName: supplier?.name || 'Supplier',
      items: purchaseForm.items.map(i => ({
        ...i,
        total: (i.qty * i.rate) * (1 + i.gst / 100)
      })),
      subtotal,
      gst,
      total,
      paid,
      balance,
      status: status as 'paid' | 'partial' | 'pending',
    };

    addPurchase(newPurchase);
    toast.success(language === 'ta' ? 'கொள்முதல் சேர்க்கப்பட்டது' : 'Purchase added');
    setShowAddDialog(false);
    setPurchaseForm({
      date: new Date().toISOString().split('T')[0],
      invoiceNo: '',
      supplierId: '',
      items: [{ name: '', qty: 1, rate: 0, gst: 5 }],
      paymentMode: 'Cash',
      paidAmount: 0,
    });
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">
              {language === 'ta' ? 'கொள்முதல்' : 'Purchases'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ta' 
                ? 'விநியோகஸ்தர்கள் & கொள்முதல் நிர்வாகம்'
                : 'Manage suppliers & purchase entries'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showSupplierDialog} onOpenChange={setShowSupplierDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  {language === 'ta' ? 'விநியோகஸ்தர்' : 'Add Supplier'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {language === 'ta' ? 'புதிய விநியோகஸ்தர்' : 'New Supplier'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>{language === 'ta' ? 'நிறுவன பெயர்*' : 'Company Name*'}</Label>
                    <Input
                      value={supplierForm.name}
                      onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                      placeholder="Lakshmi Wholesalers"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ta' ? 'தொடர்பாளர்' : 'Contact Person'}</Label>
                      <Input
                        value={supplierForm.contact}
                        onChange={(e) => setSupplierForm({ ...supplierForm, contact: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ta' ? 'மொபைல்*' : 'Mobile*'}</Label>
                      <Input
                        value={supplierForm.mobile}
                        onChange={(e) => setSupplierForm({ ...supplierForm, mobile: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={supplierForm.email}
                      onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ta' ? 'முகவரி' : 'Address'}</Label>
                    <Input
                      value={supplierForm.address}
                      onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GSTIN</Label>
                    <Input
                      value={supplierForm.gstin}
                      onChange={(e) => setSupplierForm({ ...supplierForm, gstin: e.target.value })}
                      placeholder="33AABCL1234R1ZX"
                    />
                  </div>
                  <Button onClick={handleAddSupplier} className="w-full mt-2">
                    {language === 'ta' ? 'சேர்' : 'Add Supplier'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  {language === 'ta' ? 'கொள்முதல்' : 'New Purchase'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {language === 'ta' ? 'புதிய கொள்முதல்' : 'New Purchase Entry'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ta' ? 'தேதி' : 'Date'}</Label>
                      <Input
                        type="date"
                        value={purchaseForm.date}
                        onChange={(e) => setPurchaseForm({ ...purchaseForm, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ta' ? 'விலைப்பட்டியல் எண்*' : 'Invoice No*'}</Label>
                      <Input
                        value={purchaseForm.invoiceNo}
                        onChange={(e) => setPurchaseForm({ ...purchaseForm, invoiceNo: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ta' ? 'விநியோகஸ்தர்*' : 'Supplier*'}</Label>
                    <Select 
                      value={purchaseForm.supplierId}
                      onValueChange={(value) => setPurchaseForm({ ...purchaseForm, supplierId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ta' ? 'தேர்வு செய்க' : 'Select supplier'} />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((sup) => (
                          <SelectItem key={sup.id} value={sup.id}>
                            {sup.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>{language === 'ta' ? 'பொருட்கள்' : 'Items'}</Label>
                    {purchaseForm.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-4 gap-2">
                        <Input
                          placeholder={language === 'ta' ? 'பொருள்' : 'Item'}
                          value={item.name}
                          onChange={(e) => {
                            const newItems = [...purchaseForm.items];
                            newItems[idx].name = e.target.value;
                            setPurchaseForm({ ...purchaseForm, items: newItems });
                          }}
                          className="col-span-2"
                        />
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.qty}
                          onChange={(e) => {
                            const newItems = [...purchaseForm.items];
                            newItems[idx].qty = parseInt(e.target.value);
                            setPurchaseForm({ ...purchaseForm, items: newItems });
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Rate"
                          value={item.rate}
                          onChange={(e) => {
                            const newItems = [...purchaseForm.items];
                            newItems[idx].rate = parseFloat(e.target.value);
                            setPurchaseForm({ ...purchaseForm, items: newItems });
                          }}
                        />
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPurchaseForm({ 
                        ...purchaseForm, 
                        items: [...purchaseForm.items, { name: '', qty: 1, rate: 0, gst: 5 }] 
                      })}
                    >
                      <Plus className="h-4 w-4 mr-1" /> {language === 'ta' ? 'பொருள் சேர்' : 'Add Item'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ta' ? 'செலுத்தும் முறை' : 'Payment Mode'}</Label>
                      <Select 
                        value={purchaseForm.paymentMode}
                        onValueChange={(value) => setPurchaseForm({ ...purchaseForm, paymentMode: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentModes.map((mode) => (
                            <SelectItem key={mode.id} value={mode.name}>
                              {mode.icon} {language === 'ta' ? mode.nameTamil : mode.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ta' ? 'செலுத்தும் தொகை' : 'Paid Amount'}</Label>
                      <Input
                        type="number"
                        value={purchaseForm.paidAmount}
                        onChange={(e) => setPurchaseForm({ ...purchaseForm, paidAmount: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  <Button onClick={handleAddPurchase} className="w-full mt-2">
                    {language === 'ta' ? 'சேமி' : 'Save Purchase'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{formatCurrency(stats.totalPurchases)}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ta' ? 'மொத்த கொள்முதல்' : 'Total Purchases'}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{formatCurrency(stats.totalPaid)}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ta' ? 'செலுத்தியது' : 'Total Paid'}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-warning/10">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{formatCurrency(stats.totalBalance)}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ta' ? 'நிலுவை' : 'Balance Due'}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-info/10">
                <Building2 className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.suppliersCount}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ta' ? 'விநியோகஸ்தர்கள்' : 'Suppliers'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="purchases" className="gap-2">
              <FileText className="h-4 w-4" />
              {language === 'ta' ? 'கொள்முதல்கள்' : 'Purchases'}
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="gap-2">
              <Building2 className="h-4 w-4" />
              {language === 'ta' ? 'விநியோகஸ்தர்கள்' : 'Suppliers'}
            </TabsTrigger>
          </TabsList>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ta' ? 'கொள்முதல் தேடு...' : 'Search purchases...'}
                className="pl-9"
              />
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                          {language === 'ta' ? 'தேதி' : 'Date'}
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                          {language === 'ta' ? 'விலைப்பட்டியல்' : 'Invoice'}
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                          {language === 'ta' ? 'விநியோகஸ்தர்' : 'Supplier'}
                        </th>
                        <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">
                          {language === 'ta' ? 'மொத்தம்' : 'Total'}
                        </th>
                        <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">
                          {language === 'ta' ? 'நிலுவை' : 'Balance'}
                        </th>
                        <th className="text-center py-4 px-4 text-sm font-medium text-muted-foreground">
                          {language === 'ta' ? 'நிலை' : 'Status'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPurchases.map((purchase) => (
                        <tr key={purchase.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="py-4 px-4">
                            <span className="text-sm">{formatDate(purchase.date)}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-mono text-sm">{purchase.invoiceNo}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm font-medium">{purchase.supplierName}</span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="font-mono font-semibold">{formatCurrency(purchase.total)}</span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={`font-mono font-semibold ${purchase.balance > 0 ? 'text-destructive' : 'text-success'}`}>
                              {formatCurrency(purchase.balance)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Badge variant={purchase.status === 'paid' ? 'default' : 'secondary'} className={
                              purchase.status === 'paid' ? 'bg-success text-success-foreground' : ''
                            }>
                              {purchase.status === 'paid' 
                                ? (language === 'ta' ? 'செலுத்தப்பட்டது' : 'Paid')
                                : (language === 'ta' ? 'பகுதி' : 'Partial')
                              }
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ta' ? 'விநியோகஸ்தர் தேடு...' : 'Search suppliers...'}
                className="pl-9"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuppliers.map((supplier) => (
                <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{supplier.name}</h3>
                          <p className="text-sm text-muted-foreground">{supplier.contact}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{supplier.mobile}</span>
                      </div>
                      {supplier.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{supplier.email}</span>
                        </div>
                      )}
                      {supplier.address && (
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 mt-0.5" />
                          <span className="text-xs">{supplier.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {language === 'ta' ? 'மொத்த கொள்முதல்' : 'Total Purchases'}
                        </p>
                        <p className="font-mono font-semibold">{formatCurrency(supplier.totalPurchases)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {language === 'ta' ? 'நிலுவை' : 'Balance'}
                        </p>
                        <p className={`font-mono font-semibold ${supplier.balance > 0 ? 'text-destructive' : 'text-success'}`}>
                          {formatCurrency(supplier.balance)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AppLayout>
  );
}
