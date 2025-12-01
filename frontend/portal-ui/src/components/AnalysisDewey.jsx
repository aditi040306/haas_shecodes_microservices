/**********************************************************************************************************
 * @file        AnalysisDewey.jsx
 * @description Component to compute metrics for industries based on date range (Dewey API)
 * @team        SheCodes-Hub (MSITM'26 @ McCombs School of Business, UT Austin)
 * @created     2025-11-30
 * @version     v1.0.7 (Adds natural-language summary sentence)
 **********************************************************************************************************/
import React, { useState, useEffect } from 'react';
import ReusableHeaderComponent from './ReusableHeaderComponent';
import { useOutletContext } from 'react-router-dom';
import CancelButton from './CancelButton';

const MS4_URL =
  'https://shecodes-dewey-api-gmfpbtgxb4cmbkgg.canadacentral-01.azurewebsites.net';

const styles = {
  page: {
    width: '80vw',
    maxWidth: '900px',
    margin: '40px auto 60px',
  },
  formCard: {
    marginTop: '24px',
    padding: '24px 28px',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e5e5',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
  },
  formRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
    gap: '16px',
  },
  label: {
    width: '130px',
    fontWeight: 500,
    fontSize: '0.95rem',
    textAlign: 'left',
  },
  input: {
    flex: 1,
    padding: '8px 10px',
    borderRadius: '4px',
    border: '1px solid #cccccc',
    fontSize: '0.95rem',
    outline: 'none',
  },
  select: {
    flex: 1,
    padding: '8px 10px',
    borderRadius: '4px',
    border: '1px solid #cccccc',
    fontSize: '0.95rem',
    outline: 'none',
    backgroundColor: '#ffffff',
  },
  error: {
    color: '#b00020',
    marginTop: '4px',
    marginBottom: '10px',
    padding: '10px 12px',
    border: '1px solid #f2a4ab',
    borderRadius: '6px',
    backgroundColor: '#fff5f6',
    fontSize: '0.9rem',
  },
  buttonRow: {
    marginTop: '18px',
    display: 'flex',
    gap: '10px',
  },
  primaryButton: {
    padding: '8px 18px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#4b0082',
    color: '#ffffff',
    fontWeight: 500,
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  primaryButtonDisabled: {
    opacity: 0.7,
    cursor: 'default',
  },
  cancelWrapper: {
    display: 'inline-block',
  },
  // -------- Result card ----------
  resultCard: {
    marginTop: '28px',
    padding: '22px 26px',
    borderRadius: '16px',
    backgroundColor: '#faf8ff',
    border: '1px solid #d8ccff',
    boxShadow: '0 4px 10px rgba(38, 0, 89, 0.06)',
  },
  resultHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  resultHeader: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: 650,
  },
  resultHeaderAccent: {
    width: '52px',
    height: '3px',
    borderRadius: '999px',
    backgroundColor: '#4b0082',
    marginBottom: '12px',
  },
  metricChip: {
    padding: '4px 10px',
    borderRadius: '999px',
    backgroundColor: '#eee3ff',
    color: '#3a0066',
    fontSize: '0.8rem',
    fontWeight: 600,
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  resultGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: '40px',
    rowGap: '4px',
    marginBottom: '10px',
    fontSize: '0.95rem',
  },
  resultCol: {
    minWidth: '220px',
  },
  resultRow: {
    marginBottom: '4px',
  },
  resultHighlight: {
    marginTop: '12px',
    paddingTop: '10px',
    borderTop: '1px solid #e3dbff',
    fontSize: '1.05rem',
  },
  resultSentence: {
    marginTop: '6px',
    fontSize: '0.96rem',
  },
};

