import './newOrder.css'
import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import dayjs from 'dayjs';
import { app, db } from '../firebase/firebase';
import { addDoc, collection, serverTimestamp } from '@firebase/firestore';



function  NewOrder({customerName}) {
  // // function to get the customer data from firebase
  // useEffect(() => {
  //  const fetchCustomers = async () => {
  //    try {
  //      const querySnapshot = await getDocs(collection(db, "customers"));
  //      const customersData = querySnapshot.docs.map(doc => ({
  //        id: doc.id,
  //        ...doc.data()
  //      }));
  //      const customers = customersData.map(item => item.customer)
  //      const customerObjIndex = customers.indexOf(customerName)
  //      console.log(customerObjIndex)
  //    } catch (error) {
  //      console.error("Error fetching customers:", error);
  //    }
  //  };
  //  fetchCustomers();
  // }, []);

  const [pizzaQuantities, setPizzaQuantities] = useState({
    Ham: 0,
    MH: 0,
    Marg: 0,
    Nap: 0
  });
  const [totalPizzas, setTotalPizzas] = useState(0)
  
  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "additionalNotes") {
      setAdditionalNotes(value);
    } else {
    setPizzaQuantities(prevState => ({
      ...prevState,
      [name]: parseInt(value)
    }));
    const total = Object.values(pizzaQuantities).reduce((acc, curr) => acc + curr, 0);
    setTotalPizzas(total)
    }
  }
  
  
  
  // delivery dates
  const today = dayjs().format('DD-MMM-YYYY');
    function getNextWeekMonday() {
    const nextMonday = dayjs().subtract(1, 'day').add(1, 'week').startOf('week');
    return nextMonday.format('DD-MMM-YYYY');
  }
  const nextWeek = getNextWeekMonday();
  function getNextNextWeekMonday() {
    const nextNextMonday = dayjs().subtract(1, 'day').add(2, 'week').startOf('week');
    return nextNextMonday.format('DD-MMM-YYYY');
  }
  const weekAfterNext = getNextNextWeekMonday();
  const [validated, setValidated] = useState(false);
  // State to store the selected delivery option
  const [deliveryOption, setDeliveryOption] = useState("asap");
  // State to store the custom delivery date
  const [customDeliveryDate, setCustomDeliveryDate] = useState("");
  // Function to handle radio button change
  const handleOptionChange = (event) => {
    setDeliveryOption(event.target.value);
    // Clear the custom delivery date when a predefined option is selected
    if (event.target.value !== 'other') {
      setCustomDeliveryDate("");
    }
  };

   // State to store the selected delivery option
  const [additionalNotes, setAdditionalNotes] = useState("...");






//form submit
const handleSubmit = async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (form.checkValidity() === false) {
    event.preventDefault();
    event.stopPropagation();
    console.log('not submitted')
  } else {
  
  console.log('form submitted')
  setValidated(true);
//send to database
  try {
    const docRef = await addDoc(collection(db, "orders"), {
      timestamp: serverTimestamp(),
      delivery_date: deliveryOption === 'other' ? ("custom:" + customDeliveryDate) : deliveryOption,
      account_ID: (`#${customerName.toUpperCase()}`),
      customer_name: customerName,
      pizza_ham: pizzaQuantities.Ham >= 0 ? pizzaQuantities.Ham : 0,
      pizza_MH: pizzaQuantities.MH >= 0 ? pizzaQuantities.MH : 0,
      pizza_marg: pizzaQuantities.Marg >= 0 ? pizzaQuantities.Marg : 0,
      pizza_nap: pizzaQuantities.Nap >= 0 ? pizzaQuantities.Nap : 0,
      pizzaTotal: totalPizzas,
      additional_notes: document.getElementById('additonalNotes').value,
      complete: false
    });
    
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}
};



