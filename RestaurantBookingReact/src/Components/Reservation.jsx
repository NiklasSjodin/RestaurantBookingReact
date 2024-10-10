import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReservationForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [dateTime, setDateTime] = useState('');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [reservationSuccess, setReservationSuccess] = useState(false); // Ny state för reservationens framgång
  const API_URL = 'https://localhost:7037/';

  useEffect(() => {
    const fetchAvailableTables = async () => {
      if (!dateTime || !numberOfGuests) return;

      try {
        const response = await axios.get(`${API_URL}api/Tables/availableTables`, {
          params: {
            reservationDate: dateTime,
            numberOfGuests: numberOfGuests,
          },
        });
        setTables(response.data);
      } catch (error) {
        console.error("Error fetching tables:", error);
      }
    };
  
    fetchAvailableTables();
  }, [dateTime, numberOfGuests]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        // Skapa en ny kund
        const customerResponse = await axios.post(`${API_URL}api/Customers/createCustomer`, {
            firstName,
            lastName,
            phoneNumber,
        });
        console.log("Customer response:", customerResponse.data);

        const customerId = customerResponse.data.customerID; // Använd små bokstäver

        // Logga customerId för att kontrollera om det är korrekt
        console.log("Customer ID being used:", customerId);

        // Kontrollera att ID:t finns innan du gör reservationen
        if (!customerId) {
            throw new Error("Customer ID is not defined.");
        }

        // Kontrollera att selectedTableID finns innan du gör reservationen
        if (!selectedTable) {
            throw new Error("Selected Table ID is not defined.");
        }

        // Skapa en reservation
        const reservationPayload = {
            TableID: selectedTable, // Kontrollera att detta är ett korrekt ID
            CustomerID: customerId, // Använd det genererade ID:t
            Time: new Date(dateTime),
            NumberOfGuests: numberOfGuests,
        };
        
        console.log("Reservation payload:", reservationPayload); // Logga payloaden

        // Skicka reservationen
        const reservationResponse = await axios.post(`${API_URL}api/Reservations/createReservation`, reservationPayload);
        console.log("Reservation response:", reservationResponse.data); // Logga svaret från reservationen

        alert("Reservation successful!");

        // Navigera tillbaka till indexsidan
        window.location.href = "https://localhost:7253/"; // Ändra till din faktiska index URL

        // Återställ formuläret
        setFirstName('');
        setLastName('');
        setPhoneNumber('');
        setNumberOfGuests(1);
        setDateTime('');
        setSelectedTable(''); // Använd null istället för en tom sträng för val av bord
    } catch (error) {
        console.error("Error making reservation:", error);
        alert("There was an error making the reservation: " + error.message); // Ge mer specifik felinformation
    }
};


  return (
    <div className="container mt-5">
      <h2>Boka ett bord</h2>
      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
        <div className="form-group">
          <label htmlFor="firstName">Förnamn</label>
          <input 
            type="text" 
            className="form-control" 
            id="firstName" 
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Efternamn</label>
          <input 
            type="text" 
            className="form-control" 
            id="lastName" 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumber">Telefonnummer</label>
          <input 
            type="tel" 
            className="form-control" 
            id="phoneNumber" 
            value={phoneNumber} 
            onChange={(e) => setPhoneNumber(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="numberOfGuests">Antal gäster</label>
          <input 
            type="number" 
            className="form-control" 
            id="numberOfGuests" 
            value={numberOfGuests} 
            onChange={(e) => setNumberOfGuests(e.target.value)} 
            min="1" 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="dateTime">Datum och tid</label>
          <input 
            type="datetime-local" 
            className="form-control" 
            id="dateTime" 
            value={dateTime} 
            onChange={(e) => setDateTime(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="tableSelect">Välj bord</label>
          <select 
            className="form-control" 
            id="tableSelect" 
            value={selectedTable} 
            onChange={(e) => setSelectedTable(e.target.value)} 
            required
          >
            <option value="" disabled>Välj ett bord</option>
            {tables.map(table => (
              <option key={table.tableID} value={table.tableID}>{`Bord ${table.tableID} - ${table.numberOfSeats} platser`}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Boka bord</button>
      </form>
      {reservationSuccess && (
        <div className="alert alert-success mt-3" role="alert">
          Reservationen har lyckats! Du kommer att omdirigeras tillbaka till startsidan.
        </div>
      )}
    </div>
  );
};

export default ReservationForm;
