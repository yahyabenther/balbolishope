import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setOrders(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Called from Checkout.jsx. This write is what the Cloud Function
  // below listens for to send the WhatsApp message.
  const addOrder = async (order) => {
    const docRef = await addDoc(collection(db, "orders"), {
      ...order,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    return { id: docRef.id, ...order };
  };

  const updateOrderStatus = async (id, status) => {
    await updateDoc(doc(db, "orders", id), { status });
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, loading }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrders must be used within an OrderProvider");
  return context;
}