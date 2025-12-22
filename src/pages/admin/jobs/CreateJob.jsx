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

  const handleChange = (e) => {
    setJobData({
      ...jobData,
      [e.target.name]: e.target.value,
    });
  };

  const navigate = useNavigate();

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
    <div>
      <h2>Create Job</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="jobNumber"
          placeholder="Job Number"
          value={jobData.jobNumber}
          onChange={handleChange}
        />

        <input
          name="vehicleNumber"
          placeholder="Vehicle Number"
          value={jobData.vehicleNumber}
          onChange={handleChange}
        />

        <input
          name="rubberType"
          placeholder="Rubber Type"
          value={jobData.rubberType}
          onChange={handleChange}
        />

        <input
          name="punchNumber"
          type="number"
          placeholder="Punch Number"
          value={jobData.punchNumber}
          onChange={handleChange}
        />

        <select
          name="processType"
          value={jobData.processType}
          onChange={handleChange}
        >
          <option value="COATING">Coating</option>
          <option value="GRINDING">Grinding</option>
        </select>

        <input
          name="companyName"
          placeholder="Company Name"
          value={jobData.companyName}
          onChange={handleChange}
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          value={jobData.price}
          onChange={handleChange}
        />

        <button type="submit">Create Job</button>
      </form>
    </div>
  );
}

export default CreateJob;
