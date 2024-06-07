import './newOrder.css'
import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import dayjs from 'dayjs';
import { app, db } from '../firebase/firebase';
import { addDoc, getDocs, collection, serverTimestamp } from '@firebase/firestore';



function  NewOrder({customerName}) {

const [pizzaQuantities, setPizzaQuantities] = useState({});
const [totalPizzas, setTotalPizzas] = useState(0)
const [additionalNotes, setAdditionalNotes] = useState("...");
const [pizzaData, setPizzaData] = useState([]);
const [filterCriteria, setFilterCriteria] = useState("withSleeve");

const capitalizeWords = (str) => {
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};
const handleFilterChange = (event) => {
  setFilterCriteria(event.target.value);
};

// function to get the pizza data from firebase
  useEffect(() => {
   const fetchPizzas = async () => {
     try {
       const querySnapshot = await getDocs(collection(db, "pizzas"));
       const fetchedPizzaData = querySnapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data()
       }));
       fetchedPizzaData.sort((a, b) => {
        if (a.sleeve === b.sleeve) {
          return a.id.localeCompare(b.id);
        }
        return a.sleeve ? -1 : 1;
      });
       setPizzaData(fetchedPizzaData);
     } catch (error) {
       console.error("Error fetching pizzas:", error);
     }
   };
   fetchPizzas();
  }, []);

  useEffect(() => {
    // Initialize pizzaQuantities based on pizzaData
    const initialQuantities = pizzaData.reduce((acc, pizza) => {
      acc[pizza.id] = 0;
      return acc;
    }, {});
    setPizzaQuantities(initialQuantities);
  }, [pizzaData]);


  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "additionalNotes") {
      setAdditionalNotes(value);
    } else {
      setPizzaQuantities(prevState => {
        const updatedQuantities = {
          ...prevState,
          [name]: parseInt(value, 10)
        };
        const total = Object.values(updatedQuantities).reduce((acc, curr) => acc + curr, 0);
        setTotalPizzas(total);
        return updatedQuantities;
      });
    }
  }
  
  const filteredPizzaData = pizzaData.filter(pizza => {
    if (filterCriteria === "withSleeve") {
      return pizza.sleeve;
    } else if (filterCriteria === "withoutSleeve") {
      return !pizza.sleeve;
    } else {
      return true;
    }
  });
  
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
    const pizzas = filteredPizzaData.reduce((acc, pizza) => {
      acc[pizza.id] = pizzaQuantities[pizza.id] >= 0 ? pizzaQuantities[pizza.id] : 0;
      return acc;
    }, {});

    const docRef = await addDoc(collection(db, "orders"), {
      timestamp: serverTimestamp(),
      delivery_date: deliveryOption === 'other' ? ("custom:" + customDeliveryDate) : deliveryOption,
      account_ID: (`#${customerName.toUpperCase()}`),
      customer_name: customerName,
      pizzas,
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
          <h5> Delivery Week:</h5>
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
    <Form.Group as={Row} className="mb-3">

        <Col sm={9}>
          <Form.Check 
            type="radio" 
            label="With Sleeve" 
            value="withSleeve" 
            checked={filterCriteria === "withSleeve"} 
            onChange={handleFilterChange} 
            inline 
          />
          <Form.Check 
            type="radio" 
            label="Without Sleeve" 
            value="withoutSleeve" 
            checked={filterCriteria === "withoutSleeve"} 
            onChange={handleFilterChange} 
            inline 
          />
          <Form.Check 
            type="radio" 
            label="All Pizzas" 
            value="all" 
            checked={filterCriteria === "all"} 
            onChange={handleFilterChange} 
            inline 
          />
        </Col>
      </Form.Group>


      {filteredPizzaData.map(pizza => (
        <Form.Group as={Row} className="mb-3" key={pizza.id} id={pizza.id}>
          <Form.Label column sm={3}>
            {capitalizeWords(pizza.pizza_title)}  {/* Capitalizing each word in the pizza title */}
          </Form.Label>
          <Col sm={9}>
            <Form.Control
              type="number"
              placeholder="0"
              value={pizzaQuantities[pizza.id] || 0}
              name={pizza.id}
              onChange={handleChange}
            />
          </Col>
        </Form.Group>
      ))}
      Total Pizzas: {totalPizzas}
      </fieldset>
      
      <fieldset>
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
    </fieldset>
    
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