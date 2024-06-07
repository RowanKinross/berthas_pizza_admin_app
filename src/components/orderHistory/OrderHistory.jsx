// import berthasLogo from './bertha_logo'
import './orderHistory.css'
import { app, db } from '../firebase/firebase';
import { collection, getDocs, doc, updateDoc } from '@firebase/firestore';
import React, { useState, useEffect, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';



const OrderHistory = ({ customerName }) => {

  //make an orders array
  const [orders, setOrders] = useState ([])
  const [viewModal, setViewModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

const handleCloseModal = () => {
  setViewModal(false);
}


  return (
  <div className='orders'>
    <h2>ORDERS</h2>
    <div className='ordersList'>
      <div className='orderButton orderHeaders'>
        <div>Order Placed:</div>
        <div>No. of Pizzas:</div>
        <div>Delivery Week:</div>
      </div>
      {orders
        .filter(order => order.customer_name === customerName)
        .sort((a, b) => a.timestamp.seconds - b.timestamp.seconds)
        .map(order => (
          <button 
            key={order.id} 
            className={`orderButton button ${order.complete ? 'complete' : ''}`}>
              <div className='entries'>{order.timestamp.toDate().toLocaleString()}</div>
              <div className='entries'>{order.pizzaTotal}</div>
              <div className='entries'>{order.delivery_date}</div>
          </button>
        ))}
    </div>
    {selectedOrder && (
        <div className='modal'>
          <div className='modalContent'>
          <div>
            <div>Order Details</div>
          </div>
          <div>
            <p><strong>Account ID:</strong> {selectedOrder.account_ID}</p>
            <p><strong>No. of Pizzas:</strong> {selectedOrder.pizzaTotal}</p>
            <p><strong>Delivery Week:</strong> {selectedOrder.delivery_date}</p>
          </div>
          <div>
            <button className='button' onClick={handleCloseModal}>
              Close
            </button>
          </div>
        </div>
        </div>
      )}
  </div>
  )
}

export default OrderHistory;