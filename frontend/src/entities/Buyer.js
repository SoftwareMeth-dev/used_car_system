// src/entities/buyer.js
class Buyer {
    constructor(id, username, email) {
      this.id = id;
      this.username = username;
      this.email = email;
      this.shortlist = [];
    }
  
    addToShortlist(listing) {
      this.shortlist.push(listing);
    }
  
    setShortlist(shortlist) {
      this.shortlist = shortlist;
    }
  }
  
  export default Buyer;
  