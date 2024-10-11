import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {format, parseISO} from 'date-fns';

const ReservationForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [dateTime, setDateTime] = useState('');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const API_URL = 'https://localhost:7037/';

  useEffect(() => {
    const fetchAvailableTables = async () => {
        if (!dateTime || !numberOfGuests) {
            setTables([]); // Clear tables if no date or guests
            return;
        }

        const selectedDate = new Date(dateTime);
        const selectedHour = selectedDate.getHours();
        const selectedMinutes = selectedDate.getMinutes();

        // Check if the selected time is within opening hours (17:00 to 23:00)
        if (selectedHour < 17 || (selectedHour === 23 && selectedMinutes > 0) || selectedHour > 23) {
            setTables([]); // Clear tables if time is before opening
            return;
        }

        try {
            const response = await axios.get(`${API_URL}api/Tables/availableTables`, {
                params: {
                    reservationDate: dateTime,
                    numberOfGuests: numberOfGuests,
                },
            });

            // Update tables state with available tables
            if (response.data && Array.isArray(response.data)) {
                setTables(response.data);
            } else {
                setTables([]); // Clear tables if no available tables found
            }
        } catch (error) {
            console.error("Error fetching tables:", error);
        }
    };

    fetchAvailableTables();
}, [dateTime, numberOfGuests]);


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const customerResponse = await axios.post(`${API_URL}api/Customers/createCustomer`, {
        firstName,
        lastName,
        phoneNumber,
      });
  
      const customerId = customerResponse.data.customerID;
  
      if (!customerId) {
        throw new Error("Customer ID is not defined.");
      }
  
      if (!selectedTable) {
        throw new Error("Selected Table ID is not defined.");
      }
  
      // Convert local dateTime to UTC using date-fns
      const reservationDateTimeUTC = format(parseISO(dateTime), "yyyy-MM-dd'T'HH:mm:ssxxx");
  
      const reservationPayload = {
        TableID: selectedTable,
        CustomerID: customerId,
        Time: reservationDateTimeUTC, // Use UTC time
        NumberOfGuests: numberOfGuests,
      };
  
      const reservationResponse = await axios.post(`${API_URL}api/Reservations/createReservation`, reservationPayload);
      alert("Reservation successful!");
      window.location.href = "https://localhost:7253/";
  
      setFirstName('');
      setLastName('');
      setPhoneNumber('');
      setNumberOfGuests(1);
      setDateTime('');
      setSelectedTable('');
    } catch (error) {
      console.error("Error making reservation:", error);
      alert("There was an error making the reservation: " + error.message);
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
