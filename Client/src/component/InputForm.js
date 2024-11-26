import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Autocomplete } from '@react-google-maps/api';
import '../App.css';

function InputForm() {
  const currentDate = new Date();
  const currentHour = currentDate.getHours() % 12 || 12;
  const currentMinute = currentDate.getMinutes();
  const currentPeriod = currentDate.getHours() >= 12 ? 'PM' : 'AM';

  const nextDayDate = new Date(currentDate);
  nextDayDate.setDate(currentDate.getDate() + 1);

  const [destination, setDestination] = useState('');
  const [startPoint, setStartPoint] = useState('');

  const [startHour, setStartHour] = useState(String(currentHour).padStart(2, '0'));
  const [startMinute, setStartMinute] = useState(String(currentMinute).padStart(2, '0'));
  const [startPeriod, setStartPeriod] = useState(currentPeriod);
  const [startDay, setStartDay] = useState(String(currentDate.getDate()).padStart(2, '0'));
  const [startMonth, setStartMonth] = useState(String(currentDate.getMonth() + 1).padStart(2, '0'));
  const [startYear, setStartYear] = useState(currentDate.getFullYear());

  const [endHour, setEndHour] = useState(String(currentHour).padStart(2, '0'));
  const [endMinute, setEndMinute] = useState(String(currentMinute).padStart(2, '0'));
  const [endPeriod, setEndPeriod] = useState(currentPeriod);
  const [endDay, setEndDay] = useState(String(nextDayDate.getDate()).padStart(2, '0'));
  const [endMonth, setEndMonth] = useState(String(nextDayDate.getMonth() + 1).padStart(2, '0'));
  const [endYear, setEndYear] = useState(nextDayDate.getFullYear());

  const navigate = useNavigate();
  const autocompleteStartRef = useRef(null);
  const autocompleteDestinationRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          .then(response => response.json())
          .then(data => {
            const city = data.address.city || data.address.town || 'Unknown City';
            setStartPoint(city);
          })
          .catch(error => console.error('Error fetching location:', error));
      });
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const startTime = `${startHour}:${startMinute} ${startPeriod} on ${startDay}-${startMonth}-${startYear}`;
    const endTime = `${endHour}:${endMinute} ${endPeriod} on ${endDay}-${endMonth}-${endYear}`;

    if (!destination || !startPoint || !startTime || !endTime) {
      alert('Please fill out all fields.');
      return;
    }

    navigate('/map', {
      state: {
        startPoint,
        destination,
        startTime,
        endTime,
      },
    });
  };

  const hoursOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutesOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const daysOptions = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const monthsOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const yearsOptions = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() + i));

  return (
    <div className="floating-form">
      <h3>Plan Your Trip</h3>
      <form onSubmit={handleSubmit}>
        <label>Starting Point</label>
        <Autocomplete
          onLoad={(autocomplete) => (autocompleteStartRef.current = autocomplete)}
          onPlaceChanged={() => {
            const place = autocompleteStartRef.current.getPlace();
            if (place && place.formatted_address) {
              setStartPoint(place.formatted_address);
            }
          }}
        >
          <input
            type="text"
            placeholder="Your current city"
            value={startPoint}
            onChange={(e) => setStartPoint(e.target.value)}
            required
          />
        </Autocomplete>
        <br />
        <label>Destination</label>
        <Autocomplete
          onLoad={(autocomplete) => (autocompleteDestinationRef.current = autocomplete)}
          onPlaceChanged={() => {
            const place = autocompleteDestinationRef.current.getPlace();
            if (place && place.formatted_address) {
              setDestination(place.formatted_address);
            }
          }}
        >
          <input
            type="text"
            placeholder="Enter your destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </Autocomplete>
        <br />

        <div className="date-time-row">
          <div className="date-time-group">
            <label>Trip Start Date</label>
            <div className="date-selection">
              <select value={startDay} onChange={(e) => setStartDay(e.target.value)}>
                {daysOptions.map(day => <option key={day} value={day}>{day}</option>)}
              </select>
              <select value={startMonth} onChange={(e) => setStartMonth(e.target.value)}>
                {monthsOptions.map(month => <option key={month} value={month}>{month}</option>)}
              </select>
              <select value={startYear} onChange={(e) => setStartYear(e.target.value)}>
                {yearsOptions.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
            <label>Trip Start Time</label>
            <div className="time-selection">
              <select value={startHour} onChange={(e) => setStartHour(e.target.value)}>
                {hoursOptions.map(hour => <option key={hour} value={hour}>{hour}</option>)}
              </select>
              <span>:</span>
              <select value={startMinute} onChange={(e) => setStartMinute(e.target.value)}>
                {minutesOptions.map(minute => <option key={minute} value={minute}>{minute}</option>)}
              </select>
              <select value={startPeriod} onChange={(e) => setStartPeriod(e.target.value)}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          <div className="date-time-group">
            <label>Trip End Date</label>
            <div className="date-selection">
              <select value={endDay} onChange={(e) => setEndDay(e.target.value)}>
                {daysOptions.map(day => <option key={day} value={day}>{day}</option>)}
              </select>
              <select value={endMonth} onChange={(e) => setEndMonth(e.target.value)}>
                {monthsOptions.map(month => <option key={month} value={month}>{month}</option>)}
              </select>
              <select value={endYear} onChange={(e) => setEndYear(e.target.value)}>
                {yearsOptions.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
            <label>Trip End Time</label>
            <div className="time-selection">
              <select value={endHour} onChange={(e) => setEndHour(e.target.value)}>
                {hoursOptions.map(hour => <option key={hour} value={hour}>{hour}</option>)}
              </select>
              <span>:</span>
              <select value={endMinute} onChange={(e) => setEndMinute(e.target.value)}>
                {minutesOptions.map(minute => <option key={minute} value={minute}>{minute}</option>)}
              </select>
              <select value={endPeriod} onChange={(e) => setEndPeriod(e.target.value)}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit">Plan Trip</button>
      </form>
    </div>
  );
}

export default InputForm;
