// import berthasLogo from './bertha_logo'
import './orders.css'
import { app, db } from '../firebase/firebase';
import { collection, getDocs } from '@firebase/firestore';
import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';

const querySnapshot = await getDocs(collection(db, "orders"));
querySnapshot.forEach((doc) => {
  // doc.data() is never undefined for query doc snapshots
  // console.log(doc.id, " => ", doc.data());
}
);


function Orders() {
  //make an orders array
  const [orders, setOrders] = useState ([])

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



  return (
  <div className='orders'>
    <h2>ORDERS</h2>
    <div className='ordersList'>
      <div className='orderButton'>
        <div>Account ID</div>
        <div>no. of pizzas</div>
        <div>Delivery Date</div>
      </div>
      {orders.map(order => (
        <button key={order.id} className='orderButton button'>
          <div>{order.account_ID}</div>
          <div>{order.pizzaTotal}</div>
          <div>{order.delivery_date}</div>
        </button>
      ))}
    </div>
  </div>
  )
}

export default Orders;