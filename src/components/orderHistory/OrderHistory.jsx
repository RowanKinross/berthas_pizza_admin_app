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
        console.log(ordersData)
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
      <div className='orderButton'>
        <div>Account ID</div>
        <div>no. of pizzas</div>
        <div>Delivery Date</div>
      </div>
      {orders
        .filter(order => order.customer_name === customerName) // Filter orders by customer_name
        .map(order => (
          <button 
            key={order.id} 
            className={`orderButton button ${order.complete ? 'complete' : ''}`}>
              <div>{order.account_ID}</div>
              <div>{order.pizzaTotal}</div>
              <div>{order.delivery_date}</div>
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
            <p><strong>Delivery Date:</strong> {selectedOrder.delivery_date}</p>
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