import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "firebase/firestore";

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time synchronization with Firestore "products" collection
  useEffect(() => {
    const productsRef = collection(db, "products");

    const unsubscribe = onSnapshot(
      productsRef,
      (snapshot) => {
        const productList = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setProducts(productList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching Firestore products:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Add a new product to Firestore
  const addProduct = async (product) => {
    try {
      const docRef = await addDoc(collection(db, "products"), {
        ...product,
        createdAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...product };
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // Delete a product from Firestore by Document ID
  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Update a product document in Firestore
  const updateProduct = async (id, updates) => {
    try {
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, updates);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        deleteProduct,
        updateProduct,
        loading,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}