function AnalysisDewey() {
  const { setIsLoggedIn } = useOutletContext();

  const [industries, setIndustries] = useState([]);
  const [formData, setFormData] = useState({
    industry: '',
    startDate: '',
    endDate: '',
    metric: 'max',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchIndustries = async () => {
    setLoadingIndustries(true);
    try {
      const response = await fetch(`${MS4_URL}/industries`);
      const data = await response.json();

      if (data.status === 'success') {
        setIndustries(data.industries);

        if (data.industries.length > 0) {
          setFormData((prev) => ({
            ...prev,
            industry: data.industries[0],
          }));
        }
      } else {
        setError('Failed to load industries');
      }
    } catch (err) {
      setError('Failed to fetch industries');
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
      metric: 'max',
    });
    setResult(null);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.industry || !formData.startDate || !formData.endDate) {
      setError('Please fill in all fields');
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
        metric: formData.metric,
      };

      const response = await fetch(`${MS4_URL}/compute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setResult(data);
      } else {
        setError('Failed to compute metric');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitDisabled = loading || loadingIndustries;

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    // keep yyyy-mm-dd style for the sentence if you prefer, but
    // here I match the UI: mm/dd/yyyy
    return d.toLocaleDateString('en-US');
  };

  const getMetricWord = (metric) => {
    if (!metric) return 'selected';
    const m = metric.toLowerCase();
    if (m === 'max') return 'maximum';
    if (m === 'min') return 'minimum';
    if (m === 'avg') return 'average';
    return metric;
  };

  return (
    <div style={styles.page}>
      <ReusableHeaderComponent
        title="Welcome to Industry Metrics page"
        message=""
      />

      {/* ============================= FORM ============================= */}
      <form onSubmit={handleSubmit} style={styles.formCard}>
        {/* INDUSTRY */}
        <div style={styles.formRow}>
          <label style={styles.label}>Industry</label>
          <select
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            required
            disabled={loadingIndustries}
            style={styles.select}
          >
            {loadingIndustries ? (
              <option>Loading industries...</option>
            ) : industries.length === 0 ? (
              <option>No industries available</option>
            ) : (
              industries.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))
            )}
          </select>
        </div>

        {/* START DATE */}
        <div style={styles.formRow}>
          <label style={styles.label}>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              color: formData.startDate ? '#222' : '#aaaaaa',
              backgroundColor: formData.startDate ? '#ffffff' : '#fafafa',
            }}
          />
        </div>

        {/* END DATE */}
        <div style={styles.formRow}>
          <label style={styles.label}>End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              color: formData.endDate ? '#222' : '#aaaaaa',
              backgroundColor: formData.endDate ? '#ffffff' : '#fafafa',
            }}
          />
        </div>

        {/* METRIC */}
        <div style={styles.formRow}>
          <label style={styles.label}>Metric</label>
          <select
            name="metric"
            value={formData.metric}
            onChange={handleChange}
            required
            style={styles.select}
          >
            <option value="max">Maximum</option>
            <option value="min">Minimum</option>
            <option value="avg">Average</option>
          </select>
        </div>

        {/* ERROR BANNER */}
        {error && <div style={styles.error}>{error}</div>}

        {/* BUTTONS */}
        <div style={styles.buttonRow}>
          <button
            type="submit"
            disabled={submitDisabled}
            style={{
              ...styles.primaryButton,
              ...(submitDisabled ? styles.primaryButtonDisabled : {}),
            }}
          >
            {loading ? 'Computing…' : 'Calculate Metric'}
          </button>

          <span style={styles.cancelWrapper}>
            <CancelButton resetForm={resetForm} redirectTo="/resource" />
          </span>
        </div>
      </form>

      {/* =========================== RESULTS =========================== */}
      {result?.status === 'success' && (
        <div style={styles.resultCard}>
          <div style={styles.resultHeaderRow}>
            <h3 style={styles.resultHeader}>Analysis</h3>
            <span style={styles.metricChip}>
              {result.metric ? result.metric.toUpperCase() : 'METRIC'}
            </span>
          </div>
          <div style={styles.resultHeaderAccent} />

          <div style={styles.resultGrid}>
            <div style={styles.resultCol}>
              <div style={styles.resultRow}>
                <strong>Industry:</strong> {result.industry ?? '--'}
              </div>
              <div style={styles.resultRow}>
                <strong>Metric Type:</strong> {result.metric ?? '--'}
              </div>
            </div>

            <div style={styles.resultCol}>
              <div style={styles.resultRow}>
                <strong>Start Date:</strong>{' '}
                {formatDate(result.start_date)}
              </div>
              <div style={styles.resultRow}>
                <strong>End Date:</strong> {formatDate(result.end_date)}
              </div>
            </div>
          </div>

          {/* numeric highlight */}
          <div style={styles.resultHighlight}>
            <strong>Record Count:</strong>{' '}
            {result.record_count != null
              ? result.record_count.toLocaleString()
              : '--'}
            {'  |  '}
            <strong>Result:</strong>{' '}
            {result.result != null
              ? Number(result.result).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : '--'}
          </div>

          {/* natural-language sentence */}
          {result.result != null && (
            <div style={styles.resultSentence}>
              For the period between {formatDate(result.start_date)} and{' '}
              {formatDate(result.end_date)}, the{' '}
              {getMetricWord(result.metric)} spend amount for the{' '}
              {result.industry} industry is{' '}
              {Number(result.result).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              .
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AnalysisDewey;
