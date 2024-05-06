// import berthasLogo from './bertha_logo'
import './inventory.css'

function Inventory() {
  return (
    <div className='inventory'>
      <h2>Inventory</h2>
      <div className='inventoryContainer'>
        <div className='pizzas' id='pizzasMH'>Meat & Heat
          <img src="./Frozen-Characters-Website-1-copy.webp" className='pizzaImg'/>
        </div>
        <div className='pizzas' id='pizzasHam'>Ham
          <img src="./Frozen-Characters-Website-3-copy.webp" className='pizzaImg'/>
        </div>
        <div className='pizzas'id='pizzasNap'>Napoli
          <img src="./Frozen-Characters-Website-4-copy.webp" className='pizzaImg'/>
        </div>
        <div className='pizzas' id='pizzasMarg'>Margherita
          <img src="./Frozen-Characters-Website-2-copy.webp" className='pizzaImg'/>
        </div>
      </div>
    </div>
  )
}

export default Inventory;