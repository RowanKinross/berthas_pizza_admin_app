import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate} from 'react-router-dom';
import './navtabs.css';
import { app, db } from '../firebase/firebase';
import { collection, getDocs, addDoc } from '@firebase/firestore';
import { Dropdown, Button, Form } from 'react-bootstrap';


function NavTabs({ customerName, setCustomerName }) {
  const [userRole, setUserRole] = useState(null); // Initially set to null (no user)
  const [dropdownOpen, setDropdownOpen] = useState(false); // dropdown menu visibility (staff or customer?)
  const [modalVisible, setModalVisible] = useState(false); // modal menu visibility (customer select or new customer)
  const [addCustomer, setAddCustomer] = useState(false); // set add customer to true to view the new customer form
  
  const [customersArr, setCustomersArr] = useState([]);
  const [customerAddress, setCustomerAddress] = useState('');

  let navigate = useNavigate()
  
  // handle inputs changing function
  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "name") {
      setCustomerName(value);
    }if (name === "customerAddress") {
      setCustomerAddress(value);
    }
  }

  // function to get the customer data from firebase
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "customers"));
        const customersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        const customers = customersData.map(item => item.customer)
        setCustomersArr(customers)
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);


  //function to add customer data to fiebase
  const handleAddNewCustomer = async (event) => {
    event.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "customers"), {
        account_ID: (`#${customerName.toUpperCase()}`),
        customer: customerName,
        address: customerAddress
      });
      
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  
  
  
  // Render navigation tabs based on user role
  const renderNavTabs = () => {
    if (userRole === "staff") {
      return (
        <>
          <NavLink to="/" />
          <NavLink to="/orders" className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'}>
            <h3 className="navTab">ORDERS</h3>
          </NavLink>
          <NavLink to="/inventory" className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'}>
            <h3 className="navTab">INVENTORY</h3>
          </NavLink>
          <NavLink to="/demandSummary" className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'}>
            <h3 className="navTab">DEMAND SUMMARY</h3>
          </NavLink>
          <NavLink to="/batchCodes" className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'}>
            <h3 className="navTab">BATCH CODES</h3>
          </NavLink>          
        </>
      );
    } else if (userRole === "customer") {
      return (
        <>
          <NavLink to="/" />
          <NavLink to="/newOrder" className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'}>
            <h3 className="navTab">NEW ORDER</h3>
          </NavLink>
          <NavLink to="/orderHistory" className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'}>
            <h3 className="navTab">ORDER HISTORY</h3>
          </NavLink>
        </>
      );
    } else {
      // If user role is not set or unknown, only render the Home tab
      return (
          <NavLink to="/"/>
      );
    }
  };






  return (
    <div className="navBarContainer">
      {/* Render navigation tabs based on user role */}
      {renderNavTabs()}
      {/* Render dropdown */}

      {userRole ? (
        <div className="loginContainer">
           <p className='loggedInStatement'>{userRole === "customer" ? customerName : userRole === "staff" ? "Bertha's Staff" : null}</p>
           {/* if userRole is staff, set the login statement to 'Berha's Staff', if */}
          <Button className='button' variant="outline-warning" onClick={() => { setUserRole(null); setCustomerName(null); navigate("/"); location.reload();}}>Logout</Button>
        </div>
        ) : (
        <>
        <Dropdown className='loginContainer' show={dropdownOpen} onToggle={(isOpen) => setDropdownOpen(isOpen)}>
          <Dropdown.Toggle className='button' variant="outline-warning" id="dropdown-basic">
            Login
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => {setUserRole("customer"); setModalVisible(true)}}> Customer Login </Dropdown.Item>
            <Dropdown.Item onClick={() => setUserRole("staff")}> Staff Login</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        </>
      )}

      {modalVisible && (
        <div className='modal'>
          <div className='modalContent'>
            <h3>Customer Login</h3>
            <Dropdown>
            <Dropdown.Toggle className='button' variant="outline-warning" id="dropdown-basic">
              Select Customer
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {customersArr.map((customer, index) => (
                <Dropdown.Item key={index} onClick={() => {setCustomerName(customer); setModalVisible(false)}}>
                  {customer}
                </Dropdown.Item>
              ))}
                <button className='button' onClick={() => {setAddCustomer(true); setModalVisible(false)}}>Add customer</button>
            </Dropdown.Menu>
          </Dropdown>
          </div>
        </div>
      )}

      {addCustomer && (
        <div className='modal'>
        <div className='modalContent'>

        <Form.Group>
          <Form.Label>
            <h6> Name:</h6>
          </Form.Label>
          <Form.Control
            as="input"
            placeholder=""
            name="name"
            onChange={handleChange}
            />
          <Form.Label>
            <h6> Street Address:</h6>
          </Form.Label>
          <Form.Control
            as="input"
            placeholder=""
            name="customerAddress"
            onChange={handleChange}
          />
        </Form.Group>
        <Button type="submit" className='button' onClick={() => {setAddCustomer(false); handleAddNewCustomer(event)}}>Submit</Button>
        </div>
        </div>
      )}

  </div>
  );
}

export default NavTabs;