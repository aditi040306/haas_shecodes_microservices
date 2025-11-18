import React, { useState } from 'react';

function Microservice4(props) {
  const [industry, setIndustry] = useState('');
  const [operation, setOperation] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [jsonData, setJsonData] = useState([]); // State to hold JSON data

  // Example JSON data (replace this with the actual JSON file data)
  const exampleJson = [
    { id: 1, name: 'Item 1', value: 100 },
    { id: 2, name: 'Item 2', value: 200 },
    { id: 3, name: 'Item 3', value: 300 },
  ];

  // Function to load JSON data (simulate receiving a file)
  const loadJsonData = () => {
    setJsonData(exampleJson); // Replace this with actual file data
  };

  return (
    <div
      className="components-section"
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        height: '100vh',
        padding: '2cm',
      }}
    >
      {/* Left Section */}
      <div style={{ flex: 1, marginRight: '2cm' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '0.5cm',
            marginBottom: '1cm',
          }}
        >
          <label
            className="tag"
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Select Industry
          </label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            aria-label="select industry"
            className="select-industry"
            style={{
              padding: '8px',
              fontSize: '14px',
            }}
          >
            <option value="">-- Select --</option>
            <option value="Home & Garden">Home & Garden</option>
            <option value="Electronics/Software">Electronics/Software</option>
            <option value="Online Retail - Broadlines">Online Retail - Broadlines</option>
            <option value="Full-Service Restaurants">Full-Service Restaurants</option>
            <option value="Convenience/Drug/Diet">Convenience/Drug/Diet</option>
            <option value="Automotive">Automotive</option>
            <option value="Telecom & Media">Telecom & Media</option>
            <option value="Ground Transportation">Ground Transportation</option>
            <option value="Third-Party Delivery Services">Third-Party Delivery Services</option>
            <option value="Consumer Packaged Goods">Consumer Packaged Goods</option>
          </select>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '0.5cm',
            marginBottom: '1cm',
          }}
        >
          <label
            className="tag"
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Operation
          </label>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            aria-label="select operation"
            className="select-operation"
            style={{
              padding: '8px',
              fontSize: '14px',
            }}
          >
            <option value="">-- Select --</option>
            <option value="Total">Total</option>
            <option value="Minimum">Minimum</option>
            <option value="Maximum">Maximum</option>
            <option value="Average">Average</option>
          </select>
        </div>

        <div
          className="date-range"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '0.5cm',
          }}
        >
          <div>
            <label htmlFor="fromDate" style={{ marginRight: '8px', fontWeight: 'bold' }}>
              From
            </label>
            <input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              name="fromDate"
              style={{ padding: '8px' }}
            />
          </div>
          <div>
            <label htmlFor="toDate" style={{ marginRight: '8px', fontWeight: 'bold' }}>
              To
            </label>
            <input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              name="toDate"
              style={{ padding: '8px' }}
            />
          </div>
        </div>

        <button
          onClick={loadJsonData}
          style={{
            marginTop: '1cm',
            padding: '10px 20px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
      </div>

      {/* Right Section: Table */}
      <div style={{ flex: 1 }}>
        <h3 style={{ textAlign: 'left' }}>Data Table</h3>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr>
              {jsonData.length > 0 &&
                Object.keys(jsonData[0]).map((key) => (
                  <th
                    key={key}
                    style={{
                      border: '1px solid black',
                      padding: '8px',
                      backgroundColor: '#f2f2f2',
                    }}
                  >
                    {key}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {jsonData.map((item, index) => (
              <tr key={index}>
                {Object.values(item).map((value, idx) => (
                  <td
                    key={idx}
                    style={{
                      border: '1px solid black',
                      padding: '8px',
                    }}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Microservice4;