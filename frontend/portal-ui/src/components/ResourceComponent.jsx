/**********************************************************************************************************
 * @file        ResourceComponent.jsx
 * @description Component to show the project details assigned to logged in user as well as
 *              handle the Resource Check-in/Check-out functionality
 * @team        SheCodes-Hub (MSITM'26 @ McComb School of Business, UT Austin)
 * @created     2025-07-26
 * @created     2025-11-12
 * @version     v2.0.0
 **********************************************************************************************************/
import React, { useEffect,useState } from "react";
import ReusableHeaderComponent from "./ReusableHeaderComponent";
import { useOutletContext,Link } from 'react-router-dom';
import { postToEndpoint, getFromEndpoint } from "../utils/apiHelpers";
import { INVENTORY_BASE } from "../utils/apiConfig";
import { showSuccess, showError } from "../utils/toastUtils";
import "../utils/spinner.css";

const ResourceComponent = () => {

  const { setIsLoggedIn } = useOutletContext();

  useEffect(() => { setIsLoggedIn(true); }, [setIsLoggedIn]);
  
  const [spinnerLoading, setSpinnerLoading] = useState(false);

  // holds checkedOut quantities per hardware [0,0]
  const [projectForm, setProjectForm] = useState({projectid: "",checkedOut: [],});

  // e.g. { hardwareid: "", capacity: 0, available: 0, userinput: 0 }
  const [hardwareForm, setHardwareForm] = useState([]);

  const [projectDataLoaded, setProjectDataLoaded] = useState(false);

  const getProjectDetails = async (event) => {
    event.preventDefault();

    try {
      setSpinnerLoading(true);
      setProjectDataLoaded(false);

      const { ok, data } = await getFromEndpoint(
        "projectstatus",
        { projectid: projectForm.projectid },
        INVENTORY_BASE                 // <—— minimal change
      );

      const response = data.response;

      if (ok) {
        setProjectForm((prev) => ({
          ...prev,
          checkedOut: response.checkedOut || [],
        }));

        const inventory = response.inventory.map((hwObj) => ({
          hardwareid: hwObj.hardwareid,
          capacity: hwObj.capacity,
          available: hwObj.available,
          userinput: 0,
        }));
        setHardwareForm(inventory);

        setProjectDataLoaded(true);
        showSuccess(`Success: ${data.message}`);
      } else {
        showError(`Error: ${data.message}`);
      }

    } catch (error) {
      showError(`Error: ${error.message}`);
    } finally {
      setSpinnerLoading(false);
    }
  };

  const handleUserInputChange = (index, value) => {
    setHardwareForm((prev) => {
      const inventoryData = [...prev];
      inventoryData[index] = { ...inventoryData[index], userinput: value }; 
      return inventoryData;
    });
  };

  const handleCheckInCheckOut = async (action) => {
    setSpinnerLoading(true);

    let anyQtyToCheckInCheckOut = 0;
    for (let i = 0; i < hardwareForm.length; i++) {
      const inputQty = hardwareForm[i].userinput;
      const available = hardwareForm[i].available;
      const checkedOut = projectForm.checkedOut[i];

      if (inputQty < 0) {
        showError(`Error: Negative quantity ${inputQty} for ${hardwareForm[i].hardwareid}.`);
        setSpinnerLoading(false);
        return;
      } 
      if (action === 'checkout' && inputQty > available) {
        showError(`Error: Cannot check out ${inputQty} quantity, only ${available} available for ${hardwareForm[i].hardwareid}.`);
        setSpinnerLoading(false);
        return;
      } 
      if (action === 'checkin' && inputQty > checkedOut) {
        showError(`Error: Cannot check in ${inputQty} quantity, when checked out is ${checkedOut} for ${hardwareForm[i].hardwareid}.`);
        setSpinnerLoading(false);
        return;
      }
      if (inputQty > 0 && anyQtyToCheckInCheckOut === 0) {
        anyQtyToCheckInCheckOut = inputQty;
      }
    }

    if (anyQtyToCheckInCheckOut === 0) {
      showError(`Error: There is nothing to ${action}.`);
      setSpinnerLoading(false);
      return;
    } 

    try {
      const inventoryPayload = hardwareForm.map((hwObj) => ({
        hardwareid: hwObj.hardwareid,
        quantity: hwObj.userinput,
      }));

      const { ok, data } = await postToEndpoint(
        "checkincheckout",
        {
          projectid: projectForm.projectid,
          inventory: inventoryPayload,
          action: action,
        },
        INVENTORY_BASE                 // <—— minimal change
      );

      if (ok) {
        showSuccess(`Success: ${data.message}`);

        setProjectForm((prev) => {
          const updatedCheckedOut = prev.checkedOut.map((qty, i) => {
            const userInputQty = hardwareForm[i].userinput;
            return action === "checkout" ? qty + userInputQty : qty - userInputQty;
          });
          return { ...prev, checkedOut: updatedCheckedOut };
        });

        const updatedForm = hardwareForm.map((hwObj) => ({
          ...hwObj,
          available: action === "checkout"
            ? hwObj.available - hwObj.userinput
            : hwObj.available + hwObj.userinput,
          userinput: 0,
        }));
        setHardwareForm(updatedForm);

      } else {
        showError(`Error: ${data.message || "Unknown error"}.`);
      }
    } catch (error) {
      showError(`Error: ${error.message}.`);
    } finally {
      setSpinnerLoading(false);
    }
  };

  return (
    <div>
      <div>
        <ReusableHeaderComponent
          title="Welcome to Resource Management"
          message="You can explore your assigned projects, view associated hardware, and manage Check-In/Check-Out of resources."
        />
      </div>

      <div style={{ width: "80vw", maxWidth: "700px", margin: "2.5rem auto" }}>
        {spinnerLoading && (
          <div className="spinner-overlay">
            <div className="spinner" />
            <p>Loading data...</p>
          </div>
        )}

        {/* Project Form */}
        <form onSubmit={getProjectDetails} style={{ marginBottom: "2rem", marginTop: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <label style={{ width: "5rem" }}>Project ID:</label>
            <input
              type="text"
              name="projectid"
              value={projectForm.projectid}
              onChange={(event) =>
                setProjectForm((prev) => ({ ...prev, projectid: event.target.value }))
              }
              required
            />
            <button style={{ marginLeft: "2rem" }} type="submit">
              Check Project
            </button>
          </div>
          <p style={{ marginTop: "20px" }}>
            Create new project? <Link to="/project">click here</Link>
          </p>
        </form>

        {/* Details */}
        {projectDataLoaded && (
          <>
            <div style={{ marginBottom: "2rem" }}>
              <table style={{width: "25vw", maxWidth: "100%", fontSize: "15px", textAlign: "center"}}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Checked Out Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {projectForm.checkedOut.map((qty, index) => (
                    <tr key={index}>
                      <td>Hardware SET {index + 1}:</td>
                      <td>{qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "2rem" }}>
              <form>
                <h6>Manage Hardware Check-In/Check-Out feature</h6>

                <table style={{width: "100%",fontSize: "15px",textAlign: "center",border: "1px solid black"}}>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Capacity</th>
                      <th>Availability</th>
                      <th>Request</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hardwareForm.map((hwObj, index) => (
                      <tr key={hwObj.hardwareid}>
                        <td>Hardware SET {index + 1}:</td>
                        <td>{hwObj.capacity}</td>
                        <td>{hwObj.available}</td>
                        <td>
                          <input 
                            type="number" 
                            value={hwObj.userinput === 0 ? "" : hwObj.userinput}
                            onChange={(event) =>
                              handleUserInputChange(index, Number(event.target.value))
                            }
                            placeholder="Enter quantity"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{display: "flex", gap: "1rem", marginTop: "1.5rem",justifyContent: "flex-end"}}>
                  <button type="button" onClick={()=>handleCheckInCheckOut("checkout")}>Check Out</button>
                  <button type="button" onClick={()=>handleCheckInCheckOut("checkin")}>Check In</button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResourceComponent;
