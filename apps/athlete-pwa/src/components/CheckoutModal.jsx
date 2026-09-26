import React from 'react';
import { 
  X, 
  ShoppingBag, 
  Store, 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  onUpdateCartQty,
  onRemoveCartItem,
  onClearCart,
  athlete,
  onCompleteOrder
}) {
  const [deliveryMethod, setDeliveryMethod] = React.useState('pickup'); // 'pickup' | 'delivery'
  const [address, setAddress] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [orderSuccess, setOrderSuccess] = React.useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingFee = deliveryMethod === 'delivery' ? 150 : 0;
  const total = subtotal + shippingFee;

  const handlePayOrder = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setOrderSuccess(true);

      const newOrder = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: athlete.name,
        customerPhone: athlete.phone,
        items: cart.map((c) => ({
          productId: c.id,
          productName: c.name,
          qty: c.qty,
          price: c.price
        })),
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'delivery' ? address || "Dirección registrada del atleta" : "Recoger con Coach Dave en Gym Central",
        subtotal,
        shippingFee,
        total,
        status: "Preparando",
        date: "Hoy, recién pagado"
      };

      onCompleteOrder(newOrder);

      setTimeout(() => {
        onClearCart();
        setOrderSuccess(false);
        onClose();
      }, 2200);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Carrito & Checkout</h3>
              <p className="text-[10px] text-zinc-400">Strength Fit Supplements Pro</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {orderSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">¡Pago Procesado con Éxito!</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Tu orden ha sido enviada a Strength Fit y al Coach Dave para su preparación inmediata.
              </p>
            </div>
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-300">
              Total pagado: <strong className="text-emerald-400">${total} MXN</strong>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
            
            {/* Cart Items List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Productos Seleccionados ({cart.length})
              </h4>
              
              {cart.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4 text-center">Tu carrito está vacío</p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between gap-3"
                  >
                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-zinc-900 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-white truncate">{item.name}</h5>
                      <span className="text-[11px] font-mono text-orange-400">${item.price} MXN</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                      <button
                        onClick={() => onUpdateCartQty(item.id, item.qty - 1)}
                        className="text-zinc-400 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-white w-4 text-center">{item.qty}</span>
                      <button
                        onClick={() => onUpdateCartQty(item.id, item.qty + 1)}
                        className="text-zinc-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveCartItem(item.id)}
                      className="text-zinc-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Delivery Method Selector (Opción A vs Opción B) */}
            {cart.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                  Método de Entrega
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {/* Option A: Pickup */}
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      deliveryMethod === 'pickup'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Store className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold">Pick-up Coach</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">Recoger en recepción / Gym</span>
                    <span className="text-xs font-black font-mono text-emerald-400 mt-2">GRATIS ($0 MXN)</span>
                  </button>

                  {/* Option B: Shipping */}
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      deliveryMethod === 'delivery'
                        ? 'bg-orange-500/10 border-orange-500 text-orange-300 ring-1 ring-orange-500/40'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Truck className="w-4 h-4 text-orange-400" />
                      <span className="text-xs font-bold">Envío Express</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">Entrega a domicilio</span>
                    <span className="text-xs font-black font-mono text-orange-400 mt-2">+$150 MXN</span>
                  </button>
                </div>

                {/* Delivery Address Input if Delivery chosen */}
                {deliveryMethod === 'delivery' && (
                  <div className="pt-2 animate-in fade-in">
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      Dirección de entrega (Calle, Número, Colonia, C.P.):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Calle Palmas 204, Col. Del Valle, CDMX"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Price Breakdown */}
            {cart.length > 0 && (
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal productos:</span>
                  <span className="font-mono text-zinc-200">${subtotal} MXN</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Costo de entrega:</span>
                  <span className="font-mono text-zinc-200">
                    {deliveryMethod === 'pickup' ? 'Gratis' : '+$150 MXN'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                  <span>Total a Pagar:</span>
                  <span className="font-mono font-black text-orange-400">${total} MXN</span>
                </div>
              </div>
            )}

            {/* Pay Button */}
            {cart.length > 0 && (
              <button
                onClick={handlePayOrder}
                disabled={isProcessing}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-98 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Procesando pago seguro...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pagar Pedido (${total} MXN)</span>
                  </>
                )}
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Transacción simulada encriptada de 256 bits</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
