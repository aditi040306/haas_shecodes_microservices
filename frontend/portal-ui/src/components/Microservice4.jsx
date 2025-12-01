/**********************************************************************************************************
 * @file        IndustryMetricsComponent.jsx
 * @description Component to compute metrics for industries based on date range
 * @team        SheCodes-Hub (MSITM'26 @ McComb School of Business, UT Austin)
 * @created     2025-11-30
 * @version     v1.0.2 (One-Line Results Version)
 **********************************************************************************************************/
import React, { useState, useEffect } from 'react';
import ReusableHeaderComponent from './ReusableHeaderComponent';
import { useOutletContext, useNavigate } from 'react-router-dom';
import CancelButton from './CancelButton';

const MS4_URL = 'https://shecodes-dewey-api-gmfpbtgxb4cmbkgg.canadacentral-01.azurewebsites.net';

function Microservice4() {
  const { setIsLoggedIn } = useOutletContext();
  const navigate = useNavigate();

  const [industries, setIndustries] = useState([]);
  const [formData, setFormData] = useState({
    industry: '',
    startDate: '',
    endDate: '',
    metric: 'max'
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingIndustries, setLoadingIndustries] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoggedIn(true);
  }, [setIsLoggedIn]);

  useEffect(() => {
    fetchIndustries();
  }, []);

  const fetchIndustries = async () => {
    setLoadingIndustries(true);
    try {
      const response = await fetch(`${MS4_URL}/industries`);
      const data = await response.json();

      if (data.status === "success") {
        setIndustries(data.industries);

        if (data.industries.length > 0) {
          setFormData(prev => ({
            ...prev,
            industry: data.industries[0]
          }));
        }
      } else {
        setError("Failed to load industries");
      }
    } catch (err) {
      setError("Failed to fetch industries");
      console.error(err);
    } finally {
      setLoadingIndustries(false);
    }
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const resetForm = () => {
    setFormData({
      industry: industries.length > 0 ? industries[0] : '',
      startDate: '',
      endDate: '',
      metric: 'max'
    });
    setResult(null);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.industry || !formData.startDate || !formData.endDate) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const payload = {
        industry: formData.industry,
        start_date: formData.startDate,
        end_date: formData.endDate,
        metric: formData.metric
      };

      const response = await fetch(`${MS4_URL}/compute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.status === "success") {
        setResult(data);
      } else {
        setError("Failed to compute metric");
      }
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '80vw', maxWidth: '700px', margin: '40px auto' }}>
      <ReusableHeaderComponent title="Welcome to Industry Metrics page" message="" />

      {/* ============================= FORM ============================= */}
      <form onSubmit={handleSubmit}>

        {/* INDUSTRY */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px", marginTop: "2rem" }}>
          <label style={{ width: "100px" }}>Industry</label>
          <select
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            required
            style={{ flex: 1 }}
            disabled={loadingIndustries}
          >
            {loadingIndustries ? (
              <option>Loading industries...</option>
            ) : industries.length === 0 ? (
              <option>No industries available</option>
            ) : (
              industries.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))
            )}
          </select>
        </div>

        {/* START DATE */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <label style={{ width: "100px" }}>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* END DATE */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <label style={{ width: "100px" }}>End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* METRIC */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <label style={{ width: "100px" }}>Metric</label>
          <select
            name="metric"
            value={formData.metric}
            onChange={handleChange}
            required
            style={{ flex: 1 }}
          >
            <option value="max">Maximum</option>
            <option value="min">Minimum</option>
            <option value="avg">Average</option>
            
          </select>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div style={{
            color: 'red',
            marginBottom: '10px',
            padding: '10px',
            border: '1px solid red',
            borderRadius: '4px',
            backgroundColor: '#fee'
          }}>
            {error}
          </div>
        )}

        {/* BUTTONS */}
        <button type="submit" disabled={loading || loadingIndustries}>
          {loading ? "Computing..." : "Calculate Metric"}
        </button>

        <CancelButton resetForm={resetForm} redirectTo="/resource" />

      </form>

      {/* =========================== RESULTS =========================== */}
      {result?.status === "success" && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Analysis</h3>

          <div><strong>Industry:</strong> {result.industry ?? "--"}</div>
          <div><strong>Metric Type:</strong> {result.metric ?? "--"}</div>
          <div><strong>Start Date:</strong> {result.start_date ?? "--"}</div>
          <div><strong>End Date:</strong> {result.end_date ?? "--"}</div>

          {/* ================= ONE-LINE RESULT ================= */}
          <div style={{ marginTop: "15px", fontSize: "1.1em" }}>
            <strong>Record Count:</strong>{" "}
            {result.record_count != null
              ? result.record_count.toLocaleString()
              : "--"}
            {"  |  "}
            <strong>Result:</strong>{" "}
            {result.result != null
              ? Number(result.result).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : "--"}
          </div>

        </div>
      )}

    </div>
  );
}

export default Microservice4;
