// Admin page for managing orders and product stock.
import React, { useState, useEffect } from "react";
import {
  getOrders,
  updateOrderStatus,
  getProducts,
  updateProductStock,
} from "../services/adminApi";

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(null);
  const [newStock, setNewStock] = useState({});
  const [updatingStock, setUpdatingStock] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const ordersResponse = await getOrders();
      setOrders(ordersResponse.data);

      const productsResponse = await getProducts();
      setProducts(productsResponse.data);
    };

    fetchData();
  }, []);

  const handleOrderStatusChange = async (orderId, newStatus) => {
    setLoadingOrder(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      alert(`Order ${orderId} status updated to "${newStatus}".`);
    } catch (error) {
      alert("Error updating order status.");
    }
    setLoadingOrder(null);
  };

  const handleStockUpdate = async (productId) => {
    const stockValue = newStock[productId];

    if (!stockValue || stockValue < 0) {
      alert("Please enter a valid stock quantity.");
      return;
    }

    try {
      setUpdatingStock(productId);
      await updateProductStock(productId, stockValue);
      alert(`Product stock updated to ${stockValue}.`);

      const updatedProducts = products.map((product) =>
        product._id === productId ? { ...product, stock: stockValue } : product
      );
      setProducts(updatedProducts);

      setNewStock({ ...newStock, [productId]: "" });
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Failed to update stock.");
    } finally {
      setUpdatingStock(null);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Administration</h1>

      {/* Orders Management */}
      <div className="mb-12 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-700">Manage Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders found.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="border p-4 rounded-lg hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">Order ID: {order._id}</p>
                    <p className="text-gray-600">Status: <span className="font-semibold">{order.status}</span></p>
                    <p className="text-gray-600">Total: €{order.total}</p>
                  </div>
                  <div className="space-x-2">
                    {order.status !== "Expédiée" && (
                      <button
                        onClick={() => handleOrderStatusChange(order._id, "Expédiée")}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        disabled={loadingOrder === order._id}
                      >
                        {loadingOrder === order._id ? "Updating..." : "Mark Shipped"}
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Products Stock Management */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-700">Manage Product Stock</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-3 text-left">Product Name</th>
                  <th className="border px-4 py-3 text-left">Price</th>
                  <th className="border px-4 py-3 text-left">Current Stock</th>
                  <th className="border px-4 py-3 text-left">New Stock</th>
                  <th className="border px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="border px-4 py-3">{product.name}</td>
                    <td className="border px-4 py-3">€{product.price}</td>
                    <td className="border px-4 py-3 font-semibold">{product.stock}</td>
                    <td className="border px-4 py-3">
                      <input
                        type="number"
                        placeholder="Enter stock"
                        min="0"
                        value={newStock[product._id] || ""}
                        className="border px-3 py-2 rounded w-24"
                        onChange={(e) =>
                          setNewStock({
                            ...newStock,
                            [product._id]: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td className="border px-4 py-3">
                      <button
                        onClick={() => handleStockUpdate(product._id)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        disabled={updatingStock === product._id}
                      >
                        {updatingStock === product._id ? "Updating..." : "Update"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-1/2 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Order Details</h2>
            <div className="space-y-2 mb-6">
              <p><strong>Order ID:</strong> {selectedOrder._id}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Total:</strong> €{selectedOrder.total}</p>
            </div>
            <h3 className="text-lg font-bold mb-3">Items:</h3>
            <div className="space-y-3 mb-6">
              {selectedOrder.items.map((item, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <p><strong>Product ID:</strong> {item.productId}</p>
                  <p><strong>Quantity:</strong> {item.quantity}</p>
                  <p><strong>Price:</strong> €{item.price}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
