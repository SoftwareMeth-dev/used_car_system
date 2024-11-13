// src/entities/carListing.js
class CarListing {
    constructor(id, make, model, price, details,agent_id) {
      this.id = id;
      this.make = make;
      this.model = model;
      this.price = price;
      this.details = details;
      this.agent_id = agent_id
    }
  }
  
  export default CarListing;
  