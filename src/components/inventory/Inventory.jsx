// import berthasLogo from './bertha_logo'
import './inventory.css';
import React, {useState} from 'react';
import { app, db } from '../firebase/firebase';
import { collection, addDoc, getDocs } from '@firebase/firestore'; 
import { Form } from 'react-bootstrap';


function Inventory() {
  const [modalVisible, setModalVisible] = useState(false); // modal for adding a new pizza
  const [pizzaTitle, setPizzaTitle] = useState(''); //title of new pizza
  const [hexColour, setHexColour] = useState(''); // colour of new pizza
  const [pizzaData, setPizzaData] = useState([]); // pizza data from storage
  const [ingredients, setIngredients] = useState([]);
  const [ingredientName, setIngredientName] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState('');
  const [ingredientUnits, setIngredientUnits] = useState('');
  const [ingredientUnitWeight, setIngredientUnitWeight] = useState('');
  const [stock, setStock] = useState([])
  const [sleeve, setSleeve] = useState(false);



// add pizza function for when user clicks on '+'
  const handleAddPizza = async () => {
    const ID = (`${pizzaTitle.charAt(0)}${pizzaTitle.charAt(1)}${pizzaTitle.charAt(2)}`).toUpperCase()
    console.log(ID)
    try {
      await addDoc(collection(db, 'pizzas'), {
        id: ID,
        pizza_title: pizzaTitle,
        ingredients: ingredients,
        hex_colour: hexColour,
        sleeve: sleeve,
      });
      fetchPizzaData();
      closeModal();
      setIngredients([])
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const fetchPizzaData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'pizzas'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPizzaData(data);
    } catch (error) {
      console.error("Error fetching pizza data:", error); // Debugging statement
    }
  };
  const fetchStock = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'batches'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStock(data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
  }
}

  React.useEffect(() => {
    fetchPizzaData();
    fetchStock();
  }, []);


  // Add a new pizza function
  const handleAddNewPizza = () => {
    setModalVisible(true) //open the modal
  }

  // close the modal
  const closeModal = () => {
    setModalVisible(false);
  };
  const handleCancel = () => {
    closeModal();
    setIngredients([]);
  };

  // function to handle new ingredient inputs
  const handleAddIngredient = () => {
    const newIngredient = {
      name: ingredientName,
      quantity: ingredientQuantity,
      units: ingredientUnits,
      unitWeight: ingredientUnitWeight,
    };
    setIngredients([...ingredients, newIngredient]);
    setIngredientName('');
    setIngredientQuantity('');
    setIngredientUnits('');
    setIngredientUnitWeight('');
  }

  const handleRadioChange = (e) => {
    if (e.target.value === 'yes') {
      setSleeve(true);
    } else {
      setSleeve(false);
    }
  }
 






  return (
    <div className='inventory'>
      <h2>INVENTORY</h2>
      {pizzaData.length > 0 ? (
        <div className='inventoryContainer'>
          {pizzaData.map((pizza, pizzaIndex) => {
            let totalStock = 0;
            let totalOnOrder = 0;
            let totalAvailable = totalStock - totalOnOrder;
            
            stock.forEach((batch) => {
              if (batch[pizza.id] !== undefined) {
                totalStock += batch[pizza.id];
                totalAvailable += batch[pizza.id];
              }
            });

            return (
              <div 
                className='pizzas' 
                id={`pizzas${pizza.id}`} 
                key={pizzaIndex} 
                style={{ backgroundColor: pizza.hex_colour }}
              >
                <div className='pizzaContent' style={{ backgroundColor: `${pizza.hex_colour}f2`}}>
                  <div className='pizzaHeader'>
                    <h4 className='pizzaH4'>{pizza.pizza_title}</h4>
                  </div>
                  {/* Render inventory details for this pizza */}
                  {stock.map((batch, index) => (
                    batch[pizza.id] !== undefined ? (
                      <div className='inventoryBox' style={{ backgroundColor: pizza.hex_colour}} key={`${pizza.id}-${index}`}>
                        <p>Batch Date: {batch.batch_date}</p>
                        <p>Total: {batch[pizza.id]}</p>
                        <p>On order: 0</p>
                        <p>Available: {batch[pizza.id]}</p>
                      </div>
                    ) : null
                  ))}
                  {/* Render pizza totals */}
                      <div className='inventoryBox' id='totals'>
                        <p>Total Stock: {totalStock}</p>
                        <p>Total On Order: {totalOnOrder}</p>
                        <p>Total Available: {totalAvailable}</p>
                      </div>
                </div>
              </div>
            );
          })}
          {/* Button to add a new pizza */}
          <button className='addPizza button pizzas' onClick={handleAddNewPizza}>+</button>
        </div>
      ) : (
        <p>Loading pizza data...</p>
    )}

    {/* Modal content */}
    {modalVisible && (
      <div className='modal'>
        <div className='modalContent'>
          {/* Form to add a new pizza */}
          <label>
            Name of Pizza:
            <input type='text' onChange={(e) => setPizzaTitle(e.target.value.trim().toUpperCase())} />
          </label>
          {/* Inputs for ingredients */}
          <label id='ingredients'>Ingredients:</label>
          <div className='ingredientList'>
              {ingredients.map((ingredient, index) => (
                <li key={index}>
                  {ingredient.name}: {ingredient.quantity} {ingredient.units}, {ingredient.unitWeight}
                </li>
              ))}
            </div>
          <div className='container'>
             <div className='inputBox'>
                Ingredient: <input type='text' value={ingredientName} onChange={(e) => setIngredientName(e.target.value.trim().toLowerCase())} />
              </div>
              <div className='inputBox'>
                Quantity (per pizza): <input type='number' value={ingredientQuantity} onChange={(e) => setIngredientQuantity(e.target.value)} />
              </div>
              <div className='inputBox'>
                Units: <input type='text' value={ingredientUnits} onChange={(e) => setIngredientUnits(e.target.value.trim().toLowerCase())} />
              </div>
              <div className='inputBox'>
                1 Unit weight: <input type='text' value={ingredientUnitWeight} onChange={(e) => setIngredientUnitWeight(e.target.value).trim().toLowerCase()} />
              </div>
              <div className='inputBox'>
                <button className='button addIngredient' onClick={handleAddIngredient}>Add Ingredient</button>
              </div>
            </div>
          <label>
            Hex Colour Code:
            <input type='text' placeholder='#eee510' className='inputBox' onChange={(e) => setHexColour(e.target.value)}/>
          </label>
          <label>
            With a sleeve?
            <div className='sleeve'>
            <label>
              Yes
              <input
                type="radio"
                value="yes"
                checked={sleeve === true}
                onChange={handleRadioChange}
                />
            </label>
            <label>
              No
              <input
                type="radio"
                value="no"
                checked={sleeve === false}
                onChange={handleRadioChange}
                />
            </label>
            </div>
          </label>
          {/* Buttons to submit or cancel */}
          <button onClick={handleAddPizza}>Submit</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    )}
    <div>
      <div className='inventoryBox' id='totals'>
        <p>Total Stock:</p>
        <p>Total On Order:</p>
        <p>Total Available:</p>
       </div>
    </div>
  </div>
);
}

export default Inventory;