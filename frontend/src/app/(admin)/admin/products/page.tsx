"use client";
import { useEffect, useState } from 'react';
import { productService } from '@/services/api';
import { Plus, Edit2, Trash2, X, Package, Loader2, Image as ImageIcon } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Electronics',
    price: 0,
    stock: 0,
    images: [] as string[]
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    productService.getAll().then(res => {
      setProducts(res.data);
      setLoading(false);
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, base64String]
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = (product: any) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category || 'Electronics',
      price: product.price,
      stock: product.stock || 0,
      images: product.images || []
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', description: '', category: 'Electronics', price: 0, stock: 0, images: [] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await productService.update(editingId, formData);
        alert("Product updated in vault!");
      } else {
        await productService.create(formData);
        alert("New product deployed to vault!");
      }
      closeModal();
      loadProducts();
    } catch (err) {
      console.error("Operation failed:", err);
      alert("Check backend logs - verify if ProductUpdate model allows these fields.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this product forever?")) {
      await productService.delete(id);
      loadProducts();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Product Vault</h1>
            <p className="text-slate-500">Add, edit, or remove gear from the store</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all"
          >
            <Plus size={20} /> New Product
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-widest">
                <th className="px-8 py-4">Item</th>
                <th className="px-8 py-4">Stock</th>
                <th className="px-8 py-4">Price</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p: any) => (
                <tr key={p._id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} className="h-10 w-10 rounded-lg object-cover border" />
                      ) : (
                        <div className="bg-slate-100 p-2 rounded-lg text-slate-400"><Package size={20} /></div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium">{p.stock} units</td>
                  <td className="px-8 py-6 font-medium text-blue-600">${p.price}</td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <button 
                      onClick={() => handleEdit(p)}
                      className="p-2 text-slate-300 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(p._id)} 
                      className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={closeModal} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X /></button>
              
              <h2 className="text-2xl font-black mb-6">
                {editingId ? 'Edit Product' : 'Add New Gear'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Product Name</label>
                    <input 
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:border-blue-500" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Category</label>
                    <input 
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:border-blue-500" 
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Price ($)</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:border-blue-500" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Stock Level</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:border-blue-500" 
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} 
                    required 
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Description</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:border-blue-500 h-24" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Images ({formData.images.length})</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} className="h-16 w-16 object-cover rounded-lg border" />
                        <button 
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    <label className="h-16 w-16 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-blue-400 text-slate-400">
                      <Plus size={20} />
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>

                <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all">
                  {editingId ? 'Save Changes' : 'Deploy to Store'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}