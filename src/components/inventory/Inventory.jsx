// import berthasLogo from './bertha_logo'
import './inventory.css';
import React, {useState} from 'react';
import { app, db } from '../firebase/firebase';
import { collection, addDoc, getDocs } from '@firebase/firestore'; 


function Inventory() {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [madeUnits, setMadeUnits] = useState(0);
  const [madeDate, setMadeDate] = useState('');
  const [batchID, setBatchID] = useState('');
  const [inventoryData, setInventoryData] = useState([]);

  const openModal = (id) => {
    setCurrentId(id);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setMadeUnits(0);
    setMadeDate('');
  };

  const handleAddInventory = async () => {
    try {
      await addDoc(collection(db, 'inventory'), {
        type: currentId,
        units: madeUnits,
        date: madeDate,
        batchID: batchID
      });
      fetchInventoryData();
      closeModal();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const fetchInventoryData = async () => {
    const querySnapshot = await getDocs(collection(db, "inventory"));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setInventoryData(data);
  };

  React.useEffect(() => {
    fetchInventoryData();
  }, []);

 
  const getPizzaTotals = (id) => {
    const filteredData = inventoryData.filter(item => item.type === id);
    const totalInFreezer = 0; // for now
    // filteredData.reduce((acc, item) => acc + parseInt(item.units), 0);
    const totalOnOrder = 0; //for now
    const totalAvailable = totalInFreezer; 
  }

  const getTitle = (id) => {
    switch(id) {
      case 'MH': return 'Meat & Heat';
      case 'Ham': return 'Hamageddon';
      case 'Nap': return 'Napoli';
      case 'Marg': return 'Margherita';
      default: return '';
    }
  };



  return (
    <div className='inventory'>
      <h2>INVENTORY</h2>
      <div className='inventoryContainer'>
        {['MH', 'Ham', 'Nap', 'Marg'].map(id => (
          <div className='pizzas' id={`pizzas${id}`} key={id}>
            <div className='pizzaContent' id={`pizzaContent${id}`}>
              <div className='pizzaHeader'>
                <h4 className='pizzaH4'>{getTitle(id).toUpperCase()}</h4>
                <button className='plus' onClick={() => openModal(id)}>+</button>
              </div>
              {/* <div className='pizza' key={inventory.id}> */}
              {inventoryData.map(inventory => (
                 inventory.type === id ?
                    <button className='inventoryBox'>
                      <p>{inventory.date}</p>
                      <p>Total: {inventory.units}</p>
                      <p>On order: 0</p>
                      <p>Available: {(inventory.units) - 0}</p>
                    </button>
                  : null
            ))
            }
            
              {/* <button className={`pizzaBatch${id}`}>{displayInventory(id)}</button> */}
              <div className='pizzaTotals'>
                {getPizzaTotals(id)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalVisible && (
        <div className='modal'>
          <div className='modalContent'>
            <h3>{getTitle(currentId)}</h3>
            <label>
              How many were made:
              <input type='number' value={madeUnits} onChange={(e) => setMadeUnits(e.target.value)} />
            </label>
            <label>
              Date made:
              <input type='date' value={madeDate} onChange={(e) => setMadeDate(e.target.value)} />
            </label>
            <button onClick={handleAddInventory}>Submit</button>
            <button onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory;