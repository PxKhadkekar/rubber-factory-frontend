// import { useState } from "react";
// import api from "../../../api/axios";
// import { useNavigate } from "react-router-dom";


// function CreateJob() {
//   const [jobData, setJobData] = useState({
//     jobNumber: "",
//     vehicleNumber: "",
//     rubberType: "",
//     punchNumber: "",
//     processType: "COATING",
//     companyName: "",
//     price: "",
//   });

//   const handleChange = (e) => {
//     setJobData({
//       ...jobData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
  
//     try {
//       await api.post("/jobs", jobData);
//       alert("Job created successfully");
//       navigate("/admin");
//     } catch (error) {
//       console.error(error);
//       alert("Failed to create job");
//     }
//   };
  

//   return (
//     <div>
//       <h2>Create Job</h2>

//       <form onSubmit={handleSubmit}>
//         <input
//           name="jobNumber"
//           placeholder="Job Number"
//           value={jobData.jobNumber}
//           onChange={handleChange}
//         />

//         <input
//           name="vehicleNumber"
//           placeholder="Vehicle Number"
//           value={jobData.vehicleNumber}
//           onChange={handleChange}
//         />

//         <input
//           name="rubberType"
//           placeholder="Rubber Type"
//           value={jobData.rubberType}
//           onChange={handleChange}
//         />

//         <input
//           name="punchNumber"
//           type="number"
//           placeholder="Punch Number"
//           value={jobData.punchNumber}
//           onChange={handleChange}
//         />

//         <select
//           name="processType"
//           value={jobData.processType}
//           onChange={handleChange}
//         >
//           <option value="COATING">Coating</option>
//           <option value="GRINDING">Grinding</option>
//         </select>

//         <input
//           name="companyName"
//           placeholder="Company Name"
//           value={jobData.companyName}
//           onChange={handleChange}
//         />

//         <input
//           name="price"
//           type="number"
//           placeholder="Price"
//           value={jobData.price}
//           onChange={handleChange}
//         />

//         <button type="submit">Create Job</button>
//       </form>
//     </div>
//   );
// }

// export default CreateJob;




import { useState } from "react";
import api from "../../../api/axios";
import { useNavigate } from "react-router-dom";

function CreateJob() {
  const [jobData, setJobData] = useState({
    jobNumber: "",
    vehicleNumber: "",
    rubberType: "",
    punchNumber: "",
    processType: "COATING",
    companyName: "",
    price: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setJobData({
      ...jobData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/jobs", jobData);
      alert("Job created successfully");
      navigate("/admin");
    } catch (error) {
      console.error(error);
      alert("Failed to create job");
    }
  };

  return (
    <>
      <h2>Create Job</h2>
      <p>Register a new factory job</p>

      <form onSubmit={handleSubmit}>
        <table
          border="1"
          cellPadding="10"
          style={{
            marginTop: "20px",
            borderCollapse: "collapse",
            width: "100%",
            maxWidth: "750px",
          }}
        >
          <tbody>
            <tr>
              <td><strong>Job Number</strong></td>
              <td>
                <input
                  name="jobNumber"
                  value={jobData.jobNumber}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>

            <tr>
              <td><strong>Vehicle Number</strong></td>
              <td>
                <input
                  name="vehicleNumber"
                  value={jobData.vehicleNumber}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>

            <tr>
              <td><strong>Rubber Type</strong></td>
              <td>
                <input
                  name="rubberType"
                  value={jobData.rubberType}
                  onChange={handleChange}
                />
              </td>
            </tr>

            <tr>
              <td><strong>Punch Number</strong></td>
              <td>
                <input
                  name="punchNumber"
                  type="number"
                  value={jobData.punchNumber}
                  onChange={handleChange}
                />
              </td>
            </tr>

            <tr>
              <td><strong>Process Type</strong></td>
              <td>
                <select
                  name="processType"
                  value={jobData.processType}
                  onChange={handleChange}
                >
                  <option value="COATING">Coating</option>
                  <option value="GRINDING">Grinding</option>
                </select>
              </td>
            </tr>

            <tr>
              <td><strong>Company Name</strong></td>
              <td>
                <input
                  name="companyName"
                  value={jobData.companyName}
                  onChange={handleChange}
                />
              </td>
            </tr>

            <tr>
              <td><strong>Price</strong></td>
              <td>
                <input
                  name="price"
                  type="number"
                  value={jobData.price}
                  onChange={handleChange}
                />
              </td>
            </tr>

            <tr>
              <td colSpan="2" style={{ textAlign: "right" }}>
                <button type="submit">Create Job</button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </>
  );
}

export default CreateJob;
