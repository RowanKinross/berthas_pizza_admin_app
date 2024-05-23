// import berthasLogo from '../bertha_logo'
import './batchCodes.css'
import { app, db } from '../firebase/firebase';
import { collection, getDocs, addDoc, updateDoc, doc } from '@firebase/firestore';
import { useState, useEffect, useRef } from 'react';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

function BatchCodes() {
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editBatch, setEditBatch] = useState(null);
  const [saveNewMode, setSaveNewMode] = useState(true);
  const [batchDate, setBatchDate] = useState("");
  const [numPizzas, setNumPizzas] = useState(0);
  const [ingredients, setIngredients] = useState("");
  const [batchCode, setBatchCode] = useState("");
  const [completed, setCompleted] = useState(false)
  const formRef = useRef(null);



// display all batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "batches"));
        const batchesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBatches(batchesData);
      } catch (error) {
        console.error("Error fetching batches:", error);
      }
    };

    fetchBatches();
  }, []);



// if user clicks the add button
  const handleAddClick = () => {
    setShowForm(true); // Show the form
    setSaveNewMode(true); // Set mode to save a new batch
    setEditBatch(null); // Clear edit batch data
    setBatchDate(""); // Clear batch date
    setNumPizzas(0); // Clear number of pizzas
    setIngredients(""); // Clear ingredients
    setBatchCode(""); // Clear batch code
  };

// if user clicks edit
  const handleEditClick = (batch) => {
    setEditBatch(batch);
    setShowForm(true); // Hide new form if open
    setSaveNewMode(false); // Set mode to not save new, for editing
    setBatchDate(batch.batch_date); // Set batch date for edit
    setNumPizzas(batch.num_pizzas); // Set number of pizzas for edit
    setIngredients(batch.ingredients); // Set ingredients for edit
    setBatchCode(batch.batch_code); // Set batch code for edit
  };

  const handleAddFormSubmit = async (e) => {
    e.preventDefault();
    try { 
        // Add new batch
        await addDoc(collection(db, "batches"), {
          batch_date: batchDate,
          num_pizzas: numPizzas,
          ingredients: ingredients,
          batch_code: batchCode,
          completed: completed
        });
      setShowForm(false);
      setEditBatch(null);
      setBatchDate("");
      setNumPizzas(0);
      setIngredients("");
      setBatchCode("");
      const querySnapshot = await getDocs(collection(db, "batches"));
      const batchesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBatches(batchesData);
    } catch (error) {
      console.error("Error submitting batch:", error);
    }
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    try { 
        // Update existing batch
        const batchRef = doc(db, "batches", editBatch.id);
        await updateDoc(batchRef, {
          batch_date: batchDate,
          num_pizzas: numPizzas,
          ingredients: ingredients,
          batch_code: batchCode,
          completed: completed,
        });
      setShowForm(false);
      setEditBatch(null);
      setBatchDate("");
      setNumPizzas(0);
      setIngredients("");
      setBatchCode("");
      const querySnapshot = await getDocs(collection(db, "batches"));
      const batchesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBatches(batchesData);
    } catch (error) {
      console.error("Error submitting batch:", error);
    }
  };

 // Handle input changes for both new and edit forms
 const handleInputChange = (e) => {
  const { name, value } = e.target;
  switch (name) {
    case "batch_date":
      setBatchDate(value);
      break;
    case "num_pizzas":
      setNumPizzas(value);
      break;
    case "ingredients":
      setIngredients(value);
      break;
    case "batch_code":
      setBatchCode(value);
      break;
    default:
      break;
  }
};



// Handle clicks outside the form
useEffect(() => {
  const handleClickOutside = (e) => {
    if (formRef.current && !formRef.current.contains(e.target)) {
      setShowForm(false);
    }};
  if (showForm) {
    document.addEventListener("mousedown", handleClickOutside);
  } else {
    document.removeEventListener("mousedown", handleClickOutside);
  }
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [showForm]);




  return (

    <div className='batchCodes'>
    <h2>BATCH CODES</h2>
    <button className='button' onClick={handleAddClick}>+</button>

{showForm && (
    <form ref={formRef} onSubmit={(e) => {e.preventDefault(); if (saveNewMode) {handleAddFormSubmit(e)} else {handleEditFormSubmit(e)}}} className='editForm' as={Row}>
      <Form.Label column sm={3}>
        Batch Date:
      </Form.Label>
      <Col sm={9}>
        <input
          type="date"
          name="batch_date"
          value={batchDate}
          onChange={handleInputChange}
          required
        />
      </Col>          
      <Form.Label column sm={3}>
        Number of Pizzas:
      </Form.Label>
      <Col sm={9}>
        <input
          type="number"
          name="num_pizzas"
          value={numPizzas}
          onChange={handleInputChange}
          required
        />
      </Col>
      <Form.Label column sm={3}>
        Ingredients:
      </Form.Label>
      <Col sm={9}>
        <textarea
          name="ingredients"
          value={ingredients}
          onChange={handleInputChange}
          required
        />
      </Col>
      <Form.Label column sm={3}>
        Batch Code:
      </Form.Label>
      <Col sm={9}>
        <input
          type="text"
          name="batch_code"
          value={batchCode}
          onChange={handleInputChange}
          required
        />
      </Col>
      <div>
        <button type="submit" className='button'>Submit</button>
      </div>
    </form>
)}


    <div className='ordersList'>
      <div className='orderButton'>
        <div>Batch Date: </div>
      </div>
      {batches.map(batch => (
        <div key={batch.id} className='batchDiv'>
          <div className='batchText'>{batch.batch_date}</div>
          <button className='button'onClick={() => handleEditClick(batch)}>edit</button>
      </div>
      ))}
    </div>
  </div>


  )

}

export default BatchCodes;