// export default NewOrder
return (
  <div className='newOrder'>
    <div>
      <h2>Place a new order:</h2>
    </div>

    <Form noValidate validated={validated} onSubmit={handleSubmit} className='newOrderForm'>

      <h4 className='orderFormFor'>Customer Name: {customerName} </h4> 
      <p className='today'>{today}</p>
      <p>Account ID: #BERTHA001 </p>
      <p>Address: Bertha's Pizza, The Old Gaol Stables, Cumberland Rd, Bristol BS1 6WW </p>

      <fieldset>
      <Form.Group as={Row} className="mb-3">
        <Form.Label as="legend" column sm={2}>
          <h5> Delivery date:</h5>
        </Form.Label>
        <Col sm={10}>
          <Form.Check
            type="radio"
            label="asap"
            value="asap"
            name="deliveryOption"
            id="asap"
            checked={deliveryOption === 'asap'}
            onChange={handleOptionChange}
          />
          <Form.Check
            type="radio"
            label={`next week (W/C ${nextWeek})`}
            value={nextWeek}
            name="deliveryOption"
            id="nextWeek"
            checked={deliveryOption === `${nextWeek}`}
            onChange={handleOptionChange}
          />
          <Form.Check
            type="radio"
            label={`week after next (W/C ${weekAfterNext})`}
            value={weekAfterNext}
            name="deliveryOption"
            id="weekAfterNext"
            checked={deliveryOption === `${weekAfterNext}`}
            onChange={handleOptionChange}
          />
            <Form.Check
            type="radio"
            label="other"
            value="other"
            name="deliveryOption"
            id="other"
            checked={deliveryOption === 'other'}
            onChange={handleOptionChange}
          />
            {deliveryOption === 'other' && (
          <Form.Control
            type="text"
            placeholder="Specify a date"
            value={customDeliveryDate}
            onChange={(e) => setCustomDeliveryDate(e.target.value)}
          />
        )}
        </Col>
      </Form.Group>
    </fieldset>
      <Form.Label><h5> Pizzas: </h5></Form.Label>
    <fieldset>

    <Form.Group as={Row} className="mb-3" id='MH'>
      <Form.Label column sm={3}>
        Meat and Heat
      </Form.Label>
      <Col sm={9}>
        <Form.Control
          type="number"
          placeholder="0"
          value={pizzaQuantities.MH}
          name="MH"
          onChange={handleChange}
        />
      </Col>
    </Form.Group>
    
    <Form.Group as={Row} className="mb-3" id='Ham'>
      <Form.Label column sm={3}>
        Ham
      </Form.Label>
      <Col sm={9}>
        <Form.Control
          type="number"
          placeholder="0"
          value={pizzaQuantities.Ham}
          name="Ham"
          onChange={handleChange}
        />
      </Col>
    </Form.Group>

    <Form.Group as={Row} className="mb-3" id='Marg'>
      <Form.Label column sm={3}>
        Margherita
      </Form.Label>
      <Col sm={9}>
        <Form.Control
          type="number"
          placeholder="0"
          value={pizzaQuantities.Marg}
          name="Marg"
          onChange={handleChange}
        />
      </Col>
      </Form.Group>

    <Form.Group as={Row} className="mb-3" id='Nap'>
      <Form.Label column sm={3}>
        Napoli
      </Form.Label>
      <Col sm={9}>
        <Form.Control
          type="number"
          placeholder="0"
          value={pizzaQuantities.Nap}
          name="Nap"
          onChange={handleChange}
        />
      </Col>
    </Form.Group>
    <p>Total Pizzas: {totalPizzas}</p>
    
      </fieldset>
    
      <Form.Group as={Row} className="mb-3" controlId="additonalNotes">
      <Form.Label column sm={3}>
      <h5> Additional Notes:</h5>
      </Form.Label>
      <Col sm={9}>
      <Form.Control
        as="textarea"
        rows={3}
        placeholder="..."
        value={additionalNotes}
        name="additionalNotes"
        onChange={handleChange}
      />
      </Col>
    </Form.Group>
    
    <Form.Group className="mb-3">
      <Form.Check
        required
        label="Confirm input"
        feedback="You must agree before submitting."
        feedbackType="invalid"
        />
    </Form.Group>
    <Button type="submit" className='button'>Submit Order</Button>
    <Button className='button' onClick={() =>window.location.reload()}>clear fields</Button>
  </Form>
</div>
);
}


export default NewOrder;