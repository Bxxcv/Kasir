import { createContext, useContext, useMemo, useState } from 'react';

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // { product, qty, discount, note }
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [note, setNote] = useState('');
  const [heldOrders, setHeldOrders] = useState([]);

  const addItem = (product) => {
    setItems((prev) => {
      const found = prev.find((i) => i.product.id === product.id);
      if (found) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { product, qty: 1, discount: 0 }];
    });
  };

  const updateQty = (productId, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) => (i.product.id === productId ? { ...i, qty } : i))
    );
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const setItemDiscount = (productId, discount) => {
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, discount } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setOrderDiscount(0);
    setNote('');
  };

  const holdOrder = () => {
    if (items.length === 0) return;
    setHeldOrders((prev) => [
      ...prev,
      { id: `HOLD-${Date.now()}`, items, orderDiscount, note, time: new Date() },
    ]);
    clearCart();
  };

  const resumeOrder = (holdId) => {
    const order = heldOrders.find((h) => h.id === holdId);
    if (!order) return;
    setItems(order.items);
    setOrderDiscount(order.orderDiscount);
    setNote(order.note);
    setHeldOrders((prev) => prev.filter((h) => h.id !== holdId));
  };

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.qty - i.discount, 0),
    [items]
  );
  const totalQty = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const tax = useMemo(() => Math.round((subtotal - orderDiscount) * 0.0), [subtotal, orderDiscount]);
  const grandTotal = Math.max(0, subtotal - orderDiscount + tax);

  const value = {
    items,
    addItem,
    updateQty,
    removeItem,
    setItemDiscount,
    clearCart,
    orderDiscount,
    setOrderDiscount,
    note,
    setNote,
    subtotal,
    totalQty,
    tax,
    grandTotal,
    heldOrders,
    holdOrder,
    resumeOrder,
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  return useContext(CartCtx);
}
