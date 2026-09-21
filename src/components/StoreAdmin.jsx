import React from 'react';
import { 
  Package, 
  ShoppingBag, 
  Edit3, 
  Plus, 
  CheckCircle, 
  Clock, 
  Truck, 
  Store, 
  DollarSign, 
  TrendingUp, 
  X,
  AlertCircle,
  PlusCircle,
  Sparkles,
  Tag
} from 'lucide-react';

export default function StoreAdmin({
  products,
  onAddProduct,
  onUpdateProduct,
  orders,
  onUpdateOrderStatus
}) {
  const [editingProduct, setEditingProduct] = React.useState(null);
  const [editPrice, setEditPrice] = React.useState("");
  const [editStock, setEditStock] = React.useState("");

  // Estado para Modal de Alta de Nuevo Producto
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [newProductForm, setNewProductForm] = React.useState({
    name: "",
    brand: "Strength Fit Pro",
    category: "Proteína",
    price: "",
    stock: "",
    flavor: "",
    image: "",
    badge: "Nuevo Ingreso",
    description: ""
  });
  const [addSuccessNotice, setAddSuccessNotice] = React.useState(null);

  const handleStartEdit = (prod) => {
    setEditingProduct(prod);
    setEditPrice(prod.price.toString());
    setEditStock(prod.stock.toString());
  };

  const handleSaveProductEdit = (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    onUpdateProduct(editingProduct.id, {
      price: parseFloat(editPrice) || editingProduct.price,
      stock: parseInt(editStock, 10) || editingProduct.stock
    });
    setEditingProduct(null);
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.price || !newProductForm.stock) return;

    const defaultImages = {
      "Proteína": "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&auto=format&fit=crop&q=80",
      "Rendimiento": "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&auto=format&fit=crop&q=80",
      "Pre-Entreno": "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=400&auto=format&fit=crop&q=80",
      "Intra-Entreno": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80",
      "Accesorios": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80"
    };

    const newProd = {
      id: `prod-${Date.now()}`,
      name: newProductForm.name,
      brand: newProductForm.brand || "Strength Fit Pro",
      category: newProductForm.category,
      price: parseFloat(newProductForm.price),
      stock: parseInt(newProductForm.stock, 10),
      flavor: newProductForm.flavor || "Edición Especial",
      image: newProductForm.image.trim() !== "" ? newProductForm.image : (defaultImages[newProductForm.category] || defaultImages["Proteína"]),
      badge: newProductForm.badge || "Nuevo",
      description: newProductForm.description || "Suplemento deportivo de alta pureza formulado para atletas de alto rendimiento."
    };

    onAddProduct(newProd);
    setIsAddModalOpen(false);
    setAddSuccessNotice(`¡Producto "${newProd.name}" publicado en la tienda con éxito!`);
    setTimeout(() => setAddSuccessNotice(null), 4000);

    // Reset form
    setNewProductForm({
      name: "",
      brand: "Strength Fit Pro",
      category: "Proteína",
      price: "",
      stock: "",
      flavor: "",
      image: "",
      badge: "Nuevo Ingreso",
      description: ""
    });
  };

  const totalInventoryValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
  const totalOrdersValue = orders.reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-orange-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-inner">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-orange-500">Strength Fit</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold">Store Management</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Panel de Control de Tienda & Inventario</h1>
          </div>
        </div>

        {/* Quick KPI stats + Nuevo Producto Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-zinc-950/80 px-4 py-2 rounded-xl border border-zinc-800 text-right">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Valor en Inventario</span>
            <span className="text-sm font-black font-mono text-orange-400">${totalInventoryValue.toLocaleString()} MXN</span>
          </div>
          <div className="bg-zinc-950/80 px-4 py-2 rounded-xl border border-zinc-800 text-right">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Ventas de Pedidos</span>
            <span className="text-sm font-black font-mono text-emerald-400">${totalOrdersValue.toLocaleString()} MXN</span>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuevo Artículo</span>
          </button>
        </div>
      </div>

      {/* Success Notice al crear producto */}
      {addSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 flex items-center justify-between text-xs text-emerald-300 shadow-xl animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{addSuccessNotice} (Visible instantáneamente en la app de atletas).</span>
          </div>
          <button onClick={() => setAddSuccessNotice(null)} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid: Left (Inventory Control 7 cols), Right (Incoming Orders 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* INVENTORY CONTROL TABLE (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-orange-400" />
                Control de Inventario & Precios
              </h3>
              <p className="text-xs text-zinc-400">Edita stock o precios de catálogo en tiempo real.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-lg">
                {products.length} SKUs activos
              </span>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-2.5 py-1 bg-orange-500/20 border border-orange-500/40 hover:bg-orange-500 hover:text-black text-orange-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px] font-bold">
                  <th className="pb-3 pl-2">Producto</th>
                  <th className="pb-3 text-right">Precio</th>
                  <th className="pb-3 text-center">Stock</th>
                  <th className="pb-3 text-right pr-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover bg-zinc-950 border border-zinc-800 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-white block leading-snug">{prod.name}</span>
                          <span className="text-[10px] text-zinc-400 block">{prod.flavor}</span>
                          {prod.badge && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                              {prod.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 text-right font-mono font-bold text-orange-400">
                      ${prod.price} <span className="text-[10px] text-zinc-500 font-sans">MXN</span>
                    </td>

                    <td className="py-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold font-mono ${
                        prod.stock <= 10
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {prod.stock} u.
                      </span>
                    </td>

                    <td className="py-3 text-right pr-2">
                      <button
                        onClick={() => handleStartEdit(prod)}
                        className="px-2.5 py-1.5 bg-zinc-800 hover:bg-orange-500 hover:text-black text-zinc-300 rounded-lg font-semibold text-xs inline-flex items-center gap-1 transition-all"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Editar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* INCOMING ORDERS TRAY (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-orange-400" />
                Bandeja de Pedidos Entrantes
              </h3>
              <p className="text-xs text-zinc-400">Órdenes generadas por alumnos desde la PWA móvil.</p>
            </div>
            <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold px-2 py-0.5 rounded-full">
              {orders.length} Pedidos
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {orders.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                No hay pedidos registrados todavía. Realiza uno desde la Vista Atleta.
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3.5 space-y-2.5 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">{ord.id}</span>
                        <span className="text-[10px] text-zinc-500">• {ord.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-amber-400 mt-0.5">{ord.customerName}</h4>
                    </div>

                    {/* Badge Estado */}
                    <div className="flex items-center gap-1">
                      <select
                        value={ord.status}
                        onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          ord.status === 'Listo para entrega'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : ord.status === 'Entregado'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        }`}
                      >
                        <option value="Preparando" className="bg-zinc-900 text-amber-400">⏳ Preparando</option>
                        <option value="Listo para entrega" className="bg-zinc-900 text-emerald-400">📦 Listo para entrega</option>
                        <option value="Entregado" className="bg-zinc-900 text-blue-400">✅ Entregado</option>
                      </select>
                    </div>
                  </div>

                  {/* Items in order */}
                  <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/60 text-xs space-y-1">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-zinc-300 text-[11px]">
                        <span>{item.qty}x {item.productName}</span>
                        <span className="font-mono">${item.price * item.qty} MXN</span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery details */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800/60">
                    <span className="flex items-center gap-1 text-zinc-400">
                      {ord.deliveryMethod === 'pickup' ? (
                        <>
                          <Store className="w-3.5 h-3.5 text-amber-400" />
                          <strong className="text-zinc-300">Pick-up con Coach</strong>
                        </>
                      ) : (
                        <>
                          <Truck className="w-3.5 h-3.5 text-orange-400" />
                          <strong className="text-zinc-300">Envío a domicilio</strong>
                        </>
                      )}
                    </span>
                    <span className="font-mono font-black text-sm text-white">
                      ${ord.total} MXN
                    </span>
                  </div>

                  {ord.deliveryAddress && ord.deliveryMethod === 'delivery' && (
                    <p className="text-[10px] text-zinc-500 truncate">
                      📍 {ord.deliveryAddress}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* MODAL: Dar de alta un nuevo artículo */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Dar de Alta Nuevo Artículo</h3>
                  <p className="text-[10px] text-zinc-400">Strength Fit Supplements & Gear</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Glutamina Micronizada 500g"
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Proteína">Proteína</option>
                    <option value="Rendimiento">Rendimiento / Creatina</option>
                    <option value="Pre-Entreno">Pre-Entreno</option>
                    <option value="Intra-Entreno">Intra-Entreno / Aminoácidos</option>
                    <option value="Accesorios">Accesorios / Gear</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Presentación / Sabor
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Ponche de Frutas / 40 serv"
                    value={newProductForm.flavor}
                    onChange={(e) => setNewProductForm({ ...newProductForm, flavor: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Precio de Venta ($ MXN) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    placeholder="599"
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Stock Inicial (Unidades) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    placeholder="25"
                    value={newProductForm.stock}
                    onChange={(e) => setNewProductForm({ ...newProductForm, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Badge Promocional
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Nuevo, Pureza 100%, Promo"
                    value={newProductForm.badge}
                    onChange={(e) => setNewProductForm({ ...newProductForm, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    URL de Imagen (Opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://... (deja vacío para default)"
                    value={newProductForm.image}
                    onChange={(e) => setNewProductForm({ ...newProductForm, image: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Descripción del Producto
                </label>
                <textarea
                  rows={2}
                  placeholder="Beneficios, modo de uso o fórmula destacada..."
                  value={newProductForm.description}
                  onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publicar en Tienda</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white">Editar SKU: {editingProduct.name}</h3>
              </div>
              <button onClick={() => setEditingProduct(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductEdit} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Precio de Venta ($ MXN)
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Stock Disponible (Unidades en Bodega)
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black font-extrabold rounded-xl text-xs"
                >
                  Actualizar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
